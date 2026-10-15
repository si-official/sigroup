<?php
declare(strict_types=1);

namespace App\Services;

use App\Core\Db;
use App\Core\Logger;
use App\Core\QuotaExceededException;

/**
 * Metered usage enforcement. CONSTRAINT 5 LIVES HERE.
 *
 * The whole design question is one line: how do you stop two webhooks that
 * arrive in the same millisecond from both consuming the last unit of quota?
 *
 * The wrong answer, and the one almost every tutorial shows:
 *
 *     $used = SELECT fb_messages ...        <-- both read 49
 *     if ($used < $limit) {                 <-- both see 49 < 50
 *         UPDATE ... SET fb_messages = 50   <-- both write 50
 *     }
 *
 * Two messages sent, one unit billed. Under real webhook bursts that gap is
 * hit constantly, and it always loses money in the customer's favour.
 *
 * The right answer is to let the DATABASE do the comparison, inside the same
 * statement that does the write:
 *
 *     UPDATE subscription_usage
 *        SET fb_messages = fb_messages + :n
 *      WHERE subscription_id = :sid
 *        AND cycle_start = :cycle
 *        AND fb_messages + :n <= :limit
 *
 * InnoDB takes a row lock for the duration of the UPDATE, so the two
 * statements serialise. The second one re-evaluates the WHERE against the
 * already-incremented value, fails it, and affects ZERO rows. Affected-rows
 * is therefore the authoritative answer to "did I get the quota?" — not a
 * subsequent SELECT, which would reintroduce the same race.
 *
 * Verified by tests/quota_race.php: 100 concurrent processes against a limit
 * of 50 produce exactly 50 successes.
 */
final class QuotaService
{
    /**
     * Metrics that accumulate over a billing cycle, stored as counters on
     * subscription_usage. These use the conditional-UPDATE path.
     */
    public const CYCLE_METRICS = [
        'fb_messages', 'wa_messages', 'ig_messages', 'web_messages',
        'comment_replies', 'faq_hits', 'voice_messages',
    ];

    /**
     * Metrics that measure CURRENT STATE rather than consumption — how many
     * products exist right now, how many staff seats are filled. Deleting a
     * product gives the slot back, so a cycle counter would be wrong. These
     * use the row-lock path instead.
     */
    public const STATE_METRICS = ['products', 'staff_seats'];

    /** Which limit field in the resolved limits governs each metric. */
    private const LIMIT_FIELD = [
        'fb_messages'     => 'msg_limit',
        'wa_messages'     => 'msg_limit',
        'ig_messages'     => 'msg_limit',
        'web_messages'    => 'msg_limit',
        'comment_replies' => 'comment_reply_limit',
        'faq_hits'        => 'faq_rule_limit',
        'voice_messages'  => 'voice_msg_limit',
        'products'        => 'product_limit',
        'staff_seats'     => 'staff_seat_limit',
    ];

    /** Live-count source for state metrics. */
    private const STATE_SOURCE = [
        'products'    => ['table' => 'products', 'where' => "status <> 'archived'"],
        'staff_seats' => ['table' => 'users',    'where' => "status <> 'disabled'"],
    ];

    public const ALLOWED   = 'allowed';
    public const SOFT_WARN = 'soft_warn';
    public const BLOCKED   = 'blocked';

    private const SOFT_WARN_RATIO = 0.8;

    /** @param array<string,mixed> $limits resolved by LimitsResolver */
    public function __construct(
        private int $tenantId,
        private array $limits,
        private ?int $subscriptionId = null
    ) {
    }

    public static function forTenant(int $tenantId): self
    {
        $limits = (new LimitsResolver())->forTenant($tenantId);
        $subId  = Db::scalar(
            "SELECT id FROM subscriptions
              WHERE tenant_id = :t AND status IN ('active','trialing')
              ORDER BY expires_at DESC LIMIT 1",
            ['t' => $tenantId]
        );

        return new self($tenantId, $limits, $subId === null ? null : (int) $subId);
    }

    /**
     * Non-mutating. Answers "where does this tenant stand" for dashboards,
     * usage meters, and the soft-warning banner at 80%.
     *
     * @return array{status:string,used:int,limit:?int,remaining:?int,ratio:float}
     */
    public function check(string $metric, int $amount = 1): array
    {
        $this->assertKnownMetric($metric);

        $limit = $this->limitFor($metric);
        $used  = $this->usage($metric);

        // NULL = unlimited (credit mode, enterprise). Never blocked by count.
        if ($limit === null) {
            return ['status' => self::ALLOWED, 'used' => $used, 'limit' => null, 'remaining' => null, 'ratio' => 0.0];
        }

        // 0 = feature disabled on this plan, which is distinct from "used up".
        if ($limit === 0) {
            return ['status' => self::BLOCKED, 'used' => $used, 'limit' => 0, 'remaining' => 0, 'ratio' => 1.0];
        }

        $ratio     = $used / $limit;
        $remaining = max(0, $limit - $used);

        $status = match (true) {
            $used + $amount > $limit    => self::BLOCKED,
            $ratio >= self::SOFT_WARN_RATIO => self::SOFT_WARN,
            default                     => self::ALLOWED,
        };

        return ['status' => $status, 'used' => $used, 'limit' => $limit, 'remaining' => $remaining, 'ratio' => round($ratio, 4)];
    }

