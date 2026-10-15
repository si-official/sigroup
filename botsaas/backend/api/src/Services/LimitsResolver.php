<?php
declare(strict_types=1);

namespace App\Services;

use App\Core\Db;
use App\Core\Logger;

/**
 * Resolves the EFFECTIVE limits for a tenant, in exactly one place.
 *
 * Resolution order, as specified:
 *   1. subscriptions.limits_snapshot   what the tenant actually paid for
 *   2. packages row                    fallback for legacy/missing snapshots
 *   3. wallet credit mode              when billing_mode='credit', unlocks come
 *                                      from lifetime deposits, not a package
 *
 * Credit mode is checked FIRST even though it is listed third, because it is a
 * different billing universe rather than a fallback: a tenant in credit mode
 * has no meaningful package, so consulting the snapshot would produce limits
 * they are not on.
 *
 * Extracted from TenantScope middleware so QuotaService, the jobs that run
 * outside any request, and the admin panel all resolve limits identically.
 * Two implementations of this rule would eventually disagree, and the
 * disagreement would be a billing bug.
 */
final class LimitsResolver
{
    /** Every channel off, nothing writable. Returned for expired/absent subs. */
    public const EXPIRED = [
        'fb_enabled' => false, 'wa_enabled' => false, 'ig_enabled' => false,
        'widget_enabled' => false, 'voice_mode' => 'none',
        'msg_limit' => 0, 'comment_reply_limit' => 0, 'faq_rule_limit' => 0,
        'product_limit' => 0, 'staff_seat_limit' => 1,
        'voice_msg_limit' => 0, 'voice_duration_sec' => 0,
        'courier_enabled' => false, 'shop_assistant_enabled' => false,
        'api_access_enabled' => false, 'ai_credit_type' => 'system',
        'read_only' => true,
        '_source' => 'expired',
    ];

    private const BOOL_FIELDS = [
        'fb_enabled', 'wa_enabled', 'ig_enabled', 'widget_enabled',
        'courier_enabled', 'shop_assistant_enabled', 'api_access_enabled',
    ];

    /** Credit-mode unlock thresholds, in BDT of lifetime deposits. */
    private const CREDIT_THRESHOLDS = [
        'wa_enabled'         => 500,
        'ig_enabled'         => 500,
        'widget_enabled'     => 2000,
        'voice_both'         => 2000,
        'unlimited_products' => 2000,
        'api_access_enabled' => 5000,
    ];

    /**
     * @param array<string,mixed> $subscription
     * @param array<string,mixed> $wallet
     * @return array<string,mixed>
     */
    public function resolve(array $subscription, array $wallet): array
    {
        if (($wallet['billing_mode'] ?? 'subscription') === 'credit') {
            return $this->fromCredit($wallet);
        }

        $status = (string) ($subscription['status'] ?? 'none');
        if (!in_array($status, ['active', 'trialing'], true)) {
            return self::EXPIRED;
        }

        $fromSnapshot = $this->fromSnapshot($subscription);
        if ($fromSnapshot !== null) {
            return $fromSnapshot;
        }

        return $this->fromPackage($subscription);
    }

    /** Convenience: resolve straight from a tenant id (jobs, CLI, admin). */
    public function forTenant(int $tenantId): array
    {
        $subscription = Db::selectOne(
            "SELECT id, package_id, status, expires_at, limits_snapshot
               FROM subscriptions
              WHERE tenant_id = :t
              ORDER BY FIELD(status, 'active', 'trialing', 'expired', 'cancelled'), expires_at DESC
              LIMIT 1",
            ['t' => $tenantId]
        ) ?? [];

        // An elapsed subscription is expired regardless of its stored status.
        if (
            isset($subscription['expires_at'])
            && in_array($subscription['status'] ?? '', ['active', 'trialing'], true)
            && strtotime((string) $subscription['expires_at']) < time()
        ) {
            $subscription['status'] = 'expired';
        }

        $wallet = Db::selectOne(
            'SELECT balance, lifetime_deposited, billing_mode FROM wallets WHERE tenant_id = :t',
            ['t' => $tenantId]
        ) ?? ['balance' => '0.00', 'lifetime_deposited' => '0.00', 'billing_mode' => 'subscription'];

        return $this->resolve($subscription, $wallet);
    }

