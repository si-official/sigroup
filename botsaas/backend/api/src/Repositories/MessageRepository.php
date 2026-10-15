<?php
declare(strict_types=1);

namespace App\Repositories;

use App\Core\Db;
use PDOException;

final class MessageRepository extends BaseRepository
{
    protected string $table = 'messages';

    /**
     * Insert a message and keep the conversation's denormalised columns in
     * step, in ONE transaction.
     *
     * The denormalisation is what lets inboxPage() avoid joining messages at
     * all; doing it here, transactionally, is what keeps it from drifting.
     *
     * Returns 0 when the message was a duplicate — Meta redelivers webhooks,
     * and the unique (conversation_id, external_message_id) index turns the
     * replay into a no-op rather than a second reply to the customer.
     */
    public function append(array $data): int
    {
        $data['tenant_id'] = $this->tenantId;

        return Db::transaction(function () use ($data): int {
            try {
                $id = Db::insert('messages', $data);
            } catch (PDOException $e) {
                if ($e->getCode() === '23000') {
                    return 0; // duplicate delivery
                }
                throw $e;
            }

            $preview = $this->preview((string) ($data['body'] ?? ''), (string) ($data['type'] ?? 'text'));

            Db::execute(
                'UPDATE conversations
                    SET last_message_at   = COALESCE(:created, NOW(3)),
                        last_message_text = :preview,
                        last_message_from = :sender,
                        message_count     = message_count + 1,
                        unread_count      = unread_count + :inc,
                        status            = IF(status = :resolved, :active, status)
                  WHERE id = :cid AND tenant_id = :t',
                [
                    'created'  => $data['created_at'] ?? null,
                    'preview'  => $preview,
                    'sender'   => $data['sender'],
                    // Only an inbound customer message makes a thread unread.
                    'inc'      => ($data['direction'] ?? 'in') === 'in' ? 1 : 0,
                    'resolved' => 'resolved',
                    'active'   => 'active',
                    'cid'      => $data['conversation_id'],
                    't'        => $this->tenantId,
                ]
            );

            return $id;
        });
    }

    /**
     * The last N turns, oldest-first, ready to hand to the prompt builder.
     *
     * Ordered DESC with a LIMIT so the index does the work, then reversed in
     * PHP — ordering ASC would force a filesort over the whole conversation.
     *
     * @return array<int,array{role:string,content:string,type:string}>
     */
    public function lastNTurns(int $conversationId, int $n = 10, ?int $afterId = null): array
    {
        $bindings = ['cid' => $conversationId, 't' => $this->tenantId];
        $extra    = '';

        if ($afterId !== null) {
            // Everything newer than the rolling summary's cut-off.
            $extra = ' AND id > :after';
            $bindings['after'] = $afterId;
        }

        $rows = $this->select(
            "SELECT id, sender, direction, type, body, created_at
               FROM messages
              WHERE conversation_id = :cid AND tenant_id = :t
                AND body IS NOT NULL AND body <> ''
                {$extra}
              ORDER BY id DESC
              LIMIT " . max(1, min($n, 100)),
            $bindings
        );

        $rows = array_reverse($rows);

        return array_map(static fn (array $m) => [
            'role'    => $m['sender'] === 'customer' ? 'user' : 'assistant',
            'content' => (string) $m['body'],
            'type'    => (string) $m['type'],
            'id'      => (int) $m['id'],
        ], $rows);
    }

