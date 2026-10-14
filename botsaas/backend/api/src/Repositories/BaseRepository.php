<?php
declare(strict_types=1);

namespace App\Repositories;

use App\Core\Context;
use App\Core\Db;
use App\Core\Logger;
use App\Core\NotFoundException;
use App\Core\TenantScopeViolationException;

/**
 * Tenant-scoped repository base.
 *
 * CONSTRAINT 4 LIVES HERE. Multi-tenancy is a security boundary, not a filter
 * someone remembers to add. So:
 *
 *  - tenant_id is taken from Context (the JWT), never from a request body,
 *    query string, or an id the LLM produced in a tool call;
 *  - find/all/create/update/delete append it automatically;
 *  - raw SQL goes through guardSql(), which refuses to run a statement that
 *    touches a tenant-owned table without mentioning tenant_id.
 *
 * On the guard's limits, stated plainly: it is a lexical check, so it catches
 * the realistic mistake (a developer writing `WHERE id = :id` and forgetting
 * the tenant) but it cannot prove correctness — `WHERE tenant_id = 5` hardcoded
 * would satisfy it. It is a seatbelt, not a proof. The actual proof is the
 * cross-tenant test suite required by Phase 3's acceptance criteria. Treat any
 * throw from here as a security bug, never as something to work around by
 * calling Db directly.
 */
abstract class BaseRepository
{
    /** Table this repository owns. */
    protected string $table = '';

    /** Set false for global tables (packages, ai_models, settings, migrations). */
    protected bool $tenantOwned = true;

    /** Columns writable through create/update. Empty = allow all (discouraged). */
    protected array $fillable = [];

    protected ?int $tenantId;

    /**
     * Every table carrying tenant data. The guard consults this list, so a new
     * tenant-owned table MUST be added here in the same commit that creates it.
     * Forgetting is the one way to defeat the guard, which is why it is a single
     * visible list rather than a convention.
     *
     * Read via static:: so a subclass CAN narrow or extend it. It was self::
     * first, and that silently disabled the guard for any subclass that
     * overrode the list — the guard reported nothing and looked healthy.
     * Caught by tests/tenant_isolation.php; the lesson is that a security
     * check which can fail open must have a test that proves it fires.
     */
    protected const TENANT_OWNED_TABLES = [
        'users', 'audit_logs', 'subscriptions', 'subscription_usage', 'wallets',
        'wallet_transactions', 'payments', 'tenant_ai_keys', 'ai_requests',
        'prompt_templates', 'channels', 'bot_configs', 'bot_settings',
        'widget_settings', 'contacts', 'conversations', 'messages',
        'voice_messages', 'product_categories', 'products', 'orders',
        'order_status_history', 'order_guards', 'leads', 'courier_accounts',
        'courier_shipments', 'instant_replies', 'comment_automations',
        'comment_logs', 'followup_sequences', 'followup_jobs', 'activity_logs',
        'analytics_daily', 'notifications', 'support_tickets', 'api_tokens',
        'media_files',
    ];

    public function __construct(?int $tenantId = null)
    {
        // Default to the authenticated tenant. An explicit id is accepted only
        // for jobs and platform tooling, which run outside a request context.
        $this->tenantId = $tenantId ?? Context::current()->tenantIdOrNull();

        if ($this->tenantOwned && $this->tenantId === null) {
            throw new TenantScopeViolationException(
                static::class . ' is tenant-owned but was constructed without a tenant_id. '
                . 'Pass one explicitly in job/CLI context, or ensure TenantScope middleware ran.'
            );
        }

        if ($this->table === '') {
            throw new TenantScopeViolationException(static::class . ' must define $table.');
        }
    }

    // ---------------------------------------------------------------- reads

    /** @return array<string,mixed>|null */
    public function find(int $id, array $columns = ['*']): ?array
    {
        return $this->selectOne(
            sprintf('SELECT %s FROM `%s` WHERE id = :id', $this->cols($columns), $this->table)
            . $this->andTenant(),
            ['id' => $id]
        );
    }

