<?php
namespace App\Controllers;

class PartnerController
{
    public static function stats(array $user): void
    {
        $db = \App\DB::instance();
        $stats = $db->query(
            "SELECT total_referrals, total_commission, tier FROM partner_stats WHERE user_id = ? LIMIT 1",
            [$user['id']]
        )->fetch();
        respond(200, ['stats' => $stats ?: ['total_referrals'=>0,'total_commission'=>0,'tier'=>'Silver']]);
    }

    public static function referrals(array $user): void
    {
        $db = \App\DB::instance();
        $refs = $db->query(
            "SELECT r.*, u.name AS referred_name FROM referrals r JOIN users u ON u.id = r.referred_id WHERE r.referrer_id = ? ORDER BY r.created_at DESC",
            [$user['id']]
        )->fetchAll();
        respond(200, ['referrals' => $refs]);
    }

    public static function commissions(array $user): void
    {
        $db = \App\DB::instance();
        $comms = $db->query(
            "SELECT * FROM commissions WHERE user_id = ? ORDER BY created_at DESC",
            [$user['id']]
        )->fetchAll();
        respond(200, ['commissions' => $comms]);
    }
}
