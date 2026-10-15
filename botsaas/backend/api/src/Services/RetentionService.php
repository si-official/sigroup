<?php
declare(strict_types=1);

namespace App\Services;

use App\Core\Db;
use App\Core\Env;
use App\Core\Logger;
use App\Repositories\OrderGuardRepository;

/**
 * Data retention.
 *
 * Shared hosting has a hard database size quota, and `messages` plus
 * `webhook_events` will consume it in months. Every DELETE is LIMITed so one
 * pass can never lock a large table for minutes — the cron runs again in a
 * minute and continues where it left off.
 *
 * A class rather than a function in the cron script so it can be tested
 * directly; an untested destructive job is how a retention bug deletes a
 * year of a customer's order history unnoticed.
 */
final class RetentionService
{
    private const BATCH = 5000;

    /** @return array<string,int> rows removed per table */
    public function prune(): array
    {
        $removed = [];

        $removed['rate_limits'] = Db::execute(
            'DELETE FROM rate_limits WHERE expires_at < NOW() LIMIT ' . self::BATCH
        );

        $removed['jobs'] = Db::execute(
            "DELETE FROM jobs
              WHERE status IN ('done','failed')
                AND completed_at < DATE_SUB(NOW(), INTERVAL :d DAY)
              LIMIT " . self::BATCH,
            ['d' => Env::int('RETAIN_DONE_JOBS', 7)]
        );

        // The fastest-growing table in the system.
        $removed['webhook_events'] = Db::execute(
            'DELETE FROM webhook_events
              WHERE received_at < DATE_SUB(NOW(), INTERVAL :d DAY)
              LIMIT ' . self::BATCH,
            ['d' => Env::int('RETAIN_WEBHOOK_EVENTS', 14)]
        );

        $removed['activity_logs'] = Db::execute(
            'DELETE FROM activity_logs
              WHERE created_at < DATE_SUB(NOW(), INTERVAL :d DAY)
              LIMIT ' . self::BATCH,
            ['d' => Env::int('RETAIN_ACTIVITY_LOGS', 90)]
        );

        // analytics_daily already holds the rollup, so per-request detail is
        // only needed for recent investigation.
        $removed['ai_requests'] = Db::execute(
            'DELETE FROM ai_requests
              WHERE created_at < DATE_SUB(NOW(), INTERVAL :d DAY)
              LIMIT ' . self::BATCH,
            ['d' => Env::int('RETAIN_AI_REQUESTS', 180)]
        );

        $removed['refresh_tokens'] = TokenService::prune();
        $removed['login_attempts'] = LoginThrottle::prune();
        $removed['order_guards']   = OrderGuardRepository::prune();

        $removed['password_resets'] = Db::execute(
            'DELETE FROM password_resets
              WHERE expires_at < DATE_SUB(NOW(), INTERVAL 7 DAY) LIMIT ' . self::BATCH
        );

        $removed['email_verifications'] = Db::execute(
            'DELETE FROM email_verifications
              WHERE expires_at < DATE_SUB(NOW(), INTERVAL 30 DAY) LIMIT ' . self::BATCH
        );

        $removed['message_batches'] = Db::execute(
            "DELETE FROM message_batches
              WHERE status = 'done' AND created_at < DATE_SUB(NOW(), INTERVAL 1 DAY)
              LIMIT " . self::BATCH
        );

        $removed['messages'] = $this->pruneMessages();

        $removed['log_files'] = Logger::prune(Env::int('LOG_RETENTION_DAYS', 14));

        $total = array_sum($removed);
        if ($total > 0) {
            Logger::info('retention.pruned', ['total' => $total, 'by_table' => array_filter($removed)]);
        }

        return $removed;
    }

    /**
     * Messages are the one table where deleting the wrong thing is
     * unrecoverable — they are the shop's record of what it promised its
     * customers. So this is deliberately conservative:
     *
     *  - defaults to a full year
     *  - RETAIN_MESSAGES=0 disables it entirely
     *  - a smaller batch than everything else
     *  - Phase 14's archive-to-cold-storage job should run BEFORE this ever
     *    deletes anything
     */
    private function pruneMessages(): int
    {
        $days = Env::int('RETAIN_MESSAGES', 365);

        if ($days <= 0) {
            return 0;
        }

        // Refuse a dangerously short retention even if someone sets it.
        if ($days < 30) {
            Logger::error('retention.messages_window_too_short', [
                'configured_days' => $days,
                'action'          => 'skipped',
            ]);
            return 0;
        }

        return Db::execute(
            'DELETE FROM messages WHERE created_at < DATE_SUB(NOW(), INTERVAL :d DAY) LIMIT 2000',
            ['d' => $days]
        );
    }

    /** What WOULD be deleted, for the admin panel. Changes nothing. */
    public function preview(): array
    {
        $counts = [];

        $counts['webhook_events'] = (int) Db::scalar(
            'SELECT COUNT(*) FROM webhook_events WHERE received_at < DATE_SUB(NOW(), INTERVAL :d DAY)',
            ['d' => Env::int('RETAIN_WEBHOOK_EVENTS', 14)]
        );
        $counts['activity_logs'] = (int) Db::scalar(
            'SELECT COUNT(*) FROM activity_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL :d DAY)',
            ['d' => Env::int('RETAIN_ACTIVITY_LOGS', 90)]
        );
        $counts['jobs'] = (int) Db::scalar(
            "SELECT COUNT(*) FROM jobs WHERE status IN ('done','failed')
               AND completed_at < DATE_SUB(NOW(), INTERVAL :d DAY)",
            ['d' => Env::int('RETAIN_DONE_JOBS', 7)]
        );
        $counts['ai_requests'] = (int) Db::scalar(
            'SELECT COUNT(*) FROM ai_requests WHERE created_at < DATE_SUB(NOW(), INTERVAL :d DAY)',
            ['d' => Env::int('RETAIN_AI_REQUESTS', 180)]
        );

        $msgDays = Env::int('RETAIN_MESSAGES', 365);
        $counts['messages'] = $msgDays > 0
            ? (int) Db::scalar(
                'SELECT COUNT(*) FROM messages WHERE created_at < DATE_SUB(NOW(), INTERVAL :d DAY)',
                ['d' => $msgDays]
            )
            : 0;

        return $counts;
    }
}