    /** @return array<string,mixed>|null */
    private function fromSnapshot(array $subscription): ?array
    {
        $raw = $subscription['limits_snapshot'] ?? null;
        if (!is_string($raw) || $raw === '') {
            return null;
        }

        $decoded = json_decode($raw, true);
        if (!is_array($decoded) || $decoded === []) {
            Logger::warning('limits.snapshot_unreadable', ['subscription_id' => $subscription['id'] ?? null]);
            return null;
        }

        return $this->normalize($decoded, 'snapshot');
    }

    /** @return array<string,mixed> */
    private function fromPackage(array $subscription): array
    {
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
            Logger::error('limits.package_missing', ['subscription_id' => $subscription['id'] ?? null]);
            return self::EXPIRED;
        }

        return $this->normalize($package, 'package');
    }

    /** @return array<string,mixed> */
    private function fromCredit(array $wallet): array
    {
        $deposited = (float) ($wallet['lifetime_deposited'] ?? 0);
        $balance   = (float) ($wallet['balance'] ?? 0);

        return [
            'fb_enabled'             => true,
            'wa_enabled'             => $deposited >= self::CREDIT_THRESHOLDS['wa_enabled'],
            'ig_enabled'             => $deposited >= self::CREDIT_THRESHOLDS['ig_enabled'],
            'widget_enabled'         => $deposited >= self::CREDIT_THRESHOLDS['widget_enabled'],
            'voice_mode'             => $deposited >= self::CREDIT_THRESHOLDS['voice_both'] ? 'both' : 'stt',
            // Spending is capped by money here, not by a message count.
            'msg_limit'              => null,
            'comment_reply_limit'    => null,
            'faq_rule_limit'         => null,
            'product_limit'          => $deposited >= self::CREDIT_THRESHOLDS['unlimited_products'] ? null : 50,
            'staff_seat_limit'       => 3,
            'voice_msg_limit'        => 0,
            'voice_duration_sec'     => 300,
            'courier_enabled'        => true,
            'shop_assistant_enabled' => true,
            'api_access_enabled'     => $deposited >= self::CREDIT_THRESHOLDS['api_access_enabled'],
            'ai_credit_type'         => 'system',
            'wallet_balance'         => $balance,
            // In credit mode an empty wallet is the thing that stops sending —
            // equivalent to an exhausted quota, not to an expired plan.
            'read_only'              => $balance <= 0,
            '_source'                => 'credit',
        ];
    }

    /**
     * MySQL hands back TINYINT(1) as 0/1 and INT as strings depending on the
     * driver; the snapshot is already-typed JSON. Normalising here means every
     * consumer sees real bools and real ints regardless of origin.
     *
     * @return array<string,mixed>
     */
    private function normalize(array $limits, string $source): array
    {
        foreach (self::BOOL_FIELDS as $field) {
            $limits[$field] = (bool) ($limits[$field] ?? false);
        }

        foreach (['msg_limit', 'comment_reply_limit', 'faq_rule_limit', 'product_limit'] as $field) {
            // NULL genuinely means unlimited and must survive as NULL — casting
            // it to 0 would silently block everything on an unlimited plan.
            if (array_key_exists($field, $limits) && $limits[$field] !== null) {
                $limits[$field] = (int) $limits[$field];
            }
        }

        foreach (['staff_seat_limit', 'voice_msg_limit', 'voice_duration_sec'] as $field) {
            $limits[$field] = (int) ($limits[$field] ?? 0);
        }

        $limits['voice_mode'] = (string) ($limits['voice_mode'] ?? 'none');
        $limits['read_only']  = false;
        $limits['_source']    = $source;

        return $limits;
    }

    /**
     * The snapshot written at purchase time. Only the fields that define what
     * was bought — no ids, no timestamps, nothing that could drift.
     *
     * @param array<string,mixed> $package
     * @return array<string,mixed>
     */
    public function snapshotFor(array $package): array
    {
        $keys = [
            'msg_limit', 'comment_reply_limit', 'faq_rule_limit', 'product_limit',
            'staff_seat_limit', 'voice_msg_limit', 'voice_duration_sec',
            'fb_enabled', 'wa_enabled', 'ig_enabled', 'widget_enabled', 'voice_mode',
            'courier_enabled', 'shop_assistant_enabled', 'api_access_enabled',
            'ai_credit_type', 'model_profile_id',
        ];

        $snapshot = [];
        foreach ($keys as $key) {
            if (array_key_exists($key, $package)) {
                $snapshot[$key] = $package[$key];
            }
        }

        return $this->normalize($snapshot, 'snapshot');
    }
}
