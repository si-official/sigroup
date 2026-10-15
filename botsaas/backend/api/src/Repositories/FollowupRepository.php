<?php
declare(strict_types=1);

namespace App\Repositories;

use App\Core\Db;
use PDOException;

final class FollowupRepository extends BaseRepository
{
    protected string $table = 'followup_jobs';

    /**
     * Due follow-ups across ALL tenants — the per-minute scheduler's query.
     * Static and unscoped by design; the handler re-scopes per job.
     */
    public static function due(int $limit = 200): array
    {
        return Db::select(
            "SELECT fj.id, fj.tenant_id, fj.conversation_id, fj.sequence_id, fj.next_step,
                    fs.mode, fs.message, fs.instruction, fs.attachments,
                    seq.stop_on_reply, seq.channel_scope
               FROM followup_jobs fj
               JOIN followup_sequences seq ON seq.id = fj.sequence_id AND seq.is_active = 1
               JOIN followup_steps fs ON fs.sequence_id = fj.sequence_id AND fs.step_no = fj.next_step
              WHERE fj.status = 'pending' AND fj.run_at <= NOW()
              ORDER BY fj.run_at ASC
              LIMIT {$limit}"
        );
    }

    public function schedule(int $conversationId, int $sequenceId, int $delayMinutes, int $step = 1): int
    {
        try {
            return $this->create([
                'conversation_id' => $conversationId,
                'sequence_id'     => $sequenceId,
                'next_step'       => $step,
                'run_at'          => date('Y-m-d H:i:s', time() + ($delayMinutes * 60)),
                'status'          => 'pending',
            ]);
        } catch (PDOException $e) {
            // uq_fj_conv: one live sequence per conversation.
            if ($e->getCode() === '23000') {
                return 0;
            }
            throw $e;
        }
    }

    /**
     * The customer replied — kill the whole sequence immediately.
     * Following up after someone has already answered is the fastest way to
     * make an automation feel like spam.
     */
    public function cancelForConversation(int $conversationId): int
    {
        return $this->execute(
            "UPDATE followup_jobs SET status = 'cancelled'
              WHERE conversation_id = :c AND tenant_id = :t AND status = 'pending'",
            ['c' => $conversationId, 't' => $this->tenantId]
        );
    }

    /** Advance to the next step, or finish the sequence. */
    public function advance(int $jobId, int $sequenceId, int $currentStep): void
    {
        $next = $this->selectOne(
            'SELECT step_no, delay_min FROM followup_steps
              WHERE sequence_id = :s AND step_no > :n AND tenant_id = :t
              ORDER BY step_no ASC LIMIT 1',
            ['s' => $sequenceId, 'n' => $currentStep, 't' => $this->tenantId]
        );

        if ($next === null) {
            $this->execute(
                "UPDATE followup_jobs SET status = 'sent' WHERE id = :id AND tenant_id = :t",
                ['id' => $jobId, 't' => $this->tenantId]
            );
            return;
        }

        $this->execute(
            'UPDATE followup_jobs
                SET next_step = :step, run_at = DATE_ADD(NOW(), INTERVAL :d MINUTE)
              WHERE id = :id AND tenant_id = :t',
            ['step' => $next['step_no'], 'd' => (int) $next['delay_min'], 'id' => $jobId, 't' => $this->tenantId]
        );
    }

    /** Weekly cap, so a quiet customer is not pestered. */
    public function sentThisWeek(int $conversationId): int
    {
        return (int) $this->scalar(
            "SELECT COUNT(*) FROM messages
              WHERE conversation_id = :c AND tenant_id = :t
                AND source = 'followup'
                AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)",
            ['c' => $conversationId, 't' => $this->tenantId]
        );
    }
}
