<?php
declare(strict_types=1);

/**
 * One concurrent quota consumer. Spawned N times by tests/quota_race.php.
 *
 *   php tests/support/quota_worker.php <tenant_id> <metric> <start_unix_micro>
 *
 * Prints "1" if it got the quota, "0" if blocked, "E:<msg>" on error.
 *
 * The start timestamp is a BARRIER: every worker busy-waits until the same
 * microsecond before touching the database. Without it the processes stagger
 * by tens of milliseconds as PHP boots, the contention window never opens,
 * and the test would pass vacuously without ever exercising the race.
 */

require_once dirname(__DIR__, 2) . '/vendor/autoload.php';

use App\Core\Bootstrap;
use App\Services\QuotaService;

Bootstrap::boot(dirname(__DIR__, 2));

$tenantId = (int) ($argv[1] ?? 0);
$metric   = (string) ($argv[2] ?? 'fb_messages');
$startAt  = (float) ($argv[3] ?? 0);

try {
    // Connect and resolve limits BEFORE the barrier, so the only thing
    // happening after it is the conditional UPDATE itself.
    $quota = QuotaService::forTenant($tenantId);

    if ($startAt > 0) {
        while (microtime(true) < $startAt) {
            // spin — usleep would reintroduce scheduling jitter
        }
    }

    echo $quota->consume($metric, 1) ? '1' : '0';
} catch (Throwable $e) {
    echo 'E:' . $e->getMessage();
}