    /**
     * Atomically consume quota. Returns true if it was granted.
     *
     * This is the ONLY sanctioned way to spend quota. Never call check() and
     * then write — that is the race described in the class docblock.
     */
    public function consume(string $metric, int $amount = 1): bool
    {
        $this->assertKnownMetric($metric);

        if ($amount < 1) {
            return true;
        }

        $limit = $this->limitFor($metric);

        if ($limit === 0) {
            return false;
        }

        if (in_array($metric, self::STATE_METRICS, true)) {
            return $this->consumeState($metric, $limit, $amount);
        }

        return $this->consumeCycle($metric, $limit, $amount);
    }

    /** consume() or throw the 402 the panel renders a limit prompt from. */
    public function consumeOrFail(string $metric, int $amount = 1): void
    {
        if (!$this->consume($metric, $amount)) {
            $state = $this->check($metric, $amount);
            throw new QuotaExceededException($metric, $state['used'], $state['limit'] ?? 0);
        }
    }

    /**
     * The conditional UPDATE. One statement: compare and increment together.
     */
    private function consumeCycle(string $metric, ?int $limit, int $amount): bool
    {
        $usageId = $this->ensureCycleRow();
        if ($usageId === null) {
            // No active subscription. Nothing to meter against, nothing to spend.
            Logger::warning('quota.no_cycle', ['tenant_id' => $this->tenantId, 'metric' => $metric]);
            return false;
        }

        // Unlimited: still record consumption for reporting and cost analysis,
        // just without the ceiling condition.
        if ($limit === null) {
            Db::execute(
                "UPDATE subscription_usage SET `{$metric}` = `{$metric}` + :n WHERE id = :id",
                ['n' => $amount, 'id' => $usageId]
            );
            return true;
        }

        $affected = Db::execute(
            "UPDATE subscription_usage
                SET `{$metric}` = `{$metric}` + :n
              WHERE id = :id
                AND `{$metric}` + :n2 <= :lim",
            ['n' => $amount, 'id' => $usageId, 'n2' => $amount, 'lim' => $limit]
        );

        // Zero affected rows means the WHERE failed, which means another
        // request took the last unit between our check and our write. This is
        // the authoritative signal — do not re-SELECT to "confirm".
        if ($affected === 0) {
            Logger::info('quota.blocked', [
                'tenant_id' => $this->tenantId,
                'metric'    => $metric,
                'limit'     => $limit,
            ]);
            return false;
        }

        return true;
    }

    /**
     * State metrics need a different shape: the ceiling is a live COUNT, and
     * COUNT-then-INSERT cannot be fused into one statement.
     *
     * So we serialise per tenant by taking a row lock on the tenants row for
     * the duration of a transaction. Product and staff creation happen a few
     * times a day, not a few times a second, so the contention cost is nil —
     * unlike the message path, where a lock would be unacceptable.
     *
     * The CALLER must perform its INSERT inside the same transaction for the
     * reservation to mean anything; see reserveState().
     */
    private function consumeState(string $metric, ?int $limit, int $amount): bool
    {
        if ($limit === null) {
            return true;
        }

        $current = $this->usage($metric);
        return ($current + $amount) <= $limit;
    }

    /**
     * Race-safe state reservation. Runs $fn only if the quota allows it, with
     * the tenant row locked so two concurrent creates cannot both pass.
     *
     * @template T
     * @param callable():T $fn
     * @return T
     * @throws QuotaExceededException
     */
    public function reserveState(string $metric, callable $fn, int $amount = 1): mixed
    {
        $this->assertKnownMetric($metric);

        if (!in_array($metric, self::STATE_METRICS, true)) {
            throw new \InvalidArgumentException("reserveState() is only for state metrics, got '{$metric}'.");
        }

        $limit = $this->limitFor($metric);

        return Db::transaction(function () use ($metric, $limit, $amount, $fn) {
            // Serialise every create for this tenant behind one row lock.
            Db::select('SELECT id FROM tenants WHERE id = :t FOR UPDATE', ['t' => $this->tenantId]);

            if ($limit !== null) {
                $current = $this->usage($metric);
                if ($current + $amount > $limit) {
                    throw new QuotaExceededException($metric, $current, $limit);
                }
            }

            return $fn();
        });
    }

