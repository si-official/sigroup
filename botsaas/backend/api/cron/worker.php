<?php
declare(strict_types=1);

/**
 * Queue worker. Install as a 1-minute cron:
 *
 *   * * * * * /usr/bin/php /home/USER/api/cron/worker.php >> /home/USER/api/storage/logs/cron.log 2>&1
 *
 * Safe to overlap: jobs are claimed with FOR UPDATE SKIP LOCKED, so a slow run
 * and the next tick take different rows.
 */

require_once dirname(__DIR__) . '/vendor/autoload.php';

use App\Core\Bootstrap;
use App\Core\Logger;
use App\Jobs\JobRunner;

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit("This script is CLI only.\n");
}

$basePath = dirname(__DIR__);
Bootstrap::boot($basePath);

// No wall-clock limit from PHP itself; JobRunner enforces its own budget so
// the stop is graceful rather than a kill mid-job.
set_time_limit(0);

$runner = new JobRunner();

// Handler registry. Phases 6-12 register their types here; an unknown type is
// failed immediately rather than retried, so a stale enqueue cannot loop.
// $runner->register('webhook.process',  \App\Jobs\Handlers\ProcessWebhook::class);
// $runner->register('ai.reply',         \App\Jobs\Handlers\GenerateAiReply::class);
// $runner->register('message.send',     \App\Jobs\Handlers\SendMessage::class);
// $runner->register('batch.flush',      \App\Jobs\Handlers\FlushMessageBatch::class);
// $runner->register('followup.send',    \App\Jobs\Handlers\SendFollowup::class);
// $runner->register('comment.handle',   \App\Jobs\Handlers\HandleComment::class);
// $runner->register('courier.push',     \App\Jobs\Handlers\PushToCourier::class);
// $runner->register('courier.sync',     \App\Jobs\Handlers\SyncCourierStatus::class);
// $runner->register('analytics.rollup', \App\Jobs\Handlers\RollupAnalytics::class);
// $runner->register('notify.email',     \App\Jobs\Handlers\SendEmail::class);

try {
    $result = $runner->run();

    printf(
        "[%s] worker: processed=%d failed=%d reclaimed=%d in %dms\n",
        gmdate('Y-m-d H:i:s'),
        $result['processed'],
        $result['failed'],
        $result['reclaimed'],
        $result['duration_ms']
    );

    exit($result['failed'] > 0 ? 1 : 0);
} catch (Throwable $e) {
    Logger::exception($e, 'worker.crashed');
    fwrite(STDERR, '[worker] CRASHED: ' . $e->getMessage() . "\n");
    exit(1);
}
