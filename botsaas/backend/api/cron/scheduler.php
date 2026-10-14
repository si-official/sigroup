<?php
declare(strict_types=1);

/**
 * Time-based scheduler. One cron entry drives every periodic task, so adding
 * a schedule never means asking the customer to edit their cPanel cron list:
 *
 *   * * * * * /usr/bin/php /home/USER/api/cron/scheduler.php >> .../cron.log 2>&1
 *
 * It only ENQUEUES work; the worker executes it. Keeping dispatch and
 * execution separate is what lets a long rollup run inside the worker's
 * budget instead of blocking the minute tick.
 */

require_once dirname(__DIR__) . '/vendor/autoload.php';

use App\Core\Bootstrap;
use App\Core\Db;
use App\Core\Logger;
use App\Jobs\JobRunner;
use App\Jobs\Queue;

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit("This script is CLI only.\n");
}

Bootstrap::boot(dirname(__DIR__));
set_time_limit(0);

$startedAt = microtime(true);
$now       = new DateTimeImmutable('now', new DateTimeZone('UTC'));
$minute    = (int) $now->format('i');
$hour      = (int) $now->format('G');
$queued    = 0;

try {
    // ---- every minute: due message batches and follow-ups -------------------
    // Phase 7 and 10 own the handlers; the dispatch rule lives here.
    // $queued += Dispatcher::dueMessageBatches();
    // $queued += Dispatcher::dueFollowups();

    // ---- every 15 minutes: courier status sync ------------------------------
    if ($minute % 15 === 0) {
        // $queued += Queue::push('courier.sync', [], null, Queue::PRIORITY_LOW, 'courier.sync.' . $now->format('YmdHi'));
    }

    // ---- hourly: partial analytics rollup so "today" is never stale ---------
    if ($minute === 5) {
        // $queued += Queue::push('analytics.rollup', ['scope' => 'today'], null, Queue::PRIORITY_LOW,
        //                        'analytics.today.' . $now->format('YmdH'));
    }

    // ---- 02:10 UTC (08:10 Dhaka): full nightly rollup ----------------------
    if ($hour === 2 && $minute === 10) {
        // $queued += Queue::push('analytics.rollup', ['scope' => 'yesterday'], null, Queue::PRIORITY_LOW,
        //                        'analytics.full.' . $now->format('Ymd'));
    }

    // ---- 03:00 UTC: token health, expiry notices, retention ----------------
    if ($hour === 3 && $minute === 0) {
        // $queued += Queue::push('channel.token_health', [], null, Queue::PRIORITY_LOW, 'token.health.' . $now->format('Ymd'));
        // $queued += Queue::push('billing.expiry_notices', [], null, Queue::PRIORITY_LOW, 'expiry.' . $now->format('Ymd'));
        $queued += retention($now);
    }

    (new JobRunner())->heartbeat(
        'scheduler',
        (int) round((microtime(true) - $startedAt) * 1000),
        $queued,
        'ok'
    );

    printf("[%s] scheduler: queued=%d\n", $now->format('Y-m-d H:i:s'), $queued);
    exit(0);
} catch (Throwable $e) {
    Logger::exception($e, 'scheduler.crashed');
    (new JobRunner())->heartbeat('scheduler', 0, 0, 'error', $e->getMessage());
    fwrite(STDERR, '[scheduler] CRASHED: ' . $e->getMessage() . "\n");
    exit(1);
}

/**
 * Retention pruning, run inline because it is a handful of indexed DELETEs.
 * Shared-hosting databases have a hard size quota; without this the messages
 * and webhook_events tables will eventually consume it.
 */
function retention(DateTimeImmutable $now): int
{
    $pruned = 0;

    // Expired rate-limit buckets: tiny, frequent, keeps the PK hot.
    $pruned += Db::execute('DELETE FROM rate_limits WHERE expires_at < NOW() LIMIT 5000');

    // Completed jobs.
    $days = \App\Core\Env::int('RETAIN_DONE_JOBS', 7);
    $pruned += Db::execute(
        "DELETE FROM jobs
          WHERE status IN ('done','failed')
            AND completed_at < DATE_SUB(NOW(), INTERVAL :d DAY)
          LIMIT 5000",
        ['d' => $days]
    );

    // Phase 2 tables, enabled once they exist:
    // webhook_events > RETAIN_WEBHOOK_EVENTS, activity_logs > RETAIN_ACTIVITY_LOGS,
    // ai_requests > RETAIN_AI_REQUESTS. LIMIT on every delete so one pass never
    // locks a large table for minutes.

    \App\Core\Logger::prune(\App\Core\Env::int('LOG_RETENTION_DAYS', 14));

    Logger::info('retention.pruned', ['rows' => $pruned]);
    return 0; // pruning is maintenance, not queued work
}