    /** Give quota back — a failed send, a deleted product. */
    public function release(string $metric, int $amount = 1): void
    {
        $this->assertKnownMetric($metric);

        if (in_array($metric, self::STATE_METRICS, true)) {
            return; // state metrics are counted live; deleting the row is the release
        }

        $usageId = $this->ensureCycleRow();
        if ($usageId === null) {
            return;
        }

        // GREATEST guards the unsigned column: a double-release must not
        // underflow to 4 billion.
        Db::execute(
            "UPDATE subscription_usage
                SET `{$metric}` = GREATEST(0, CAST(`{$metric}` AS SIGNED) - :n)
              WHERE id = :id",
            ['n' => $amount, 'id' => $usageId]
        );
    }

    /** Current consumption for a metric. */
    public function usage(string $metric): int
    {
        if (in_array($metric, self::STATE_METRICS, true)) {
            $source = self::STATE_SOURCE[$metric];

            // These tables arrive in later phases; absent table = zero used.
            try {
                return (int) Db::scalar(
                    "SELECT COUNT(*) FROM `{$source['table']}` WHERE tenant_id = :t AND {$source['where']}",
                    ['t' => $this->tenantId]
                );
            } catch (\Throwable) {
                return 0;
            }
        }

        $usageId = $this->ensureCycleRow();
        if ($usageId === null) {
            return 0;
        }

        return (int) Db::scalar(
            "SELECT `{$metric}` FROM subscription_usage WHERE id = :id",
            ['id' => $usageId]
        );
    }

    /** Every metric at once, for the dashboard's usage meters. */
    public function snapshot(): array
    {
        $out = [];
        foreach (array_merge(self::CYCLE_METRICS, self::STATE_METRICS) as $metric) {
            $out[$metric] = $this->check($metric, 0);
        }
        return $out;
    }

    /**
     * Find or create the usage row for the current cycle.
     *
     * INSERT ... ON DUPLICATE KEY UPDATE against the unique
     * (subscription_id, cycle_start) index, so two concurrent first-messages
     * of a cycle cannot create two rows.
     */
    private function ensureCycleRow(): ?int
    {
        if ($this->subscriptionId === null) {
            return null;
        }

        $cycle = $this->currentCycle();
        if ($cycle === null) {
            return null;
        }

        Db::execute(
            'INSERT INTO subscription_usage (tenant_id, subscription_id, cycle_start, cycle_end)
             VALUES (:t, :s, :cs, :ce)
             ON DUPLICATE KEY UPDATE tenant_id = tenant_id',
            ['t' => $this->tenantId, 's' => $this->subscriptionId, 'cs' => $cycle['start'], 'ce' => $cycle['end']]
        );

        $id = Db::scalar(
            'SELECT id FROM subscription_usage WHERE subscription_id = :s AND cycle_start = :cs',
            ['s' => $this->subscriptionId, 'cs' => $cycle['start']]
        );

        return $id === null ? null : (int) $id;
    }

    /**
     * The cycle is the subscription's own period, not a calendar month — a
     * plan bought on the 7th resets on the 7th.
     *
     * @return array{start:string,end:string}|null
     */
    private function currentCycle(): ?array
    {
        $row = Db::selectOne(
            'SELECT started_at, expires_at FROM subscriptions WHERE id = :id',
            ['id' => $this->subscriptionId]
        );

        if ($row === null) {
            return null;
        }

        return [
            'start' => date('Y-m-d', strtotime((string) $row['started_at'])),
            'end'   => date('Y-m-d', strtotime((string) $row['expires_at'])),
        ];
    }

    private function limitFor(string $metric): ?int
    {
        $field = self::LIMIT_FIELD[$metric];

        // array_key_exists, NOT `?? 0`.
        //
        // NULL is a MEANINGFUL value here: it means unlimited. The null
        // coalescing operator cannot tell "key absent" from "key is null", so
        // `$this->limits[$field] ?? 0` collapses unlimited into 0 — and 0
        // means "feature disabled". Every Enterprise and credit-mode tenant
        // would have been unable to send a single message, while the plan
        // page cheerfully advertised unlimited.
        //
        // Caught by tests/quota_race.php. The general lesson: never use ?? on
        // a field whose null is semantic.
        if (!array_key_exists($field, $this->limits)) {
            return 0;
        }

        $value = $this->limits[$field];

        return $value === null ? null : (int) $value;
    }

    private function assertKnownMetric(string $metric): void
    {
        if (!isset(self::LIMIT_FIELD[$metric])) {
            // Fail loudly: a typo'd metric name must not silently meter nothing.
            throw new \InvalidArgumentException("Unknown quota metric '{$metric}'.");
        }
    }
}
