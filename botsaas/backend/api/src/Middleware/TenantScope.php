<?php
declare(strict_types=1);

namespace App\Middleware;

use App\Core\ApiException;
use App\Core\Context;
use App\Core\Db;
use App\Core\ForbiddenException;
use App\Core\Logger;
use App\Core\Request;
use App\Core\Response;

/**
 * Loads tenant + active subscription + EFFECTIVE LIMITS into the context.
 *
 * Limits resolution order, implemented here so that every downstream check
 * reads one already-resolved array instead of re-deriving the rules:
 *
 *   1. subscriptions.limits_snapshot   what the tenant actually paid for
 *   2. packages row                    fallback for legacy/missing snapshots
 *   3. credit-mode thresholds          when wallets.billing_mode = 'credit',
 *                                      unlocks come from lifetime deposits,
 *                                      not from a package
 *
 * An EXPIRED subscription does not block the request here. It yields limits
 * with every channel disabled, which turns the panel read-only while keeping
 * login and historical data intact. Deleting or hard-blocking on expiry is how
 * you turn a lapsed renewal into a lost customer.
 */
final class TenantScope implements MiddlewareInterface
{
    public function handle(Request $request, callable $next): Response
    {
        $ctx = Context::current();

        if (!$ctx->isAuthenticated()) {
            throw new ForbiddenException('Tenant scope requires authentication.', 'TENANT_CONTEXT_MISSING');
        }

        $tenantId = $ctx->tenantIdOrNull();

        if ($tenantId === null) {
            // Platform staff hitting a tenant-scoped route without act_as.
            throw new ForbiddenException(
                'This endpoint requires a tenant context. Platform staff must impersonate a tenant.',
                'TENANT_CONTEXT_MISSING'
            );
        }

        $tenant = Db::selectOne(
            'SELECT id, name, slug, status, timezone, currency, onboarding_step
               FROM tenants
              WHERE id = :id AND deleted_at IS NULL',
            ['id' => $tenantId]
        );

        if ($tenant === null) {
            throw new ForbiddenException('Tenant not found.', 'TENANT_NOT_FOUND');
        }

        if ($tenant['status'] === 'suspended') {
            throw new ApiException(
                'TENANT_SUSPENDED',
                'This account has been suspended. Please contact support.',
                403
            );
        }

        $subscription = $this->loadSubscription($tenantId);
        $wallet       = $this->loadWallet($tenantId);
        $limits       = $this->resolveLimits($subscription, $wallet);

        $ctx->setTenant($tenant, $subscription, $limits);

        return $next($request);
    }

    /** @return array<string,mixed> */
    private function loadSubscription(int $tenantId): array
    {
        $row = Db::selectOne(
            "SELECT s.id, s.package_id, s.status, s.started_at, s.expires_at,
                    s.limits_snapshot, p.name AS package_name, p.slug AS package_slug
               FROM subscriptions s
               JOIN packages p ON p.id = s.package_id
              WHERE s.tenant_id = :t
              ORDER BY FIELD(s.status, 'active', 'trialing', 'expired', 'cancelled'),
                       s.expires_at DESC
              LIMIT 1",
            ['t' => $tenantId]
        );

        if ($row === null) {
            return ['status' => 'none', 'expires_at' => null];
        }

        // Lazily mark an elapsed subscription expired. The nightly cron does
        // this too; doing it here as well means the panel never shows "active"
        // for a subscription that ran out an hour ago.
        if (
            in_array($row['status'], ['active', 'trialing'], true)
            && strtotime((string) $row['expires_at']) < time()
        ) {
            Db::execute("UPDATE subscriptions SET status = 'expired' WHERE id = :id", ['id' => $row['id']]);
            $row['status'] = 'expired';
            Logger::info('subscription.lazily_expired', ['tenant_id' => $tenantId, 'subscription_id' => $row['id']]);
        }

        return $row;
    }

