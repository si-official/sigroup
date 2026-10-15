<?php
declare(strict_types=1);

namespace App\Repositories;

use App\Core\Db;
use App\Services\QuotaService;

/**
 * Reporting over subscription_usage.
 *
 * NOTE ON OWNERSHIP: the atomic increment-and-check lives in QuotaService, not
 * here, and this class deliberately does not duplicate it. Two implementations
 * of a race-safe counter would eventually diverge, and the divergence would be
 * a billing bug that only shows under load. incrementAndCheck() below is a
 * thin, explicit delegation so callers that reach for the repository still get
 * the one correct implementation.
 */
final class UsageRepository extends BaseRepository
{
    protected string $table = 'subscription_usage';

    /** @see QuotaService::consume() — the single owner of the atomic path. */
    public function incrementAndCheck(string $metric, int $amount = 1): bool
    {
        return QuotaService::forTenant((int) $this->tenantId)->consume($metric, $amount);
    }

    /** Current cycle's counters plus limits, for the dashboard meters. */
    public function currentCycle(): ?array
    {
        return $this->selectOne(
            "SELECT u.*, s.expires_at, s.started_at, p.name AS package_name
               FROM subscription_usage u
               JOIN subscriptions s ON s.id = u.subscription_id
               JOIN packages p ON p.id = s.package_id
              WHERE u.tenant_id = :t AND s.status IN ('active','trialing')
              ORDER BY u.cycle_start DESC LIMIT 1",
            ['t' => $this->tenantId]
        );
    }

    /** Token spend and cost over time, for the cost chart. */
    public function aiCostByDay(int $days = 30): array
    {
        return $this->select(
            'SELECT DATE(created_at) AS day,
                    SUM(tokens_in) AS tokens_in,
                    SUM(tokens_out) AS tokens_out,
                    SUM(cached_tokens) AS cached,
                    SUM(cost) AS cost,
                    COUNT(*) AS requests
               FROM ai_requests
              WHERE tenant_id = :t AND created_at >= DATE_SUB(CURDATE(), INTERVAL :d DAY)
              GROUP BY DATE(created_at)
              ORDER BY day',
            ['t' => $this->tenantId, 'd' => $days]
        );
    }

    public function recordAiRequest(array $data): int
    {
        $data['tenant_id'] = $this->tenantId;
        return Db::insert('ai_requests', $data);
    }

    /**
     * Platform-wide margin view: tenants whose AI cost exceeds what they pay.
     * Not tenant-scoped on purpose — this is an admin query.
     */
    public static function lossMakers(int $days = 30, int $limit = 50): array
    {
        return Db::select(
            "SELECT t.id AS tenant_id, t.name,
                    p.name AS package_name, p.price AS package_price,
                    COALESCE(SUM(ar.cost), 0) AS ai_cost,
                    COUNT(ar.id) AS requests
               FROM tenants t
               JOIN subscriptions s ON s.tenant_id = t.id AND s.status IN ('active','trialing')
               JOIN packages p ON p.id = s.package_id
               LEFT JOIN ai_requests ar
                      ON ar.tenant_id = t.id
                     AND ar.created_at >= DATE_SUB(CURDATE(), INTERVAL :d DAY)
              WHERE t.deleted_at IS NULL
              GROUP BY t.id, t.name, p.name, p.price
             HAVING ai_cost > p.price
              ORDER BY (ai_cost - p.price) DESC
              LIMIT {$limit}",
            ['d' => $days]
        );
    }
}