    /** @return array<string,mixed> */
    public function findOrFail(int $id, array $columns = ['*']): array
    {
        $row = $this->find($id, $columns);
        if ($row === null) {
            // Deliberately indistinguishable from "belongs to another tenant".
            // A 404-vs-403 difference here would leak the existence of other
            // tenants' records to anyone probing sequential ids.
            throw new NotFoundException('Record not found.');
        }
        return $row;
    }

    /**
     * @param array<string,mixed> $where column => value (or column => [op, value])
     * @return array<int,array<string,mixed>>
     */
    public function all(array $where = [], array $columns = ['*'], ?string $orderBy = null, int $limit = 100): array
    {
        [$clause, $bindings] = $this->buildWhere($where);

        $sql = sprintf('SELECT %s FROM `%s` WHERE %s', $this->cols($columns), $this->table, $clause);
        if ($orderBy !== null) {
            $sql .= ' ORDER BY ' . $this->safeOrderBy($orderBy);
        }
        $sql .= ' LIMIT ' . max(1, min($limit, 1000));

        return $this->select($sql, $bindings);
    }

    /** @param array<string,mixed> $where */
    public function first(array $where, array $columns = ['*'], ?string $orderBy = null): ?array
    {
        $rows = $this->all($where, $columns, $orderBy, 1);
        return $rows[0] ?? null;
    }

    /** @param array<string,mixed> $where */
    public function count(array $where = []): int
    {
        [$clause, $bindings] = $this->buildWhere($where);
        return (int) $this->scalar(
            sprintf('SELECT COUNT(*) FROM `%s` WHERE %s', $this->table, $clause),
            $bindings
        );
    }

    /** @param array<string,mixed> $where */
    public function exists(array $where): bool
    {
        return $this->count($where) > 0;
    }

    /**
     * Cursor pagination over an auto-increment id.
     *
     * @param array<string,mixed> $where
     * @return array{items:array<int,array<string,mixed>>,next_cursor:?string}
     */
    public function paginate(array $where = [], int $limit = 30, ?string $cursor = null, string $direction = 'DESC'): array
    {
        $limit = max(1, min($limit, 100)); // constraint: max 100 per page
        [$clause, $bindings] = $this->buildWhere($where);

        $dir = strtoupper($direction) === 'ASC' ? 'ASC' : 'DESC';

        if ($cursor !== null) {
            $decoded = $this->decodeCursor($cursor);
            if ($decoded !== null) {
                $clause .= $dir === 'DESC' ? ' AND id < :cursor_id' : ' AND id > :cursor_id';
                $bindings['cursor_id'] = $decoded;
            }
        }

        // Fetch one extra to know whether another page exists, without a COUNT.
        $rows = $this->select(
            sprintf('SELECT * FROM `%s` WHERE %s ORDER BY id %s LIMIT %d', $this->table, $clause, $dir, $limit + 1),
            $bindings
        );

        $hasMore = count($rows) > $limit;
        if ($hasMore) {
            array_pop($rows);
        }

        $next = $hasMore && $rows !== []
            ? $this->encodeCursor((int) $rows[count($rows) - 1]['id'])
            : null;

        return ['items' => $rows, 'next_cursor' => $next];
    }

    // --------------------------------------------------------------- writes

    /** @param array<string,mixed> $data */
    public function create(array $data): int
    {
        $data = $this->filterFillable($data);

        if ($this->tenantOwned) {
            // Overwrite rather than merge: a client-supplied tenant_id in the
            // payload must never win over the authenticated one.
            $data['tenant_id'] = $this->tenantId;
        }

        return Db::insert($this->table, $data);
    }

    /** @param array<string,mixed> $data @return int rows affected */
    public function update(int $id, array $data): int
    {
        $data = $this->filterFillable($data);
        unset($data['id'], $data['tenant_id']); // never reassign ownership

        if ($data === []) {
            return 0;
        }

        $sets = implode(', ', array_map(fn ($c) => "`{$c}` = :{$c}", array_keys($data)));

        return $this->execute(
            sprintf('UPDATE `%s` SET %s WHERE id = :_id', $this->table, $sets) . $this->andTenant(),
            $data + ['_id' => $id]
        );
    }

