<?php
declare(strict_types=1);

namespace App\Repositories;

use App\Core\Db;

/**
 * Duplicate-order protection.
 *
 * Runs before every AI order confirm, so it must be O(1). A naive
 * implementation scans `orders` by phone on each confirm; this keeps a tiny
 * per-day counter table keyed by (tenant, guard_key, date) instead.
 */
final class OrderGuardRepository extends BaseRepository
{
    protected string $table = 'order_guards';

    /**
     * @param array<string,mixed> $settings bot_settings.order_protection
     * @return array{duplicate:bool,reason:?string,message:?string}
     */
    public function wouldBeDuplicate(?string $phone, ?int $conversationId, array $settings): array
    {
        if (($settings['enabled'] ?? true) === false) {
            return ['duplicate' => false, 'reason' => null, 'message' => null];
        }

        // Returning a REASON rather than a bare bool matters: the AI has to
        // tell the customer something true ("আপনার একটি অর্ডার এখনো
        // প্রসেসিং-এ আছে") instead of failing silently or inventing an excuse.

        if (($settings['require_phone'] ?? true) && ($phone === null || $phone === '')) {
            return [
                'duplicate' => true,
                'reason'    => 'phone_required',
                'message'   => 'অর্ডার কনফার্ম করতে আপনার ফোন নম্বরটি দরকার।',
            ];
        }

        if ($conversationId !== null) {
            $cooldown = (int) ($settings['same_conv_min'] ?? 10);
            $recent   = $this->scalar(
                'SELECT last_order_at FROM order_guards
                  WHERE tenant_id = :t AND guard_key = :k
                    AND last_order_at > DATE_SUB(NOW(), INTERVAL :m MINUTE)',
                ['t' => $this->tenantId, 'k' => 'conv:' . $conversationId, 'm' => $cooldown]
            );

            if ($recent !== null) {
                return [
                    'duplicate' => true,
                    'reason'    => 'same_conversation_cooldown',
                    'message'   => 'আপনার একটি অর্ডার কিছুক্ষণ আগেই নেওয়া হয়েছে। নতুন অর্ডার করতে চাইলে একটু পরে চেষ্টা করুন।',
                ];
            }
        }

        if ($phone !== null && $phone !== '') {
            $phoneCooldown = (int) ($settings['same_phone_min'] ?? 30);
            $recent = $this->scalar(
                'SELECT last_order_at FROM order_guards
                  WHERE tenant_id = :t AND guard_key = :k
                    AND last_order_at > DATE_SUB(NOW(), INTERVAL :m MINUTE)',
                ['t' => $this->tenantId, 'k' => 'phone:' . $phone, 'm' => $phoneCooldown]
            );

            if ($recent !== null) {
                return [
                    'duplicate' => true,
                    'reason'    => 'same_phone_cooldown',
                    'message'   => 'এই নম্বর থেকে সদ্য একটি অর্ডার নেওয়া হয়েছে। ডুপ্লিকেট এড়াতে একটু পরে চেষ্টা করুন।',
                ];
            }

            $dailyLimit = (int) ($settings['daily_limit'] ?? 3);
            $todayCount = (int) ($this->scalar(
                'SELECT order_count FROM order_guards
                  WHERE tenant_id = :t AND guard_key = :k AND window_date = CURDATE()',
                ['t' => $this->tenantId, 'k' => 'phone:' . $phone]
            ) ?? 0);

            if ($dailyLimit > 0 && $todayCount >= $dailyLimit) {
                return [
                    'duplicate' => true,
                    'reason'    => 'daily_limit',
                    'message'   => 'আজকের জন্য এই নম্বরে অর্ডারের সীমা শেষ। আমাদের সাথে সরাসরি যোগাযোগ করুন।',
                ];
            }
        }

        return ['duplicate' => false, 'reason' => null, 'message' => null];
    }

    /** Record a successful order against both guard keys. */
    public function record(?string $phone, ?int $conversationId): void
    {
        foreach (array_filter([
            $phone !== null && $phone !== '' ? 'phone:' . $phone : null,
            $conversationId !== null ? 'conv:' . $conversationId : null,
        ]) as $key) {
            Db::execute(
                'INSERT INTO order_guards (tenant_id, guard_key, order_count, window_date, last_order_at)
                 VALUES (:t, :k, 1, CURDATE(), NOW())
                 ON DUPLICATE KEY UPDATE order_count = order_count + 1, last_order_at = NOW()',
                ['t' => $this->tenantId, 'k' => $key]
            );
        }
    }

    public static function prune(int $days = 7): int
    {
        return Db::execute(
            'DELETE FROM order_guards WHERE window_date < DATE_SUB(CURDATE(), INTERVAL :d DAY) LIMIT 5000',
            ['d' => $days]
        );
    }
}
