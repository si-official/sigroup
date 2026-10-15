<?php
declare(strict_types=1);

namespace App\Repositories;

use App\Core\ApiException;
use App\Core\Db;
use App\Support\Money;

final class OrderRepository extends BaseRepository
{
    protected string $table = 'orders';

    /** Legal status transitions. An illegal jump is a bug, not a user choice. */
    private const TRANSITIONS = [
        'new'        => ['confirmed', 'hold', 'cancelled'],
        'confirmed'  => ['processing', 'hold', 'cancelled'],
        'processing' => ['courier', 'hold', 'cancelled'],
        'hold'       => ['confirmed', 'processing', 'cancelled'],
        'courier'    => ['completed', 'returned', 'cancelled'],
        'completed'  => ['returned'],
        'cancelled'  => [],
        'returned'   => [],
    ];

    /** The 8-column board, one query per page. */
    public function board(array $filters = [], ?string $cursor = null, int $limit = 30): array
    {
        $where    = ['o.tenant_id = ' . (int) $this->tenantId];
        $bindings = [];

        if (!empty($filters['status'])) {
            $where[] = 'o.status = :status';
            $bindings['status'] = $filters['status'];
        }
        if (!empty($filters['channel_type'])) {
            $where[] = 'o.channel_type = :ct';
            $bindings['ct'] = $filters['channel_type'];
        }
        if (!empty($filters['phone'])) {
            $where[] = 'o.phone = :phone';
            $bindings['phone'] = $filters['phone'];
        }
        if (!empty($filters['from'])) {
            $where[] = 'o.created_at >= :from';
            $bindings['from'] = $filters['from'];
        }
        if (!empty($filters['to'])) {
            $where[] = 'o.created_at <= :to';
            $bindings['to'] = $filters['to'];
        }
        if (!empty($filters['search'])) {
            $where[] = '(o.order_no LIKE :q OR o.customer_name LIKE :q2 OR o.phone LIKE :q3)';
            $bindings['q'] = $bindings['q2'] = $bindings['q3'] = '%' . $filters['search'] . '%';
        }

        if ($cursor !== null) {
            $before = $this->decodeCursor($cursor);
            if ($before !== null) {
                $where[] = 'o.id < :before';
                $bindings['before'] = $before;
            }
        }

        $limit = max(1, min($limit, 100));

        // Item count comes from a correlated subquery rather than a JOIN +
        // GROUP BY: grouping would force a temp table over the whole page.
        $rows = $this->select(
            'SELECT o.id, o.order_no, o.customer_name, o.phone, o.district,
                    o.total, o.status, o.payment_method, o.payment_status,
                    o.channel_type, o.created_by, o.created_at, o.conversation_id,
                    (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) AS item_count,
                    cs.tracking_code, cs.status AS courier_status
               FROM orders o
               LEFT JOIN courier_shipments cs ON cs.order_id = o.id
              WHERE ' . implode(' AND ', $where) . '
              ORDER BY o.id DESC
              LIMIT ' . ($limit + 1),
            $bindings
        );

        $hasMore = count($rows) > $limit;
        if ($hasMore) {
            array_pop($rows);
        }

        return [
            'items'       => $rows,
            'next_cursor' => $hasMore && $rows !== [] ? $this->encodeCursor((int) end($rows)['id']) : null,
        ];
    }

    /** Counts for the 8 board columns — one grouped query, not eight. */
    public function statusCounts(): array
    {
        $rows = $this->select(
            'SELECT status, COUNT(*) AS n, COALESCE(SUM(total), 0) AS revenue
               FROM orders WHERE tenant_id = :t GROUP BY status',
            ['t' => $this->tenantId]
        );

        $out = array_fill_keys(array_keys(self::TRANSITIONS), ['count' => 0, 'revenue' => '0.00']);
        foreach ($rows as $r) {
            $out[$r['status']] = ['count' => (int) $r['n'], 'revenue' => $r['revenue']];
        }

        return $out;
    }

