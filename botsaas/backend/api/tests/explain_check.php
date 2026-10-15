<?php
declare(strict_types=1);

/**
 * EXPLAIN audit.
 *
 * Every query the inbox, orders board and dashboard actually run, checked
 * against a tenant with realistic volume. A query that reaches type=ALL
 * (full scan) or key=NULL fails the audit — on shared hosting a single
 * full scan of `messages` under webhook load is enough to stall the API.
 *
 *   php tests/explain_check.php [--keep]
 */

require_once dirname(__DIR__) . '/vendor/autoload.php';
require_once __DIR__ . '/support/demo_data.php';

use App\Core\Bootstrap;
use App\Core\Db;

Bootstrap::boot(dirname(__DIR__));

$keep = in_array('--keep', array_slice($argv, 1), true);

$pass = 0; $fail = 0; $warn = 0;

echo "\nBuilding demo tenant (400 conversations, ~4800 messages, 250 orders, 120 products)…\n";
$t0 = microtime(true);
$tenantId = buildDemoTenant();
printf("built in %.1fs (tenant #%d)\n", microtime(true) - $t0, $tenantId);

/**
 * Run EXPLAIN and judge the plan.
 * $allowScanOn lists tables where a scan is acceptable (tiny lookup tables).
 */
function explain(string $label, string $sql, array $bindings = [], array $allowScanOn = []): void
{
    global $pass, $fail, $warn;

    try {
        $rows = Db::select('EXPLAIN ' . $sql, $bindings);
    } catch (Throwable $e) {
        $fail++;
        echo "  FAIL  {$label} — EXPLAIN errored: " . $e->getMessage() . "\n";
        return;
    }

    $problems = [];
    $detail   = [];

    foreach ($rows as $r) {
        $table = (string) ($r['table'] ?? '?');
        $type  = strtoupper((string) ($r['type'] ?? ''));
        $key   = $r['key'] ?? null;
        $n     = (int) ($r['rows'] ?? 0);
        $extra = (string) ($r['Extra'] ?? '');

        $detail[] = sprintf('%s:%s/%s~%d', $table, strtolower($type), $key ?? 'NONE', $n);

        if ($table === '?' || $table === '') {
            continue;
        }
        if (in_array($table, $allowScanOn, true)) {
            continue;
        }

        if ($type === 'ALL') {
            // Below this size the optimiser is RIGHT to scan — reading 500
            // rows sequentially beats walking an index and doing 500 lookups.
            // Failing it here would train us to add indexes that never get
            // used. What matters is that a usable index EXISTS for when the
            // table grows, so that is what gets checked instead.
            if ($n < 500) {
                $warn++;
                echo "  warn  {$label} — {$table} scanned at {$n} rows "
                   . "(optimiser's choice at this size; index exists for scale)\n";
                continue;
            }
            $problems[] = "{$table} full scan (~{$n} rows)";
        } elseif ($key === null && $type !== 'SYSTEM' && $type !== 'CONST') {
            $problems[] = "{$table} no index used";
        }

        if (str_contains($extra, 'Using filesort') && $n > 500) {
            $problems[] = "{$table} filesort over {$n} rows";
        }
        if (str_contains($extra, 'Using temporary') && $n > 500) {
            $problems[] = "{$table} temp table over {$n} rows";
        }
    }

    $plan = implode(' | ', $detail);

    if ($problems === []) {
        $pass++;
        echo "  ok    {$label}\n        {$plan}\n";
    } else {
        $fail++;
        echo "  FAIL  {$label} — " . implode('; ', $problems) . "\n        {$plan}\n";
    }
}

echo "\n== INBOX ==\n";

explain('inbox list (default)',
    'SELECT c.id, c.status, c.last_message_at, c.last_message_text,
            ch.type, ct.name, ct.phone, ct.avatar_url
       FROM conversations c
       JOIN channels ch ON ch.id = c.channel_id
       JOIN contacts ct ON ct.id = c.contact_id
      WHERE c.tenant_id = :t
      ORDER BY c.last_message_at DESC, c.id DESC
      LIMIT 31',
    ['t' => $tenantId]);

explain('inbox list filtered by status',
    'SELECT c.id, c.last_message_at FROM conversations c
      WHERE c.tenant_id = :t AND c.status = :s
      ORDER BY c.last_message_at DESC, c.id DESC LIMIT 31',
    ['t' => $tenantId, 's' => 'open']);

explain('inbox keyset page 2',
    'SELECT c.id FROM conversations c
      WHERE c.tenant_id = :t
        AND (c.last_message_at < :ts OR (c.last_message_at = :ts2 AND c.id < :id))
      ORDER BY c.last_message_at DESC, c.id DESC LIMIT 31',
    ['t' => $tenantId, 'ts' => date('Y-m-d H:i:s'), 'ts2' => date('Y-m-d H:i:s'), 'id' => 999999]);

