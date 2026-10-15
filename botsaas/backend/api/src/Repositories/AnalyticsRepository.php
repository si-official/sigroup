<?php
declare(strict_types=1);

namespace App\Repositories;

use App\Core\Db;

/**
 * Reads analytics_daily, never the raw messages table.
 *
 * The dashboard must answer in ONE request under 200ms. Computing "messages
 * today" by scanning messages would be a full table scan per tenant per page
 * load — fine with 500 messages, fatal with 500,000.
 */
final class AnalyticsRepository extends BaseRepository
{
    protected string $table = 'analytics_daily';

    /** Everything the dashboard needs, in one call. */
    public function dashboard(int $days = 7): array
    {
        $series = $this->select(
            'SELECT stat_date, messages_in, messages_out, ai_replies, human_replies,
                    instant_replies, new_contacts, orders_created, orders_completed,
                    revenue, ai_cost, hourly_messages
               FROM analytics_daily
              WHERE tenant_id = :t AND stat_date >= DATE_SUB(CURDATE(), INTERVAL :d DAY)
              ORDER BY stat_date',
            ['t' => $this->tenantId, 'd' => $days]
        );

        $totals = $this->selectOne(
            'SELECT COALESCE(SUM(messages_in), 0)      AS messages_in,
                    COALESCE(SUM(messages_out), 0)     AS messages_out,
                    COALESCE(SUM(ai_replies), 0)       AS ai_replies,
                    COALESCE(SUM(human_replies), 0)    AS human_replies,
                    COALESCE(SUM(instant_replies), 0)  AS instant_replies,
                    COALESCE(SUM(new_contacts), 0)     AS new_contacts,
                    COALESCE(SUM(orders_created), 0)   AS orders_created,
                    COALESCE(SUM(orders_completed), 0) AS orders_completed,
                    COALESCE(SUM(revenue), 0)          AS revenue,
                    COALESCE(SUM(ai_cost), 0)          AS ai_cost
               FROM analytics_daily
              WHERE tenant_id = :t AND stat_date >= DATE_SUB(CURDATE(), INTERVAL :d DAY)',
            ['t' => $this->tenantId, 'd' => $days]
        ) ?? [];

        // Peak messaging hours: sum the 24-slot arrays across the range.
        $hourly = array_fill(0, 24, 0);
        foreach ($series as $row) {
            $slots = json_decode((string) ($row['hourly_messages'] ?? '[]'), true);
            if (is_array($slots)) {
                foreach ($slots as $h => $n) {
                    if (isset($hourly[$h])) {
                        $hourly[$h] += (int) $n;
                    }
                }
            }
        }

        $conversations = max(1, (int) ($totals['new_contacts'] ?? 0));
        $ordersCreated = (int) ($totals['orders_created'] ?? 0);

        return [
            'series'          => $series,
            'totals'          => $totals,
            'hourly_messages' => $hourly,
            'conversion_rate' => round($ordersCreated / $conversations * 100, 2),
            'avg_order_value' => $ordersCreated > 0
                ? round((float) $totals['revenue'] / $ordersCreated, 2)
                : 0.0,
            'automation_rate' => ($totals['ai_replies'] + $totals['human_replies']) > 0
                ? round($totals['ai_replies'] / ($totals['ai_replies'] + $totals['human_replies']) * 100, 1)
                : 0.0,
        ];
    }

    public function topProducts(int $days = 30, int $limit = 5): array
    {
        return $this->select(
            "SELECT oi.product_id, oi.name_snapshot AS name,
                    SUM(oi.qty) AS units, SUM(oi.subtotal) AS revenue
               FROM order_items oi
               JOIN orders o ON o.id = oi.order_id
              WHERE oi.tenant_id = :t
                AND o.status NOT IN ('cancelled','returned')
                AND o.created_at >= DATE_SUB(CURDATE(), INTERVAL :d DAY)
              GROUP BY oi.product_id, oi.name_snapshot
              ORDER BY revenue DESC
              LIMIT {$limit}",
            ['t' => $this->tenantId, 'd' => $days]
        );
    }

