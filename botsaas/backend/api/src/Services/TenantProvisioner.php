<?php
declare(strict_types=1);

namespace App\Services;

use App\Core\Db;

/**
 * Shared tenant-context loading, used by TenantScope middleware and by jobs
 * that run outside any request. Keeps the "what is this tenant allowed to do"
 * answer identical in both paths.
 */
final class TenantProvisioner
{
    private LimitsResolver $limits;

    public function __construct(?LimitsResolver $limits = null)
    {
        $this->limits = $limits ?? new LimitsResolver();
    }

    /** @return array{tenant:?array,subscription:array,limits:array}|null */
    public function load(int $tenantId): ?array
    {
        $tenant = Db::selectOne(
            'SELECT id, name, slug, status, timezone, currency, onboarding_step, owner_user_id
               FROM tenants
              WHERE id = :id AND deleted_at IS NULL',
            ['id' => $tenantId]
        );

        if ($tenant === null) {
            return null;
        }

        $subscription = Db::selectOne(
            "SELECT s.id, s.package_id, s.status, s.started_at, s.expires_at, s.limits_snapshot,
                    p.name AS package_name, p.slug AS package_slug, p.price AS package_price
               FROM subscriptions s
               JOIN packages p ON p.id = s.package_id
              WHERE s.tenant_id = :t
              ORDER BY FIELD(s.status, 'active', 'trialing', 'expired', 'cancelled'), s.expires_at DESC
              LIMIT 1",
            ['t' => $tenantId]
        ) ?? ['status' => 'none', 'expires_at' => null];

        // Lazily expire. The nightly cron does this too, but doing it here as
        // well means the panel never shows "active" for a plan that ran out an
        // hour ago.
        if (
            in_array($subscription['status'] ?? '', ['active', 'trialing'], true)
            && strtotime((string) $subscription['expires_at']) < time()
        ) {
            Db::execute("UPDATE subscriptions SET status = 'expired' WHERE id = :id", ['id' => $subscription['id']]);
            $subscription['status'] = 'expired';
        }

        $wallet = Db::selectOne(
            'SELECT balance, lifetime_deposited, billing_mode FROM wallets WHERE tenant_id = :t',
            ['t' => $tenantId]
        ) ?? ['balance' => '0.00', 'lifetime_deposited' => '0.00', 'billing_mode' => 'subscription'];

        return [
            'tenant'       => $tenant,
            'subscription' => $subscription,
            'limits'       => $this->limits->resolve($subscription, $wallet),
        ];
    }
}