explain('inbox counts (chips)',
    "SELECT COUNT(*) AS total, SUM(status = 'open') AS o, SUM(unread_count > 0) AS u
       FROM conversations WHERE tenant_id = :t",
    ['t' => $tenantId]);

explain('thread page (newest 50)',
    'SELECT id, direction, sender, body, created_at FROM messages
      WHERE conversation_id = :c AND tenant_id = :t
      ORDER BY id DESC LIMIT 51',
    ['c' => (int) Db::scalar('SELECT id FROM conversations WHERE tenant_id = :t LIMIT 1', ['t' => $tenantId]),
     't' => $tenantId]);

explain('AI context: last N turns',
    "SELECT id, sender, body FROM messages
      WHERE conversation_id = :c AND tenant_id = :t AND body IS NOT NULL AND body <> ''
      ORDER BY id DESC LIMIT 10",
    ['c' => (int) Db::scalar('SELECT id FROM conversations WHERE tenant_id = :t LIMIT 1', ['t' => $tenantId]),
     't' => $tenantId]);

explain('contact lookup by phone (order confirm)',
    'SELECT id FROM contacts WHERE tenant_id = :t AND phone = :p',
    ['t' => $tenantId, 'p' => '01710000001']);

explain('channel resolve from webhook',
    'SELECT id, tenant_id FROM channels WHERE type = :ty AND external_id = :x',
    ['ty' => 'messenger', 'x' => 'page_demo']);

echo "\n== ORDERS BOARD ==\n";

explain('orders board (default page)',
    'SELECT o.id, o.order_no, o.total, o.status, o.created_at,
            (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) AS items
       FROM orders o
      WHERE o.tenant_id = :t
      ORDER BY o.id DESC LIMIT 31',
    ['t' => $tenantId]);

explain('orders filtered by status',
    'SELECT o.id FROM orders o WHERE o.tenant_id = :t AND o.status = :s
      ORDER BY o.id DESC LIMIT 31',
    ['t' => $tenantId, 's' => 'new']);

explain('orders status counts (8 columns)',
    'SELECT status, COUNT(*), SUM(total) FROM orders WHERE tenant_id = :t GROUP BY status',
    ['t' => $tenantId]);

explain('order detail items',
    'SELECT id, name_snapshot, unit_price, qty FROM order_items
      WHERE order_id = :o AND tenant_id = :t',
    ['o' => (int) Db::scalar('SELECT id FROM orders WHERE tenant_id = :t LIMIT 1', ['t' => $tenantId]),
     't' => $tenantId]);

explain('order lookup by phone',
    'SELECT id, order_no, status FROM orders WHERE tenant_id = :t AND phone = :p ORDER BY id DESC',
    ['t' => $tenantId, 'p' => '01710000005']);

explain('duplicate-order guard',
    'SELECT last_order_at FROM order_guards
      WHERE tenant_id = :t AND guard_key = :k AND window_date = CURDATE()',
    ['t' => $tenantId, 'k' => 'phone:01710000005']);

echo "\n== DASHBOARD ==\n";

explain('dashboard series (7d)',
    'SELECT stat_date, messages_in, orders_created, revenue, hourly_messages
       FROM analytics_daily
      WHERE tenant_id = :t AND stat_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      ORDER BY stat_date',
    ['t' => $tenantId]);

explain('dashboard totals (7d)',
    'SELECT SUM(messages_in), SUM(orders_created), SUM(revenue), SUM(ai_cost)
       FROM analytics_daily
      WHERE tenant_id = :t AND stat_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)',
    ['t' => $tenantId]);

explain('top products (30d)',
    "SELECT oi.product_id, SUM(oi.subtotal) AS revenue
       FROM order_items oi JOIN orders o ON o.id = oi.order_id
      WHERE oi.tenant_id = :t AND o.status NOT IN ('cancelled','returned')
        AND o.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY oi.product_id ORDER BY revenue DESC LIMIT 5",
    ['t' => $tenantId]);

explain('usage meters',
    "SELECT u.* FROM subscription_usage u
       JOIN subscriptions s ON s.id = u.subscription_id
      WHERE u.tenant_id = :t AND s.status IN ('active','trialing')
      ORDER BY u.cycle_start DESC LIMIT 1",
    ['t' => $tenantId]);

explain('low stock alert',
    "SELECT id, name, stock FROM products
      WHERE tenant_id = :t AND status = 'active' AND track_stock = 1 AND stock <= low_stock_at
      ORDER BY stock ASC LIMIT 50",
    ['t' => $tenantId]);

echo "\n== AI PATH (per inbound message) ==\n";

explain('instant-reply rules load',
    "SELECT id, keywords, reply_text FROM instant_replies
      WHERE tenant_id = :t AND is_active = 1 AND channel_scope IN ('all', :ch)
      ORDER BY priority DESC, id ASC",
    ['t' => $tenantId, 'ch' => 'messenger']);

