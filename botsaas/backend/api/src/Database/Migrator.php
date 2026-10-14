<?php
declare(strict_types=1);

namespace App\Database;

use App\Core\Db;
use App\Core\Logger;
use PDOException;
use RuntimeException;
use Throwable;

/**
 * Minimal forward-only migration runner.
 *
 * Design choices, each one earned the hard way on shared hosting:
 *  - FILENAME ORDER, not timestamps in a table. `ls` tells you the order.
 *  - CHECKSUMS. An applied file that later changes is reported as drift
 *    instead of being silently ignored, which is how two environments quietly
 *    diverge and a deploy "works on staging".
 *  - NO DOWN MIGRATIONS. Rollback on a live multi-tenant DB is a trap; the
 *    rule from Phase 14 is additive-only changes, so there is nothing to undo.
 *  - STATEMENT SPLITTING that respects quotes and comments, because a Bangla
 *    seed string containing a semicolon must not split a statement.
 */
final class Migrator
{
    /** @var string[] */
    private array $log = [];

    public function __construct(private string $migrationsPath)
    {
        if (!is_dir($this->migrationsPath)) {
            throw new RuntimeException("Migrations directory not found: {$this->migrationsPath}");
        }
    }

    /**
     * @return array{applied:string[],skipped:string[],drift:string[],batch:int}
     */
    public function run(bool $dryRun = false): array
    {
        $this->ensureMigrationsTable();

        $applied = $this->appliedMap();
        $batch   = $this->nextBatch();

        $files   = $this->discover();
        $ran     = [];
        $skipped = [];
        $drift   = [];

        foreach ($files as $file) {
            $name     = basename($file);
            $contents = (string) file_get_contents($file);
            $checksum = hash('sha256', $contents);

            if (isset($applied[$name])) {
                if (!hash_equals($applied[$name], $checksum)) {
                    // Applied, but the file has since been edited.
                    $drift[] = $name;
                    $this->note("DRIFT   {$name} — file changed after being applied. "
                        . 'Write a new migration instead of editing this one.');
                } else {
                    $skipped[] = $name;
                }
                continue;
            }

            if ($dryRun) {
                $ran[] = $name;
                $this->note("WOULD RUN {$name}");
                continue;
            }

            $startedAt = microtime(true);

            try {
                // Each file runs in its own transaction where MySQL allows it.
                // DDL is not transactional in MySQL, so a file mixing DDL and
                // DML can partially apply — hence one logical change per file.
                foreach ($this->splitStatements($contents) as $statement) {
                    Db::pdo()->exec($statement);
                }
            } catch (PDOException $e) {
                $this->note("FAILED  {$name}: " . $e->getMessage());
                Logger::critical('migration.failed', ['file' => $name, 'message' => $e->getMessage()]);
                throw new RuntimeException("Migration {$name} failed: " . $e->getMessage(), 0, $e);
            }

            $ms = (int) round((microtime(true) - $startedAt) * 1000);

            Db::insert('migrations', [
                'filename'    => $name,
                'checksum'    => $checksum,
                'batch'       => $batch,
                'duration_ms' => $ms,
            ]);

            $ran[] = $name;
            $this->note("APPLIED {$name} ({$ms}ms)");
            Logger::info('migration.applied', ['file' => $name, 'ms' => $ms]);
        }

        if ($ran === [] && $drift === []) {
            $this->note('Nothing to migrate — database is up to date.');
        }

        return ['applied' => $ran, 'skipped' => $skipped, 'drift' => $drift, 'batch' => $batch];
    }

    public function status(): array
    {
        $this->ensureMigrationsTable();
        $applied = $this->appliedMap();
        $rows = [];

        foreach ($this->discover() as $file) {
            $name     = basename($file);
            $checksum = hash('sha256', (string) file_get_contents($file));
            $rows[] = [
                'file'    => $name,
                'applied' => isset($applied[$name]),
                'drift'   => isset($applied[$name]) && !hash_equals($applied[$name], $checksum),
            ];
        }
        return $rows;
    }

    private function ensureMigrationsTable(): void
    {
        // Bootstrapped here rather than in 001, so the runner works against a
        // completely empty database.
        Db::pdo()->exec(
            'CREATE TABLE IF NOT EXISTS migrations (
                id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                filename    VARCHAR(190) NOT NULL UNIQUE,
                checksum    CHAR(64)     NOT NULL,
                batch       INT UNSIGNED NOT NULL,
                duration_ms INT UNSIGNED NOT NULL DEFAULT 0,
                applied_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
             ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
        );
    }

    /** @return array<string,string> filename => checksum */
    private function appliedMap(): array
    {
        $map = [];
        foreach (Db::select('SELECT filename, checksum FROM migrations') as $row) {
            $map[$row['filename']] = $row['checksum'];
        }
        return $map;
    }

    private function nextBatch(): int
    {
        return ((int) Db::scalar('SELECT COALESCE(MAX(batch), 0) FROM migrations')) + 1;
    }

    /** @return string[] */
    private function discover(): array
    {
        $files = glob($this->migrationsPath . '/*.sql') ?: [];
        // Natural sort so 002 < 010, and 10 does not precede 2.
        usort($files, fn (string $a, string $b) => strnatcmp(basename($a), basename($b)));
        return $files;
    }

    /**
     * Split on semicolons that are not inside a string literal or a comment.
     * A naive explode(';') breaks on any seeded Bangla prompt containing one.
     *
     * @return string[]
     */
    private function splitStatements(string $sql): array
    {
        $statements = [];
        $current    = '';
        $length     = strlen($sql);
        $inSingle   = false;
        $inDouble   = false;
        $inBacktick = false;
        $inLineComment  = false;
        $inBlockComment = false;

        for ($i = 0; $i < $length; $i++) {
            $char = $sql[$i];
            $next = $sql[$i + 1] ?? '';

            if ($inLineComment) {
                if ($char === "\n") {
                    $inLineComment = false;
                    $current .= $char;
                }
                continue;
            }

            if ($inBlockComment) {
                if ($char === '*' && $next === '/') {
                    $inBlockComment = false;
                    $i++;
                }
                continue;
            }

            if (!$inSingle && !$inDouble && !$inBacktick) {
                if ($char === '-' && $next === '-') { $inLineComment = true; continue; }
                if ($char === '#')                  { $inLineComment = true; continue; }
                if ($char === '/' && $next === '*') { $inBlockComment = true; $i++; continue; }
            }

            if ($char === "'" && !$inDouble && !$inBacktick) {
                // Doubled '' is an escaped quote, not a terminator.
                if ($inSingle && $next === "'") { $current .= "''"; $i++; continue; }
                $inSingle = !$inSingle;
            } elseif ($char === '"' && !$inSingle && !$inBacktick) {
                $inDouble = !$inDouble;
            } elseif ($char === '`' && !$inSingle && !$inDouble) {
                $inBacktick = !$inBacktick;
            } elseif ($char === '\\' && ($inSingle || $inDouble)) {
                $current .= $char . $next;
                $i++;
                continue;
            }

            if ($char === ';' && !$inSingle && !$inDouble && !$inBacktick) {
                $trimmed = trim($current);
                if ($trimmed !== '') {
                    $statements[] = $trimmed;
                }
                $current = '';
                continue;
            }

            $current .= $char;
        }

        $trimmed = trim($current);
        if ($trimmed !== '') {
            $statements[] = $trimmed;
        }

        return $statements;
    }

    private function note(string $line): void
    {
        $this->log[] = $line;
    }

    /** @return string[] */
    public function output(): array
    {
        return $this->log;
    }
}
