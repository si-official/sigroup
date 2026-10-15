<?php
declare(strict_types=1);

/**
 * Builds a tenant with realistic volume so EXPLAIN means something.
 * A query plan against 3 rows always says "table scan is fine" — the optimiser
 * only reveals a missing index once there is enough data to care about.
 *
 * Returns the tenant id.
 */

use App\Core\Db;
use App\Services\LimitsResolver;

function buildDemoTenant(int $conversations = 400, int $messagesPer = 12, int $orders = 250, int $products = 120): int
{
    $suffix = bin2hex(random_bytes(3));

    $tenantId = Db::insert('tenants', [
        'name' => "Demo Shop {$suffix}", 'slug' => "demo-{$suffix}", 'status' => 'active',
    ]);

    Db::insert('wallets', ['tenant_id' => $tenantId, 'billing_mode' => 'subscription']);

    $pkg = Db::selectOne("SELECT * FROM packages WHERE slug = 'pro'");
    Db::insert('subscriptions', [
        'tenant_id' => $tenantId, 'package_id' => $pkg['id'], 'status' => 'active',
        'expires_at' => date('Y-m-d H:i:s', time() + 86400 * 30),
        'limits_snapshot' => json_encode((new LimitsResolver())->snapshotFor($pkg)),
    ]);

    $channelId = Db::insert('channels', [
        'tenant_id' => $tenantId, 'type' => 'messenger',
        'display_name' => 'Demo Page', 'external_id' => 'page_' . $suffix,
        'status' => 'connected', 'is_active' => 1,
    ]);

    // --- products ---
    $names = ['শাড়ি', 'থ্রি পিস', 'পাঞ্জাবি', 'কুর্তি', 'জুতা', 'ব্যাগ', 'ঘড়ি', 'সানগ্লাস'];
    $productIds = [];
    Db::pdo()->beginTransaction();
    for ($i = 0; $i < $products; $i++) {
        $name = $names[$i % count($names)] . ' ' . ($i + 1);
        $productIds[] = Db::insert('products', [
            'tenant_id' => $tenantId,
            'name' => $name,
            'description' => 'উন্নত মানের ' . $name . ' সাশ্রয়ী দামে।',
            'price' => 500 + ($i * 13) % 4000,
            'stock' => ($i * 7) % 50,
            'status' => 'active',
            'ai_keywords' => 'quality premium',
            'search_blob' => \App\Repositories\ProductRepository::normalize(
                $name . ' ' . \App\Repositories\ProductRepository::transliterate($name)
            ),
            'sort_order' => $i,
        ]);
    }
    Db::pdo()->commit();

    // --- contacts + conversations + messages ---
    Db::pdo()->beginTransaction();
    $convIds = [];
    for ($c = 0; $c < $conversations; $c++) {
        $contactId = Db::insert('contacts', [
            'tenant_id' => $tenantId, 'channel_id' => $channelId,
            'external_id' => 'psid_' . $suffix . '_' . $c,
            'name' => 'কাস্টমার ' . $c,
            'phone' => '017' . str_pad((string) (10000000 + $c), 8, '0', STR_PAD_LEFT),
            'first_seen_at' => date('Y-m-d H:i:s', time() - random_int(0, 86400 * 60)),
            'last_seen_at'  => date('Y-m-d H:i:s', time() - random_int(0, 86400 * 10)),
        ]);

        $last = date('Y-m-d H:i:s', time() - random_int(0, 86400 * 30));

        $convIds[] = Db::insert('conversations', [
            'tenant_id' => $tenantId, 'channel_id' => $channelId, 'contact_id' => $contactId,
            'status' => ['open', 'active', 'resolved'][$c % 3],
            'unread_count' => $c % 4,
            'message_count' => $messagesPer,
            'last_message_at' => $last,
            'last_message_text' => 'দাম কত?',
            'last_message_from' => 'customer',
        ]);
        if ($c % 100 === 99) { Db::pdo()->commit(); Db::pdo()->beginTransaction(); }
    }
    Db::pdo()->commit();

    Db::pdo()->beginTransaction();
    $n = 0;
    foreach ($convIds as $convId) {
        for ($m = 0; $m < $messagesPer; $m++) {
            Db::insert('messages', [
                'tenant_id' => $tenantId, 'conversation_id' => $convId,
                'direction' => $m % 2 === 0 ? 'in' : 'out',
                'sender' => $m % 2 === 0 ? 'customer' : 'ai',
                'source' => $m % 2 === 0 ? null : 'ai',
                'type' => 'text',
                'body' => $m % 2 === 0 ? 'এটার দাম কত?' : 'স্যার, এটার দাম ১২০০ টাকা।',
                'created_at' => date('Y-m-d H:i:s.v', time() - random_int(0, 86400 * 30)),
            ]);
            if (++$n % 500 === 0) { Db::pdo()->commit(); Db::pdo()->beginTransaction(); }
        }
    }
    Db::pdo()->commit();

    // --- orders ---
    Db::pdo()->beginTransaction();
    for ($o = 0; $o < $orders; $o++) {
        $total   = 500 + ($o * 37) % 5000;
        $status  = ['new', 'confirmed', 'processing', 'courier', 'completed', 'cancelled'][$o % 6];
        $created = date('Y-m-d H:i:s', time() - random_int(0, 86400 * 45));

        $orderId = Db::insert('orders', [
            'tenant_id' => $tenantId,
            'order_no' => date('ymd') . str_pad((string) $o, 4, '0', STR_PAD_LEFT),
            'conversation_id' => $convIds[$o % count($convIds)],
            'channel_type' => 'messenger',
            'customer_name' => 'কাস্টমার ' . $o,
            'phone' => '017' . str_pad((string) (10000000 + $o), 8, '0', STR_PAD_LEFT),
            'district' => 'Dhaka',
            'items_total' => $total, 'delivery_charge' => 60, 'total' => $total + 60,
            'status' => $status,
            'completed_at' => $status === 'completed' ? $created : null,
            'created_at' => $created,
        ]);

        Db::insert('order_items', [
            'tenant_id' => $tenantId, 'order_id' => $orderId,
            'product_id' => $productIds[$o % count($productIds)],
            'name_snapshot' => 'পণ্য ' . $o,
            'unit_price' => $total, 'qty' => 1, 'subtotal' => $total,
        ]);
        if ($o % 100 === 99) { Db::pdo()->commit(); Db::pdo()->beginTransaction(); }
    }
    Db::pdo()->commit();

    // --- analytics rollups ---
    Db::pdo()->beginTransaction();
    for ($d = 0; $d < 60; $d++) {
        Db::insert('analytics_daily', [
            'tenant_id' => $tenantId,
            'stat_date' => date('Y-m-d', time() - ($d * 86400)),
            'messages_in' => random_int(20, 200), 'messages_out' => random_int(20, 200),
            'ai_replies' => random_int(10, 180), 'human_replies' => random_int(0, 30),
            'instant_replies' => random_int(0, 60), 'new_contacts' => random_int(1, 25),
            'orders_created' => random_int(0, 12), 'orders_completed' => random_int(0, 10),
            'revenue' => random_int(0, 50000), 'ai_cost' => random_int(0, 300) / 100,
            'hourly_messages' => json_encode(array_map(static fn () => random_int(0, 30), range(0, 23))),
        ]);
    }
    Db::pdo()->commit();

    return $tenantId;
}

function dropDemoTenant(int $tenantId): void
{
    Db::execute('DELETE FROM tenants WHERE id = :t', ['t' => $tenantId]);
}