    public function delete(int $id): int
    {
        return $this->execute(
            sprintf('DELETE FROM `%s` WHERE id = :id', $this->table) . $this->andTenant(),
            ['id' => $id]
        );
    }

    /** @param array<string,mixed> $where */
    public function deleteWhere(array $where): int
    {
        if ($where === []) {
            throw new TenantScopeViolationException('deleteWhere() requires at least one condition.');
        }
        [$clause, $bindings] = $this->buildWhere($where);
        return $this->execute(sprintf('DELETE FROM `%s` WHERE %s', $this->table, $clause), $bindings);
    }

    /**
     * Insert-or-update on a unique key.
     * @param array<string,mixed> $match @param array<string,mixed> $data
     */
    public function upsert(array $match, array $data): int
    {
        $existing = $this->first($match, ['id']);
        if ($existing !== null) {
            $this->update((int) $existing['id'], $data);
            return (int) $existing['id'];
        }
        return $this->create(array_merge($match, $data));
    }

    // ------------------------------------------------------- guarded access

    /**
     * Raw SELECT for the hand-written queries real features need (joins,
     * window functions, the inbox page query). Still guarded.
     *
     * @return array<int,array<string,mixed>>
     */
    protected function select(string $sql, array $bindings = []): array
    {
        $this->guardSql($sql);
        return Db::select($sql, $bindings);
    }

    /** @return array<string,mixed>|null */
    protected function selectOne(string $sql, array $bindings = []): ?array
    {
        $this->guardSql($sql);
        return Db::selectOne($sql, $bindings);
    }

    protected function scalar(string $sql, array $bindings = []): mixed
    {
        $this->guardSql($sql);
        return Db::scalar($sql, $bindings);
    }

    protected function execute(string $sql, array $bindings = []): int
    {
        $this->guardSql($sql);
        return Db::execute($sql, $bindings);
    }

    /**
     * Refuses any statement that references a tenant-owned table without
     * mentioning tenant_id. See the class docblock for what this does and
     * does not prove.
     */
    protected function guardSql(string $sql): void
    {
        $normalized = strtolower(preg_replace('/\s+/', ' ', $sql) ?? $sql);

        // Strip string literals so a product name containing a table name
        // cannot trip or satisfy the check.
        $normalized = preg_replace("/'[^']*'/", "''", $normalized) ?? $normalized;

        $touched = [];
        foreach (static::TENANT_OWNED_TABLES as $table) {
            if (preg_match('/\b(from|join|into|update)\s+`?' . preg_quote($table, '/') . '`?\b/', $normalized) === 1) {
                $touched[] = $table;
            }
        }

        if ($touched === []) {
            return;
        }

        if (!str_contains($normalized, 'tenant_id')) {
            $message = sprintf(
                'Tenant scope violation in %s: query touches tenant-owned table(s) [%s] '
                . 'without a tenant_id condition. SQL: %s',
                static::class,
                implode(', ', $touched),
                mb_substr($sql, 0, 400)
            );

            Logger::critical('security.tenant_scope_violation', [
                'repository' => static::class,
                'tables'     => $touched,
                'sql'        => mb_substr($sql, 0, 400),
            ]);

            throw new TenantScopeViolationException($message);
        }
    }

    // ------------------------------------------------------------- internals

    /** ' AND tenant_id = :_tenant_id' for tenant-owned tables, '' otherwise. */
    private function andTenant(): string
    {
        return $this->tenantOwned ? ' AND tenant_id = ' . (int) $this->tenantId : '';
    }

