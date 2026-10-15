<?php
declare(strict_types=1);

namespace App\Repositories;

use App\Core\Db;

/**
 * The inbox is the screen shop owners live in, so these queries are written
 * to be index-only and N+1-free.
 */
final class ConversationRepository extends BaseRepository
{
    protected string $table = 'conversations';

    /**
     * ONE query for the whole inbox list.
     *
     * The naive version selects conversations then loops to fetch each one's
     * last message and contact — 1 + 2N queries for a 30-row page. Here the
     * contact is a single join, and the last message is NOT joined at all:
     * conversations carries denormalised last_message_* columns, maintained by
     * MessageRepository::append() inside the same transaction as the insert.
     *
     * That denormalisation is the difference between an inbox that opens
     * instantly and one that crawls at 50k messages.
     *
     * @param array<string,mixed> $filters
     * @return array{items:array<int,array<string,mixed>>,next_cursor:?string}
     */
    public function inboxPage(array $filters = [], ?string $cursor = null, int $limit = 30): array
    {
        $limit = max(1, min($limit, 100));

        $where    = ['c.tenant_id = ' . (int) $this->tenantId];
        $bindings = [];

        if (!empty($filters['status'])) {
            $where[] = 'c.status = :status';
            $bindings['status'] = $filters['status'];
        }
        if (!empty($filters['channel_id'])) {
            $where[] = 'c.channel_id = :channel_id';
            $bindings['channel_id'] = (int) $filters['channel_id'];
        }
        if (!empty($filters['channel_type'])) {
            $where[] = 'ch.type = :channel_type';
            $bindings['channel_type'] = $filters['channel_type'];
        }
        if (!empty($filters['assigned_user_id'])) {
            $where[] = 'c.assigned_user_id = :assigned';
            $bindings['assigned'] = (int) $filters['assigned_user_id'];
        }
        if (!empty($filters['starred'])) {
            $where[] = 'c.is_starred = 1';
        }
        if (!empty($filters['unread'])) {
            $where[] = 'c.unread_count > 0';
        }
        if (!empty($filters['search'])) {
            // Contact-name/phone search only. Full-text message search is a
            // separate, deliberately slower path — see searchMessages().
            $where[] = '(ct.name LIKE :q OR ct.phone LIKE :q2)';
            $bindings['q']  = '%' . $filters['search'] . '%';
            $bindings['q2'] = '%' . $filters['search'] . '%';
        }

        // Keyset pagination on (last_message_at, id): a plain OFFSET drifts as
        // new messages arrive while the owner is reading the list.
        if ($cursor !== null) {
            $decoded = $this->decodeCompositeCursor($cursor);
            if ($decoded !== null) {
                $where[] = '(c.last_message_at < :cur_ts OR (c.last_message_at = :cur_ts2 AND c.id < :cur_id))';
                $bindings['cur_ts']  = $decoded['ts'];
                $bindings['cur_ts2'] = $decoded['ts'];
                $bindings['cur_id']  = $decoded['id'];
            }
        }

        $sql = 'SELECT c.id, c.status, c.is_starred, c.ai_enabled, c.ai_paused_until,
                       c.unread_count, c.message_count, c.last_message_at,
                       c.last_message_text, c.last_message_from, c.assigned_user_id,
                       ch.type AS channel_type, ch.display_name AS channel_name,
                       ct.id AS contact_id, ct.name AS contact_name, ct.phone AS contact_phone,
                       ct.avatar_url, ct.lifetime_orders
                  FROM conversations c
                  JOIN channels ch ON ch.id = c.channel_id
                  JOIN contacts ct ON ct.id = c.contact_id
                 WHERE ' . implode(' AND ', $where) . '
                 ORDER BY c.last_message_at DESC, c.id DESC
                 LIMIT ' . ($limit + 1);

        $rows    = $this->select($sql, $bindings);
        $hasMore = count($rows) > $limit;

        if ($hasMore) {
            array_pop($rows);
        }

        $next = null;
        if ($hasMore && $rows !== []) {
            $last = $rows[count($rows) - 1];
            $next = $this->encodeCompositeCursor((string) $last['last_message_at'], (int) $last['id']);
        }

        return ['items' => $rows, 'next_cursor' => $next];
    }

