<?php
declare(strict_types=1);

namespace App\Repositories;

use App\Core\Db;
use PDOException;

/**
 * Webhook intake. Global by design: at intake time there is no authenticated
 * tenant — the payload is what establishes one.
 *
 * CONSTRAINT 3 depends on this staying cheap: verify signature, insert here,
 * enqueue, return 200, all under 2 seconds and with zero LLM calls.
 */
final class WebhookEventRepository extends BaseRepository
{
    protected string $table = 'webhook_events';
    protected bool $tenantOwned = false;

    /**
     * Record an event exactly once.
     *
     * Returns the row id, or 0 if this exact payload was already received —
     * Meta retries aggressively, and a replay must not produce a second reply
     * to the customer. The UNIQUE index does the deduplication; we never
     * SELECT-then-INSERT, which would race.
     */
    public function recordOnce(string $source, array $payload, bool $signatureValid, ?string $externalId = null): int
    {
        $hash = hash('sha256', $source . '|' . json_encode($payload, JSON_UNESCAPED_UNICODE));

        try {
            return Db::insert('webhook_events', [
                'source'          => $source,
                'external_id'     => $externalId,
                'dedupe_hash'     => $hash,
                'signature_valid' => $signatureValid ? 1 : 0,
                'raw_payload'     => json_encode($payload, JSON_UNESCAPED_UNICODE),
                'status'          => 'received',
            ]);
        } catch (PDOException $e) {
            if ($e->getCode() === '23000') {
                return 0;
            }
            throw $e;
        }
    }

    public function markProcessed(int $id, string $status = 'processed', ?string $error = null): void
    {
        Db::execute(
            'UPDATE webhook_events SET status = :s, processed_at = NOW(3), error_message = :e WHERE id = :id',
            ['s' => $status, 'e' => $error, 'id' => $id]
        );
    }

    /** Admin monitor: volume, signature failures, processing errors. */
    public static function health(int $hours = 24): array
    {
        return Db::select(
            "SELECT source,
                    COUNT(*) AS total,
                    SUM(signature_valid = 0) AS bad_signature,
                    SUM(status = 'error')    AS errors,
                    SUM(status = 'received') AS unprocessed,
                    AVG(TIMESTAMPDIFF(MICROSECOND, received_at, processed_at) / 1000) AS avg_ms
               FROM webhook_events
              WHERE received_at >= DATE_SUB(NOW(), INTERVAL :h HOUR)
              GROUP BY source",
            ['h' => $hours]
        );
    }

    public static function prune(int $days = 14): int
    {
        return Db::execute(
            'DELETE FROM webhook_events WHERE received_at < DATE_SUB(NOW(), INTERVAL :d DAY) LIMIT 5000',
            ['d' => $days]
        );
    }
}