    /** Order + items + history in 3 queries, never 1+N. */
    public function detail(int $orderId): ?array
    {
        $order = $this->selectOne(
            'SELECT * FROM orders WHERE id = :id AND tenant_id = :t',
            ['id' => $orderId, 't' => $this->tenantId]
        );

        if ($order === null) {
            return null;
        }

        $order['items'] = $this->select(
            'SELECT id, product_id, variant_id, name_snapshot, variant_label,
                    unit_price, qty, subtotal
               FROM order_items WHERE order_id = :o AND tenant_id = :t ORDER BY id',
            ['o' => $orderId, 't' => $this->tenantId]
        );

        $order['history'] = $this->select(
            'SELECT from_status, to_status, actor_type, actor_user_id, note, created_at
               FROM order_status_history
              WHERE order_id = :o AND tenant_id = :t ORDER BY id',
            ['o' => $orderId, 't' => $this->tenantId]
        );

        return $order;
    }

    /**
     * Create an order with its items, totals and stock decrement, atomically.
     *
     * Totals are computed here in integer paisa — never trusted from the
     * caller, and never from the LLM. The model proposes items; the server
     * decides what they cost.
     */
    public function createWithItems(array $order, array $items): int
    {
        return Db::transaction(function () use ($order, $items): int {
            $itemsTotal = Money::zero();
            $productRepo = new ProductRepository($this->tenantId);

            $priced = [];
            foreach ($items as $item) {
                $productId = (int) ($item['product_id'] ?? 0);
                $qty       = max(1, (int) ($item['qty'] ?? 1));

                $product = $productRepo->find($productId);
                if ($product === null) {
                    throw new ApiException('PRODUCT_NOT_FOUND', "Product {$productId} not found.", 422);
                }

                $unit = Money::parseOrZero(
                    $product['sale_price'] !== null && (float) $product['sale_price'] > 0
                        ? $product['sale_price']
                        : $product['price']
                );

                if (!empty($item['variant_id'])) {
                    $variant = $this->selectOne(
                        'SELECT price_delta, option_name, option_value FROM product_variants
                          WHERE id = :v AND product_id = :p AND tenant_id = :t',
                        ['v' => (int) $item['variant_id'], 'p' => $productId, 't' => $this->tenantId]
                    );
                    if ($variant !== null) {
                        $unit = $unit->add(Money::parseOrZero($variant['price_delta']));
                        $item['variant_label'] = $variant['option_name'] . ': ' . $variant['option_value'];
                    }
                }

                if ((int) $product['track_stock'] === 1 && !$productRepo->decrementStock($productId, $qty)) {
                    throw new ApiException(
                        'INSUFFICIENT_STOCK',
                        sprintf('"%s" does not have %d in stock.', $product['name'], $qty),
                        422,
                        ['product_id' => $productId, 'available' => (int) $product['stock']]
                    );
                }

                $subtotal   = $unit->multiply($qty);
                $itemsTotal = $itemsTotal->add($subtotal);

                $priced[] = [
                    'tenant_id'     => $this->tenantId,
                    'product_id'    => $productId,
                    'variant_id'    => $item['variant_id'] ?? null,
                    'name_snapshot' => $product['name'],
                    'variant_label' => $item['variant_label'] ?? null,
                    'unit_price'    => $unit->toDecimalString(),
                    'qty'           => $qty,
                    'subtotal'      => $subtotal->toDecimalString(),
                ];
            }

            $delivery = Money::parseOrZero($order['delivery_charge'] ?? 0);
            $discount = Money::parseOrZero($order['discount'] ?? 0);
            $total    = $itemsTotal->add($delivery)->subtract($discount);

            $order['tenant_id']       = $this->tenantId;
            $order['order_no']        = $order['order_no'] ?? $this->nextOrderNo();
            $order['items_total']     = $itemsTotal->toDecimalString();
            $order['delivery_charge'] = $delivery->toDecimalString();
            $order['discount']        = $discount->toDecimalString();
            $order['total']           = $total->toDecimalString();

            $orderId = Db::insert('orders', $order);

            foreach ($priced as $item) {
                $item['order_id'] = $orderId;
                Db::insert('order_items', $item);
            }

            Db::insert('order_status_history', [
                'tenant_id'  => $this->tenantId,
                'order_id'   => $orderId,
                'to_status'  => $order['status'] ?? 'new',
                'actor_type' => ($order['created_by'] ?? 'ai') === 'ai' ? 'ai' : 'user',
            ]);

            if (!empty($order['contact_id'])) {
                Db::execute(
                    'UPDATE contacts
                        SET lifetime_orders = lifetime_orders + 1,
                            lifetime_value  = lifetime_value + :v
                      WHERE id = :c AND tenant_id = :t',
                    ['v' => $total->toDecimalString(), 'c' => $order['contact_id'], 't' => $this->tenantId]
                );
            }

            return $orderId;
        });
    }

