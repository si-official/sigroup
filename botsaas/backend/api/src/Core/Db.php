<?php
declare(strict_types=1);

namespace App\Core;

use PDO;
use PDOException;
use PDOStatement;
use RuntimeException;
use Throwable;

/**
 * PDO singleton.
 *
 * Shared-hosting notes baked in here:
 *  - connect to 127.0.0.1, never the external srvNNNN host (that path is for
 *    remote clients and will be slow or blocked from the app itself)
 *  - no persistent connections: a shared MySQL user has a low max_user_connections
 *    and persistent handles exhaust it under webhook bursts
 *  - short timeout so a stalled DB fails fast instead of holding a PHP worker
 */
final class Db
{
    private static ?PDO $pdo = null;
    private static int $txDepth = 0;
    private static int $queryCount = 0;

    public static function pdo(): PDO
    {
        if (self::$pdo instanceof PDO) {
            return self::$pdo;
        }

        $dsn = sprintf(
            'mysql:host=%s;port=%d;dbname=%s;charset=%s',
            Env::string('DB_HOST'),
            Env::int('DB_PORT', 3306),
            Env::string('DB_DATABASE'),
            Env::string('DB_CHARSET', 'utf8mb4')
        );

        try {
            self::$pdo = new PDO(
                $dsn,
                Env::string('DB_USERNAME'),
                Env::string('DB_PASSWORD', ''),
                [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    // Real prepared statements. Emulation would let a clever
                    // payload change statement structure.
                    PDO::ATTR_EMULATE_PREPARES   => false,
                    PDO::ATTR_STRINGIFY_FETCHES  => false,
                    PDO::ATTR_PERSISTENT         => false,
                    PDO::ATTR_TIMEOUT            => Env::int('DB_TIMEOUT', 5),
                ]
            );
        } catch (PDOException $e) {
            // Never leak credentials or DSN into a response.
            Logger::critical('db.connect_failed', ['message' => $e->getMessage()]);
            throw new RuntimeException('Database connection failed.', 0, $e);
        }

        // utf8mb4 end to end, and strict mode so a silent truncation of Bangla
        // text becomes an error instead of corrupted data.
        self::$pdo->exec("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci");
        self::$pdo->exec("SET SESSION sql_mode = 'STRICT_ALL_TABLES,NO_ENGINE_SUBSTITUTION'");
        self::$pdo->exec("SET SESSION time_zone = '+00:00'"); // store UTC, render in Asia/Dhaka

        return self::$pdo;
    }

    public static function run(string $sql, array $bindings = []): PDOStatement
    {
        self::$queryCount++;
        $stmt = self::pdo()->prepare($sql);
        foreach ($bindings as $key => $value) {
            $param = is_int($key) ? $key + 1 : (str_starts_with((string) $key, ':') ? $key : ':' . $key);
            $type = match (true) {
                is_int($value)  => PDO::PARAM_INT,
                is_bool($value) => PDO::PARAM_BOOL,
                is_null($value) => PDO::PARAM_NULL,
                default         => PDO::PARAM_STR,
            };
            $stmt->bindValue($param, $value, $type);
        }
        $stmt->execute();
        return $stmt;
    }

    /** @return array<int,array<string,mixed>> */
    public static function select(string $sql, array $bindings = []): array
    {
        return self::run($sql, $bindings)->fetchAll();
    }

    /** @return array<string,mixed>|null */
    public static function selectOne(string $sql, array $bindings = []): ?array
    {
        $row = self::run($sql, $bindings)->fetch();
        return $row === false ? null : $row;
    }

    public static function scalar(string $sql, array $bindings = []): mixed
    {
        $v = self::run($sql, $bindings)->fetchColumn();
        return $v === false ? null : $v;
    }

    public static function insert(string $table, array $data): int
    {
        $cols = array_keys($data);
        $sql = sprintf(
            'INSERT INTO `%s` (%s) VALUES (%s)',
            $table,
            implode(', ', array_map(fn ($c) => "`{$c}`", $cols)),
            implode(', ', array_map(fn ($c) => ':' . $c, $cols))
        );
        self::run($sql, $data);
        return (int) self::pdo()->lastInsertId();
    }

    /** Rows affected. */
    public static function execute(string $sql, array $bindings = []): int
    {
        return self::run($sql, $bindings)->rowCount();
    }

    /**
     * Transaction with savepoint-based nesting, so a service that opens a
     * transaction can safely call another service that does the same.
     *
     * @template T
     * @param callable():T $fn
     * @return T
     */
    public static function transaction(callable $fn): mixed
    {
        $pdo = self::pdo();

        if (self::$txDepth === 0) {
            $pdo->beginTransaction();
        } else {
            $pdo->exec('SAVEPOINT sp' . self::$txDepth);
        }
        self::$txDepth++;

        try {
            $result = $fn();
            self::$txDepth--;
            if (self::$txDepth === 0) {
                $pdo->commit();
            } else {
                $pdo->exec('RELEASE SAVEPOINT sp' . self::$txDepth);
            }
            return $result;
        } catch (Throwable $e) {
            self::$txDepth--;
            if (self::$txDepth === 0) {
                if ($pdo->inTransaction()) {
                    $pdo->rollBack();
                }
            } else {
                $pdo->exec('ROLLBACK TO SAVEPOINT sp' . self::$txDepth);
            }
            throw $e;
        }
    }

    public static function inTransaction(): bool
    {
        return self::$txDepth > 0;
    }

    public static function queryCount(): int
    {
        return self::$queryCount;
    }

    /** Health probe. Cheap, no table dependency. */
    public static function ping(): bool
    {
        try {
            return self::scalar('SELECT 1') !== null;
        } catch (Throwable) {
            return false;
        }
    }

    public static function version(): string
    {
        try {
            return (string) self::scalar('SELECT VERSION()');
        } catch (Throwable) {
            return 'unknown';
        }
    }

    /** Test seam only. */
    public static function reset(): void
    {
        self::$pdo = null;
        self::$txDepth = 0;
    }
}