    /** Unread/active counts for the filter chips — one grouped query, not five. */
    public function inboxCounts(): array
    {
        $row = $this->selectOne(
            "SELECT
                COUNT(*)                                        AS total,
                SUM(status = 'open')                            AS open,
                SUM(status = 'active')                          AS active,
                SUM(status = 'resolved')                        AS resolved,
                SUM(is_starred = 1)                             AS starred,
                SUM(unread_count > 0)                           AS unread,
                SUM(ai_enabled = 0 OR ai_paused_until > NOW())  AS human_handled
               FROM conversations
              WHERE tenant_id = :t",
            ['t' => $this->tenantId]
        ) ?? [];

        return array_map(static fn ($v) => (int) $v, $row);
    }

    /** Find or create the conversation for an inbound message. */
    public function openFor(int $channelId, int $contactId): int
    {
        $existing = $this->selectOne(
            "SELECT id FROM conversations
              WHERE tenant_id = :t AND channel_id = :ch AND contact_id = :ct
                AND status <> 'spam'
              ORDER BY id DESC LIMIT 1",
            ['t' => $this->tenantId, 'ch' => $channelId, 'ct' => $contactId]
        );

        if ($existing !== null) {
            return (int) $existing['id'];
        }

        return $this->create([
            'channel_id' => $channelId,
            'contact_id' => $contactId,
            'status'     => 'open',
        ]);
    }

    /** True when the AI must stay silent (manual takeover in effect). */
    public function isAiPaused(int $conversationId): bool
    {
        $row = $this->selectOne(
            'SELECT ai_enabled, ai_paused_until FROM conversations
              WHERE id = :id AND tenant_id = :t',
            ['id' => $conversationId, 't' => $this->tenantId]
        );

        if ($row === null) {
            return true;
        }

        return (int) $row['ai_enabled'] === 0
            || ($row['ai_paused_until'] !== null && strtotime((string) $row['ai_paused_until']) > time());
    }

    public function pauseAi(int $conversationId, int $minutes): void
    {
        $this->execute(
            'UPDATE conversations
                SET ai_paused_until = DATE_ADD(NOW(), INTERVAL :m MINUTE)
              WHERE id = :id AND tenant_id = :t',
            ['m' => $minutes, 'id' => $conversationId, 't' => $this->tenantId]
        );
    }

    public function markRead(int $conversationId): void
    {
        $this->execute(
            'UPDATE conversations SET unread_count = 0 WHERE id = :id AND tenant_id = :t',
            ['id' => $conversationId, 't' => $this->tenantId]
        );
    }

    /**
     * Conversations that went quiet and are eligible for a follow-up.
     * Used by the scheduler, so it must stay index-friendly.
     *
     * @return array<int,array<string,mixed>>
     */
    public function quietSince(int $minutes, int $limit = 200): array
    {
        return $this->select(
            "SELECT c.id, c.contact_id, c.last_message_at, c.last_message_from
               FROM conversations c
              WHERE c.tenant_id = :t
                AND c.ai_enabled = 1
                AND c.status IN ('open','active')
                AND c.last_message_from = 'customer'
                AND c.last_message_at < DATE_SUB(NOW(), INTERVAL :m MINUTE)
                AND NOT EXISTS (
                      SELECT 1 FROM followup_jobs fj
                       WHERE fj.conversation_id = c.id AND fj.status = 'pending'
                    )
              ORDER BY c.last_message_at ASC
              LIMIT {$limit}",
            ['t' => $this->tenantId, 'm' => $minutes]
        );
    }

    private function encodeCompositeCursor(string $ts, int $id): string
    {
        $payload = $ts . '|' . $id;
        $sig     = substr(hash_hmac('sha256', $payload, \App\Core\Env::string('JWT_SECRET')), 0, 16);
        return rtrim(strtr(base64_encode($payload . '|' . $sig), '+/', '-_'), '=');
    }

    /** @return array{ts:string,id:int}|null */
    private function decodeCompositeCursor(string $cursor): ?array
    {
        $raw = base64_decode(strtr($cursor, '-_', '+/'), true);
        if ($raw === false) {
            return null;
        }

        $parts = explode('|', $raw);
        if (count($parts) !== 3) {
            return null;
        }

        [$ts, $id, $sig] = $parts;
        $expected = substr(hash_hmac('sha256', $ts . '|' . $id, \App\Core\Env::string('JWT_SECRET')), 0, 16);

        if (!hash_equals($expected, $sig) || !ctype_digit($id)) {
            return null;
        }

        return ['ts' => $ts, 'id' => (int) $id];
    }
}
