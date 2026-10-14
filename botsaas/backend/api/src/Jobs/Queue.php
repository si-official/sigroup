<?php
declare(strict_types=1);

namespace App\Jobs;

use App\Core\Db;
use App\Core\Logger;
use PDOException;

/**
 * Enqueue side of the cron-driven queue.
 *
 * `dedupe_key` is the important part. Meta retries a webhook it believes
 * failed, and a user double-taps "send to courier". Both must result in one
 * job, not two. The UNIQUE index makes the second insert a no-op rather than
 * something the handler has to be idempotent about on its own.
 */
final class Queue
{
    public const PRIORITY_URGENT = 1;   // sending a reply a customer is waiting for
    public const PRIORITY_HIGH   = 3;   // AI generation
    public const PRIORITY_NORMAL = 5;   // courier push, notifications
    public const PRIORITY_LOW    = 8;   // analytics rollups, cleanup

    /**
     * @param array<string,mixed> $payload
     * @return int job id, or 0 when deduplicated
     */
    public static function push(
        string $type,
        array $payload,
        ?int $tenantId = null,
        int $priority = self::PRIORITY_NORMAL,
        ?string $dedupeKey = null,
        int $delaySeconds = 0
    ): int {
        $availableAt = $delaySeconds > 0
            ? date('Y-m-d H:i:s', time() + $delaySeconds)
            : date('Y-m-d H:i:s');

        try {
            $id = Db::insert('jobs', [
                'tenant_id'    => $tenantId,
                'type'         => $type,
                'payload'      => json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR),
                'priority'     => $priority,
                'available_at' => $availableAt,
                'dedupe_key'   => $dedupeKey,
                'status'       => 'pending',
            ]);

            Logger::debug('queue.pushed', ['type' => $type, 'job_id' => $id, 'priority' => $priority]);
            return $id;
        } catch (PDOException $e) {
            // 23000 = integrity constraint: the dedupe key already exists.
            if ($e->getCode() === '23000' && $dedupeKey !== null) {
                Logger::debug('queue.deduplicated', ['type' => $type, 'dedupe_key' => $dedupeKey]);
                return 0;
            }
            throw $e;
        }
    }

    /** Schedule a job for a future wall-clock time (follow-ups, batch flush). */
    public static function pushAt(
        string $type,
        array $payload,
        string $runAt,
        ?int $tenantId = null,
        int $priority = self::PRIORITY_NORMAL,
        ?string $dedupeKey = null
    ): int {
        $delay = max(0, strtotime($runAt) - time());
        return self::push($type, $payload, $tenantId, $priority, $dedupeKey, $delay);
    }

    /** @return array{pending:int,reserved:int,failed:int,oldest_pending_age_sec:int} */
    public static function depth(): array
    {
        $row = Db::selectOne(
            "SELECT
               SUM(status = 'pending')  AS pending,
               SUM(status = 'reserved') AS reserved,
               SUM(status = 'failed')   AS failed,
               COALESCE(TIMESTAMPDIFF(SECOND, MIN(CASE WHEN status = 'pending' THEN available_at END), NOW()), 0) AS age
             FROM jobs
             WHERE status IN ('pending','reserved','failed')"
        ) ?? [];

        return [
            'pending'                => (int) ($row['pending'] ?? 0),
            'reserved'               => (int) ($row['reserved'] ?? 0),
            'failed'                 => (int) ($row['failed'] ?? 0),
            'oldest_pending_age_sec' => max(0, (int) ($row['age'] ?? 0)),
        ];
    }
}
