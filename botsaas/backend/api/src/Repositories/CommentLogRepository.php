<?php
declare(strict_types=1);

namespace App\Repositories;

use App\Core\Db;
use PDOException;

final class CommentLogRepository extends BaseRepository
{
    protected string $table = 'comment_logs';

    /**
     * Claim a comment exactly once.
     *
     * Returns false when this comment was already handled — Meta redelivers
     * feed webhooks, and replying twice to the same comment is both visible
     * to customers and a spam signal to Meta.
     */
    public function claim(string $commentId, array $data = []): bool
    {
        try {
            $this->create(array_merge($data, ['comment_id' => $commentId]));
            return true;
        } catch (PDOException $e) {
            if ($e->getCode() === '23000') {
                return false;
            }
            throw $e;
        }
    }

    /** reply_once_per_user. */
    public function alreadyRepliedTo(string $commenterId, int $withinDays = 30): bool
    {
        return (int) $this->scalar(
            'SELECT COUNT(*) FROM comment_logs
              WHERE tenant_id = :t AND commenter_id = :c AND replied = 1
                AND created_at >= DATE_SUB(NOW(), INTERVAL :d DAY)',
            ['t' => $this->tenantId, 'c' => $commenterId, 'd' => $withinDays]
        ) > 0;
    }

    public function todayCount(int $automationId): int
    {
        return (int) $this->scalar(
            'SELECT COUNT(*) FROM comment_logs
              WHERE tenant_id = :t AND automation_id = :a
                AND DATE(created_at) = CURDATE() AND replied = 1',
            ['t' => $this->tenantId, 'a' => $automationId]
        );
    }

    public function markHandled(string $commentId, array $outcome): void
    {
        $this->execute(
            'UPDATE comment_logs
                SET replied = :r, reply_text = :rt, dm_sent = :dm, hidden = :h,
                    status = :s, error_message = :e
              WHERE comment_id = :c AND tenant_id = :t',
            [
                'r'  => (int) ($outcome['replied'] ?? 0),
                'rt' => $outcome['reply_text'] ?? null,
                'dm' => (int) ($outcome['dm_sent'] ?? 0),
                'h'  => (int) ($outcome['hidden'] ?? 0),
                's'  => $outcome['status'] ?? 'ok',
                'e'  => $outcome['error'] ?? null,
                'c'  => $commentId,
                't'  => $this->tenantId,
            ]
        );
    }
}