    /** @return array<string,mixed> */
    private function loadWallet(int $tenantId): array
    {
        return Db::selectOne(
            'SELECT balance, lifetime_deposited, billing_mode FROM wallets WHERE tenant_id = :t',
            ['t' => $tenantId]
        ) ?? ['balance' => '0.00', 'lifetime_deposited' => '0.00', 'billing_mode' => 'subscription'];
    }

    /**
     * @param array<string,mixed> $subscription
     * @param array<string,mixed> $wallet
     * @return array<string,mixed>
     */
    private function resolveLimits(array $subscription, array $wallet): array
    {
        $allOff = [
            'fb_enabled' => false, 'wa_enabled' => false, 'ig_enabled' => false,
            'widget_enabled' => false, 'voice_mode' => 'none',
            'msg_limit' => 0, 'comment_reply_limit' => 0, 'faq_rule_limit' => 0,
            'product_limit' => 0, 'staff_seat_limit' => 1,
            'courier_enabled' => false, 'shop_assistant_enabled' => false,
            'api_access_enabled' => false, 'ai_credit_type' => 'system',
            '_source' => 'expired',
        ];

        // --- 3. Credit mode: limits come from lifetime deposits ---
        if (($wallet['billing_mode'] ?? 'subscription') === 'credit') {
            $deposited = (float) ($wallet['lifetime_deposited'] ?? 0);
            $balance   = (float) ($wallet['balance'] ?? 0);

            return [
                'fb_enabled'             => true,
                'wa_enabled'             => $deposited >= 500,
                'ig_enabled'             => $deposited >= 500,
                'widget_enabled'         => $deposited >= 2000,
                'voice_mode'             => $deposited >= 2000 ? 'both' : 'stt',
                // In credit mode spending is capped by money, not a message count.
                'msg_limit'              => null,
                'comment_reply_limit'    => null,
                'faq_rule_limit'         => null,
                'product_limit'          => $deposited >= 2000 ? null : 50,
                'staff_seat_limit'       => 3,
                'courier_enabled'        => true,
                'shop_assistant_enabled' => true,
                'api_access_enabled'     => $deposited >= 5000,
                'ai_credit_type'         => 'system',
                'wallet_balance'         => $balance,
                'has_balance'            => $balance > 0,
                '_source'                => 'credit',
            ];
        }

        $status = (string) ($subscription['status'] ?? 'none');
        if (!in_array($status, ['active', 'trialing'], true)) {
            return $allOff;
        }

        // --- 1. limits_snapshot: authoritative, immune to later package edits ---
        $snapshot = $subscription['limits_snapshot'] ?? null;
        if (is_string($snapshot) && $snapshot !== '') {
            $decoded = json_decode($snapshot, true);
            if (is_array($decoded) && $decoded !== []) {
                $decoded['_source'] = 'snapshot';
                return $decoded;
            }
        }

        // --- 2. Fall back to the live packages row ---
        $package = Db::selectOne(
            'SELECT msg_limit, comment_reply_limit, faq_rule_limit, product_limit,
                    staff_seat_limit, voice_msg_limit, voice_duration_sec,
                    fb_enabled, wa_enabled, ig_enabled, widget_enabled, voice_mode,
                    courier_enabled, shop_assistant_enabled, api_access_enabled,
                    ai_credit_type, model_profile_id
               FROM packages WHERE id = :id',
            ['id' => $subscription['package_id'] ?? 0]
        );

        if ($package === null) {
            Logger::error('limits.package_missing', ['subscription' => $subscription['id'] ?? null]);
            return $allOff;
        }

        foreach (['fb_enabled', 'wa_enabled', 'ig_enabled', 'widget_enabled',
                  'courier_enabled', 'shop_assistant_enabled', 'api_access_enabled'] as $flag) {
            $package[$flag] = (bool) $package[$flag];
        }

        $package['_source'] = 'package';
        return $package;
    }
}