    /**
     * Thread view: newest first, infinite-scrolling upward.
     * @return array{items:array<int,array<string,mixed>>,next_cursor:?string}
     */
    public function threadPage(int $conversationId, ?string $cursor = null, int $limit = 50): array
    {
        $limit    = max(1, min($limit, 100));
        $bindings = ['cid' => $conversationId, 't' => $this->tenantId];
        $extra    = '';

        if ($cursor !== null) {
            $before = $this->decodeCursor($cursor);
            if ($before !== null) {
                $extra = ' AND id < :before';
                $bindings['before'] = $before;
            }
        }

        $rows = $this->select(
            "SELECT id, direction, sender, sender_user_id, type, body, attachments,
                    source, status, error_message, created_at
               FROM messages
              WHERE conversation_id = :cid AND tenant_id = :t {$extra}
              ORDER BY id DESC
              LIMIT " . ($limit + 1),
            $bindings
        );

        $hasMore = count($rows) > $limit;
        if ($hasMore) {
            array_pop($rows);
        }

        return [
            'items'       => array_reverse($rows),
            'next_cursor' => $hasMore && $rows !== [] ? $this->encodeCursor((int) end($rows)['id']) : null,
        ];
    }

    /**
     * Loop breaker: how many consecutive outbound messages have we sent with
     * no customer message in between? Above a threshold the bot is talking to
     * itself and must stop.
     */
    public function consecutiveOutbound(int $conversationId): int
    {
        $rows = $this->select(
            "SELECT direction FROM messages
              WHERE conversation_id = :cid AND tenant_id = :t
              ORDER BY id DESC LIMIT 10",
            ['cid' => $conversationId, 't' => $this->tenantId]
        );

        $count = 0;
        foreach ($rows as $row) {
            if ($row['direction'] !== 'out') {
                break;
            }
            $count++;
        }

        return $count;
    }

    /** Hours since the customer last wrote — the WhatsApp 24h window check. */
    public function hoursSinceLastInbound(int $conversationId): ?float
    {
        $v = $this->scalar(
            "SELECT TIMESTAMPDIFF(MINUTE, MAX(created_at), NOW()) / 60
               FROM messages
              WHERE conversation_id = :cid AND tenant_id = :t AND direction = 'in'",
            ['cid' => $conversationId, 't' => $this->tenantId]
        );

        return $v === null ? null : (float) $v;
    }

    public function markStatus(int $messageId, string $status, ?string $error = null): void
    {
        $this->execute(
            'UPDATE messages SET status = :s, error_message = :e WHERE id = :id AND tenant_id = :t',
            ['s' => $status, 'e' => $error, 'id' => $messageId, 't' => $this->tenantId]
        );
    }

    public function markStatusByExternalId(string $externalId, string $status): int
    {
        return $this->execute(
            'UPDATE messages SET status = :s
              WHERE external_message_id = :x AND tenant_id = :t
                AND status <> :s2',
            ['s' => $status, 'x' => $externalId, 't' => $this->tenantId, 's2' => $status]
        );
    }

    /** Message search. Deliberately separate from inboxPage — this one scans. */
    public function search(string $query, int $limit = 50): array
    {
        return $this->select(
            'SELECT m.id, m.conversation_id, m.body, m.sender, m.created_at,
                    ct.name AS contact_name
               FROM messages m
               JOIN conversations c ON c.id = m.conversation_id
               JOIN contacts ct ON ct.id = c.contact_id
              WHERE m.tenant_id = :t AND m.body LIKE :q
              ORDER BY m.id DESC
              LIMIT ' . max(1, min($limit, 100)),
            ['t' => $this->tenantId, 'q' => '%' . $query . '%']
        );
    }

    /** One-line preview for the inbox list, mb-safe for Bangla. */
    private function preview(string $body, string $type): string
    {
        if ($body === '') {
            return match ($type) {
                'image'   => '📷 ছবি',
                'audio'   => '🎤 ভয়েস মেসেজ',
                'video'   => '🎬 ভিডিও',
                'file'    => '📎 ফাইল',
                'sticker' => '😀 স্টিকার',
                default   => '',
            };
        }

        $clean = trim(preg_replace('/\s+/u', ' ', $body) ?? $body);

        // mb_substr, not substr: a byte cut mid-codepoint produces mojibake in
        // the one place every user looks.
        return mb_strlen($clean, 'UTF-8') > 120
            ? mb_substr($clean, 0, 120, 'UTF-8') . '…'
            : $clean;
    }
}