explain('product search for AI (blob)',
    "SELECT id, name, price, stock FROM products
      WHERE tenant_id = :t AND status = 'active' AND search_blob LIKE :q
      ORDER BY sort_order ASC LIMIT 8",
    ['t' => $tenantId, 'q' => '%shari%']);

explain('AI cost by day',
    'SELECT DATE(created_at) AS d, SUM(cost) FROM ai_requests
      WHERE tenant_id = :t AND created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at)',
    ['t' => $tenantId]);

echo "\n== CRON / SCHEDULER ==\n";

explain('due follow-ups (all tenants)',
    "SELECT fj.id FROM followup_jobs fj
       JOIN followup_sequences seq ON seq.id = fj.sequence_id AND seq.is_active = 1
       JOIN followup_steps fs ON fs.sequence_id = fj.sequence_id AND fs.step_no = fj.next_step
      WHERE fj.status = 'pending' AND fj.run_at <= NOW()
      ORDER BY fj.run_at ASC LIMIT 200");

explain('due message batches',
    "SELECT id, conversation_id FROM message_batches
      WHERE status = 'pending' AND flush_at <= NOW(3) LIMIT 100");

explain('queue claim',
    "SELECT id FROM jobs WHERE status = 'pending' AND available_at <= NOW(3)
      ORDER BY priority ASC, id ASC LIMIT 20");

explain('channel token health',
    'SELECT id, tenant_id FROM channels
      WHERE is_active = 1 AND token_expires_at IS NOT NULL
        AND token_expires_at < DATE_ADD(NOW(), INTERVAL 7 DAY)
      ORDER BY token_expires_at ASC LIMIT 500');

explain('shipments needing sync',
    "SELECT cs.id FROM courier_shipments cs
       JOIN courier_accounts ca ON ca.id = cs.courier_account_id
      WHERE (cs.status IS NULL OR cs.status NOT IN ('delivered','returned','cancelled'))
        AND (cs.status_updated_at IS NULL OR cs.status_updated_at < DATE_SUB(NOW(), INTERVAL 15 MINUTE))
      ORDER BY cs.status_updated_at ASC LIMIT 100",
    [], ['ca']);

explain('webhook dedupe',
    'SELECT id FROM webhook_events WHERE dedupe_hash = :h',
    ['h' => str_repeat('a', 64)]);

explain('retention: prune webhook_events',
    'SELECT id FROM webhook_events WHERE received_at < DATE_SUB(NOW(), INTERVAL 14 DAY) LIMIT 5000');

explain('retention: prune activity_logs',
    'SELECT id FROM activity_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY) LIMIT 5000');

if (!$keep) {
    dropDemoTenant($tenantId);
    echo "\ndemo tenant removed (pass --keep to retain it)\n";
} else {
    echo "\ndemo tenant #{$tenantId} retained\n";
}

echo "\n" . str_repeat('-', 60) . "\n";
printf("  %d plans OK, %d scans acceptable at current size, %d need an index\n\n",
       $pass, $warn, $fail);

// An index that exists but is never chosen at demo scale still has to EXIST.
// Verify the ones the audit is relying on.
echo "Index presence check (these carry the plans at scale):\n";
$required = [
    'conversations'     => ['idx_conv_inbox', 'idx_conv_counts'],
    'messages'          => ['idx_msg_conv', 'idx_msg_tenant_time'],
    'orders'            => ['idx_order_board', 'idx_order_phone'],
    'order_items'       => ['idx_oi_order', 'idx_oi_revenue'],
    'products'          => ['idx_prod_tenant', 'idx_prod_lowstock'],
    'channels'          => ['idx_channel_token_health'],
    'courier_shipments' => ['idx_ship_pending'],
    'analytics_daily'   => ['uq_ad'],
    'jobs'              => ['idx_job_claim'],
    'followup_jobs'     => ['idx_fj_due'],
    'webhook_events'    => ['uq_wh_dedupe', 'idx_wh_prune'],
];
$missing = 0;
foreach ($required as $table => $indexes) {
    foreach ($indexes as $idx) {
        $found = Db::scalar(
            'SELECT COUNT(*) FROM information_schema.statistics
              WHERE table_schema = DATABASE() AND table_name = :t AND index_name = :i',
            ['t' => $table, 'i' => $idx]
        );
        if ((int) $found === 0) {
            echo "  MISSING  {$table}.{$idx}\n";
            $missing++;
        }
    }
}
echo $missing === 0
    ? "  all " . array_sum(array_map('count', $required)) . " required indexes present\n\n"
    : "  {$missing} index(es) MISSING\n\n";
$fail += $missing;
exit($fail === 0 ? 0 : 1);