    /**
     * @param array<string,mixed> $where
     * @return array{0:string,1:array<string,mixed>}
     */
    protected function buildWhere(array $where): array
    {
        $parts    = [];
        $bindings = [];

        if ($this->tenantOwned) {
            // Inlined as an integer, not a placeholder: it can never be
            // accidentally rebound by a caller's $bindings array.
            $parts[] = 'tenant_id = ' . (int) $this->tenantId;
        } else {
            $parts[] = '1 = 1';
        }

        $i = 0;
        foreach ($where as $column => $value) {
            $this->assertColumnName($column);
            $placeholder = 'w' . $i++;

            if (is_array($value) && count($value) === 2 && is_string($value[0])) {
                [$op, $operand] = $value;
                $op = strtoupper(trim($op));
                if (!in_array($op, ['=', '!=', '<>', '<', '<=', '>', '>=', 'LIKE', 'NOT LIKE'], true)) {
                    throw new TenantScopeViolationException("Unsupported operator '{$op}'.");
                }
                $parts[] = "`{$column}` {$op} :{$placeholder}";
                $bindings[$placeholder] = $operand;
                continue;
            }

            if (is_array($value)) {
                if ($value === []) {
                    $parts[] = '1 = 0'; // IN () is a syntax error; empty set matches nothing
                    continue;
                }
                $names = [];
                foreach (array_values($value) as $k => $v) {
                    $n = $placeholder . '_' . $k;
                    $names[] = ':' . $n;
                    $bindings[$n] = $v;
                }
                $parts[] = "`{$column}` IN (" . implode(', ', $names) . ')';
                continue;
            }

            if ($value === null) {
                $parts[] = "`{$column}` IS NULL";
                continue;
            }

            $parts[] = "`{$column}` = :{$placeholder}";
            $bindings[$placeholder] = $value;
        }

        return [implode(' AND ', $parts), $bindings];
    }

    private function cols(array $columns): string
    {
        if ($columns === ['*']) {
            return '*';
        }
        foreach ($columns as $c) {
            $this->assertColumnName($c);
        }
        return implode(', ', array_map(fn ($c) => "`{$c}`", $columns));
    }

    /** Column names are never user input, but an identifier cannot be bound. */
    private function assertColumnName(string $name): void
    {
        if (preg_match('/^[a-zA-Z_][a-zA-Z0-9_]*$/', $name) !== 1) {
            throw new TenantScopeViolationException("Illegal column identifier: {$name}");
        }
    }

    private function safeOrderBy(string $orderBy): string
    {
        $parts = [];
        foreach (explode(',', $orderBy) as $segment) {
            $segment = trim($segment);
            if (preg_match('/^([a-zA-Z_][a-zA-Z0-9_]*)(\s+(ASC|DESC))?$/i', $segment, $m) !== 1) {
                throw new TenantScopeViolationException("Illegal ORDER BY: {$segment}");
            }
            $parts[] = '`' . $m[1] . '`' . (isset($m[3]) ? ' ' . strtoupper($m[3]) : '');
        }
        return implode(', ', $parts);
    }

    /** @param array<string,mixed> $data */
    private function filterFillable(array $data): array
    {
        if ($this->fillable === []) {
            return $data;
        }
        return array_intersect_key($data, array_flip($this->fillable));
    }

    /**
     * Cursors are opaque and signed. Unsigned cursors let a client page into
     * arbitrary id ranges; signing means a tampered cursor is simply ignored.
     */
    protected function encodeCursor(int $id): string
    {
        $payload = (string) $id;
        $sig     = substr(hash_hmac('sha256', $payload, \App\Core\Env::string('JWT_SECRET')), 0, 16);
        return rtrim(strtr(base64_encode($payload . '.' . $sig), '+/', '-_'), '=');
    }

    protected function decodeCursor(string $cursor): ?int
    {
        $raw = base64_decode(strtr($cursor, '-_', '+/'), true);
        if ($raw === false || !str_contains($raw, '.')) {
            return null;
        }
        [$payload, $sig] = explode('.', $raw, 2);
        $expected = substr(hash_hmac('sha256', $payload, \App\Core\Env::string('JWT_SECRET')), 0, 16);
        if (!hash_equals($expected, $sig) || !ctype_digit($payload)) {
            Logger::warning('pagination.bad_cursor');
            return null;
        }
        return (int) $payload;
    }

    public function tenantId(): ?int
    {
        return $this->tenantId;
    }
}