    /** Status change with transition validation, history and stock restore. */
    public function changeStatus(int $orderId, string $to, string $actorType = 'user', ?int $actorUserId = null, ?string $note = null): void
    {
        Db::transaction(function () use ($orderId, $to, $actorType, $actorUserId, $note): void {
            $order = $this->selectOne(
                'SELECT id, status FROM orders WHERE id = :id AND tenant_id = :t FOR UPDATE',
                ['id' => $orderId, 't' => $this->tenantId]
            );

            if ($order === null) {
                throw new ApiException('NOT_FOUND', 'Order not found.', 404);
            }

            $from = (string) $order['status'];

            if ($from === $to) {
                return;
            }

            if (!in_array($to, self::TRANSITIONS[$from] ?? [], true)) {
                throw new ApiException(
                    'INVALID_TRANSITION',
                    "An order cannot go from {$from} to {$to}.",
                    422,
                    ['from' => $from, 'to' => $to, 'allowed' => self::TRANSITIONS[$from] ?? []]
                );
            }

            $stamps = match ($to) {
                'confirmed' => ', confirmed_at = NOW()',
                'courier'   => ', shipped_at = NOW()',
                'completed' => ', completed_at = NOW()',
                default     => '',
            };

            Db::execute(
                "UPDATE orders SET status = :s {$stamps} WHERE id = :id AND tenant_id = :t",
                ['s' => $to, 'id' => $orderId, 't' => $this->tenantId]
            );

            // Cancelling or returning must give the stock back, or the shop
            // slowly shows out-of-stock for items sitting on the shelf.
            if (in_array($to, ['cancelled', 'returned'], true)) {
                $productRepo = new ProductRepository($this->tenantId);
                foreach ($this->select(
                    'SELECT product_id, qty FROM order_items WHERE order_id = :o AND tenant_id = :t',
                    ['o' => $orderId, 't' => $this->tenantId]
                ) as $item) {
                    if ($item['product_id'] !== null) {
                        $productRepo->restoreStock((int) $item['product_id'], (int) $item['qty']);
                    }
                }
            }

            Db::insert('order_status_history', [
                'tenant_id'     => $this->tenantId,
                'order_id'      => $orderId,
                'from_status'   => $from,
                'to_status'     => $to,
                'actor_type'    => $actorType,
                'actor_user_id' => $actorUserId,
                'note'          => $note,
            ]);
        });
    }

    /** Revenue series for the dashboard — reads analytics_daily, not orders. */
    public function revenueByDay(int $days = 30): array
    {
        return $this->select(
            'SELECT stat_date, revenue, orders_created, orders_completed
               FROM analytics_daily
              WHERE tenant_id = :t AND stat_date >= DATE_SUB(CURDATE(), INTERVAL :d DAY)
              ORDER BY stat_date',
            ['t' => $this->tenantId, 'd' => $days]
        );
    }

    public function nextOrderNo(): string
    {
        // Per-tenant sequence scoped to the day, readable over the phone.
        $prefix = date('ymd');
        $n = (int) $this->scalar(
            "SELECT COUNT(*) FROM orders WHERE tenant_id = :t AND order_no LIKE :p",
            ['t' => $this->tenantId, 'p' => $prefix . '%']
        );

        return $prefix . str_pad((string) ($n + 1), 4, '0', STR_PAD_LEFT);
    }

    public static function allowedTransitions(string $from): array
    {
        return self::TRANSITIONS[$from] ?? [];
    }
}
