<?php
declare(strict_types=1);

/**
 * CLI migration runner.
 *
 *   php cli/migrate.php              apply pending
 *   php cli/migrate.php --dry-run    show what would run
 *   php cli/migrate.php --status     list applied / pending / drift
 */

require_once dirname(__DIR__) . '/vendor/autoload.php';

use App\Core\Bootstrap;
use App\Database\Migrator;

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit("CLI only. Use POST /api/_migrate with the migration secret instead.\n");
}

Bootstrap::boot(dirname(__DIR__));

$args   = array_slice($argv, 1);
$dryRun = in_array('--dry-run', $args, true);
$status = in_array('--status', $args, true);

$migrator = new Migrator(dirname(__DIR__) . '/database/migrations');

try {
    if ($status) {
        printf("%-40s %-10s %s\n", 'MIGRATION', 'APPLIED', 'DRIFT');
        foreach ($migrator->status() as $row) {
            printf(
                "%-40s %-10s %s\n",
                $row['file'],
                $row['applied'] ? 'yes' : 'NO',
                $row['drift'] ? 'YES — file edited after apply' : '-'
            );
        }
        exit(0);
    }

    $result = $migrator->run($dryRun);

    foreach ($migrator->output() as $line) {
        echo $line . "\n";
    }

    if ($result['drift'] !== []) {
        fwrite(STDERR, "\nWARNING: drift detected in: " . implode(', ', $result['drift'])
            . "\nApplied migrations must never be edited. Add a new migration instead.\n");
        exit(2);
    }

    exit(0);
} catch (Throwable $e) {
    fwrite(STDERR, 'Migration failed: ' . $e->getMessage() . "\n");
    exit(1);
}