    /**
     * Nightly rollup for one tenant and date. Idempotent — re-running a day
     * recomputes rather than double-counts, which matters because the hourly
     * partial re-runs "today" twenty-four times.
     */
    public function rollupDay(string $date): void
    {
        $msg = $this->selectOne(
            "SELECT
                SUM(direction = 'in')                          AS messages_in,
                SUM(direction = 'out')                         AS messages_out,
                SUM(sender = 'ai' AND source = 'ai')           AS ai_replies,
                SUM(sender = 'human')                          AS human_replies,
                SUM(source = 'instant_reply')                  AS instant_replies
               FROM messages
              WHERE tenant_id = :t AND DATE(created_at) = :d",
            ['t' => $this->tenantId, 'd' => $date]
        ) ?? [];

        $hourly = array_fill(0, 24, 0);
        foreach ($this->select(
            'SELECT HOUR(created_at) AS h, COUNT(*) AS n
               FROM messages WHERE tenant_id = :t AND DATE(created_at) = :d
              GROUP BY HOUR(created_at)',
            ['t' => $this->tenantId, 'd' => $date]
        ) as $row) {
            $hourly[(int) $row['h']] = (int) $row['n'];
        }

        $orders = $this->selectOne(
            "SELECT COUNT(*) AS created,
                    SUM(status = 'completed') AS completed,
                    COALESCE(SUM(CASE WHEN status NOT IN ('cancelled','returned') THEN total END), 0) AS revenue
               FROM orders WHERE tenant_id = :t AND DATE(created_at) = :d",
            ['t' => $this->tenantId, 'd' => $date]
        ) ?? [];

        $contacts = (int) $this->scalar(
            'SELECT COUNT(*) FROM contacts WHERE tenant_id = :t AND DATE(first_seen_at) = :d',
            ['t' => $this->tenantId, 'd' => $date]
        );

        $aiCost = $this->scalar(
            'SELECT COALESCE(SUM(cost), 0) FROM ai_requests WHERE tenant_id = :t AND DATE(created_at) = :d',
            ['t' => $this->tenantId, 'd' => $date]
        );

        Db::execute(
            'INSERT INTO analytics_daily
                (tenant_id, stat_date, messages_in, messages_out, ai_replies, human_replies,
                 instant_replies, new_contacts, orders_created, orders_completed, revenue,
                 ai_cost, hourly_messages)
             VALUES (:t, :d, :mi, :mo, :ai, :hu, :ir, :nc, :oc, :od, :rev, :cost, :hourly)
             ON DUPLICATE KEY UPDATE
                messages_in = :mi2, messages_out = :mo2, ai_replies = :ai2,
                human_replies = :hu2, instant_replies = :ir2, new_contacts = :nc2,
                orders_created = :oc2, orders_completed = :od2, revenue = :rev2,
                ai_cost = :cost2, hourly_messages = :hourly2',
            [
                't' => $this->tenantId, 'd' => $date,
                'mi' => (int) ($msg['messages_in'] ?? 0),    'mi2' => (int) ($msg['messages_in'] ?? 0),
                'mo' => (int) ($msg['messages_out'] ?? 0),   'mo2' => (int) ($msg['messages_out'] ?? 0),
                'ai' => (int) ($msg['ai_replies'] ?? 0),     'ai2' => (int) ($msg['ai_replies'] ?? 0),
                'hu' => (int) ($msg['human_replies'] ?? 0),  'hu2' => (int) ($msg['human_replies'] ?? 0),
                'ir' => (int) ($msg['instant_replies'] ?? 0),'ir2' => (int) ($msg['instant_replies'] ?? 0),
                'nc' => $contacts,                           'nc2' => $contacts,
                'oc' => (int) ($orders['created'] ?? 0),     'oc2' => (int) ($orders['created'] ?? 0),
                'od' => (int) ($orders['completed'] ?? 0),   'od2' => (int) ($orders['completed'] ?? 0),
                'rev' => $orders['revenue'] ?? '0.00',       'rev2' => $orders['revenue'] ?? '0.00',
                'cost' => $aiCost ?? '0.000000',             'cost2' => $aiCost ?? '0.000000',
                'hourly' => json_encode(array_values($hourly)),
                'hourly2' => json_encode(array_values($hourly)),
            ]
        );
    }

    /** Tenants with activity on a date — drives the nightly rollup loop. */
    public static function activeTenantsOn(string $date): array
    {
        return array_column(Db::select(
            'SELECT DISTINCT tenant_id FROM messages WHERE DATE(created_at) = :d
              UNION
             SELECT DISTINCT tenant_id FROM orders WHERE DATE(created_at) = :d2',
            ['d' => $date, 'd2' => $date]
        ), 'tenant_id');
    }
}
