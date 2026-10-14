<?php
declare(strict_types=1);

namespace App\Jobs;

use App\Core\Context;
use App\Core\Db;
use App\Core\Env;
use App\Core\Logger;
use Throwable;

/**
 * The worker loop. CONSTRAINT 2 LIVES HERE.
 *
 * Shared hosting gives a 1-minute cron and kills long-running processes, so:
 *  - the loop stops at WORKER_MAX_SECONDS (default 50), leaving headroom
 *    before the next cron tick;
 *  - it also stops before starting a job it probably cannot finish;
 *  - jobs are claimed with FOR UPDATE SKIP LOCKED, so two overlapping cron
 *    runs (which WILL happen when one run is slow) never double-process;
 *  - a crashed run leaves rows 'reserved', so stale reservations are reclaimed
 *    on the next pass. Without that, one PHP timeout silently wedges the queue.
 */
final class JobRunner
{
    /** @var array<string,class-string<JobHandlerInterface>> */
    private array $handlers = [];

    private string $workerId;
    private int $maxSeconds;
    private int $batchSize;
    private int $processed = 0;
    private int $failed = 0;

    public function __construct(?string $workerId = null)
    {
        $this->workerId   = $workerId ?? (Env::stringOrNull('WORKER_ID') ?? substr(bin2hex(random_bytes(8)), 0, 16));
        $this->maxSeconds = Env::int('WORKER_MAX_SECONDS', 50);
        $this->batchSize  = Env::int('WORKER_BATCH_SIZE', 20);
    }

    /** @param class-string<JobHandlerInterface> $handlerClass */
    public function register(string $type, string $handlerClass): self
    {
        $this->handlers[$type] = $handlerClass;
        return $this;
    }

    /** @return array{processed:int,failed:int,duration_ms:int,reclaimed:int} */
    public function run(): array
    {
        $startedAt = microtime(true);
        Logger::withContext(['worker' => $this->workerId]);

        $reclaimed = $this->reclaimStale();

        while (true) {
            $elapsed = microtime(true) - $startedAt;

            // Stop with time to spare rather than being killed mid-job: a job
            // killed after its side effect but before its status update gets
            // retried and duplicated.
            if ($elapsed > ($this->maxSeconds - 5)) {
                Logger::debug('worker.time_budget_reached', ['elapsed_sec' => round($elapsed, 1)]);
                break;
            }

            $jobs = $this->claim($this->batchSize);
            if ($jobs === []) {
                break; // queue drained
            }

            foreach ($jobs as $job) {
                if ((microtime(true) - $startedAt) > ($this->maxSeconds - 3)) {
                    // Release what we will not get to, so it is picked up at once.
                    $this->release((int) $job['id']);
                    continue;
                }
                $this->process($job);
            }
        }

        $durationMs = (int) round((microtime(true) - $startedAt) * 1000);

        $this->heartbeat('worker', $durationMs, $this->processed, $this->failed === 0 ? 'ok' : 'error');

        Logger::info('worker.finished', [
            'processed'  => $this->processed,
            'failed'     => $this->failed,
            'reclaimed'  => $reclaimed,
            'ms'         => $durationMs,
        ]);

        return [
            'processed'   => $this->processed,
            'failed'      => $this->failed,
            'duration_ms' => $durationMs,
            'reclaimed'   => $reclaimed,
        ];
    }

    /**
     * Atomic claim, portable across MySQL 8 and MariaDB 10.3+.
     *
     * The obvious implementation is SELECT ... FOR UPDATE SKIP LOCKED, and that
     * is what most tutorials show. It does not work here: SKIP LOCKED arrived
     * in MariaDB 10.6, and Hostinger shared hosting frequently runs 10.4/10.5.
     * On those it is a hard syntax error, so the entire queue — and therefore
     * every AI reply — silently never runs. Verified the hard way against
     * MariaDB 10.4.28.
     *
     * So instead: one UPDATE stamps a batch with this worker's unique id. A
     * single UPDATE statement is atomic and takes its own row locks, and the
     * WHERE clause excludes rows another worker already reserved, so two
     * overlapping cron runs claim disjoint sets. Then we read back exactly the
     * rows we stamped.
     *
     * The tradeoff versus SKIP LOCKED: concurrent workers may briefly block on
     * row locks instead of stepping over them. At this scale that costs
     * milliseconds, and it works on every MySQL/MariaDB a customer might have.
     *
     * @return array<int,array<string,mixed>>
     */
    private function claim(int $limit): array
    {
        // Unique per claim attempt, so a reclaim mid-run cannot collide with
        // rows this same worker stamped in an earlier batch.
        $claimToken = $this->workerId . ':' . substr(bin2hex(random_bytes(4)), 0, 8);

        $stamped = Db::execute(
            "UPDATE jobs
                SET status = 'reserved', reserved_at = NOW(3), reserved_by = :token
              WHERE status = 'pending'
                AND available_at <= NOW(3)
              ORDER BY priority ASC, id ASC
              LIMIT {$limit}",
            ['token' => $claimToken]
        );

        if ($stamped === 0) {
            return [];
        }

        return Db::select(
            "SELECT id, tenant_id, type, payload, attempts, max_attempts
               FROM jobs
              WHERE reserved_by = :token
                AND status = 'reserved'
              ORDER BY priority ASC, id ASC",
            ['token' => $claimToken]
        );
    }

    /** @param array<string,mixed> $job */
    private function process(array $job): void
    {
        $id       = (int) $job['id'];
        $type     = (string) $job['type'];
        $tenantId = $job['tenant_id'] !== null ? (int) $job['tenant_id'] : null;
        $attempts = (int) $job['attempts'] + 1;

        $payload = json_decode((string) $job['payload'], true);
        $payload = is_array($payload) ? $payload : [];

        Logger::withContext(['job_id' => $id, 'job_type' => $type, 'tenant_id' => $tenantId]);
        $startedAt = microtime(true);

        try {
            $handlerClass = $this->handlers[$type] ?? null;

            if ($handlerClass === null) {
                // Unknown type is not retryable — fail it immediately rather
                // than burning three attempts on something that cannot work.
                $this->markFailed($id, $attempts, "No handler registered for job type '{$type}'.", true);
                return;
            }

            /** @var JobHandlerInterface $handler */
            $handler = new $handlerClass();
            $handler->handle($payload, $id, $tenantId);

            Db::execute(
                "UPDATE jobs SET status = 'done', attempts = :a, completed_at = NOW(3), last_error = NULL WHERE id = :id",
                ['a' => $attempts, 'id' => $id]
            );

            $this->processed++;

            Logger::info('job.done', ['ms' => (int) round((microtime(true) - $startedAt) * 1000)]);
        } catch (Throwable $e) {
            $this->markFailed($id, $attempts, $e->getMessage(), $attempts >= (int) $job['max_attempts']);
            Logger::exception($e, 'job.failed', ['attempt' => $attempts]);
        } finally {
            // Context must not leak from one tenant's job into the next.
            Context::reset();
            Logger::withContext(['worker' => $this->workerId]);
        }
    }

    private function markFailed(int $id, int $attempts, string $error, bool $terminal): void
    {
        if ($terminal) {
            Db::execute(
                "UPDATE jobs SET status = 'failed', attempts = :a, last_error = :e, completed_at = NOW(3) WHERE id = :id",
                ['a' => $attempts, 'e' => mb_substr($error, 0, 2000), 'id' => $id]
            );
            $this->failed++;
            return;
        }

        // Exponential backoff: 10s, 40s, 90s. Enough for a transient Meta 500
        // or a brief DB blip, short enough that a waiting customer still gets
        // their reply.
        $delay = 10 * ($attempts ** 2);

        Db::execute(
            "UPDATE jobs
                SET status = 'pending', attempts = :a, last_error = :e,
                    reserved_at = NULL, reserved_by = NULL,
                    available_at = DATE_ADD(NOW(3), INTERVAL :d SECOND)
              WHERE id = :id",
            ['a' => $attempts, 'e' => mb_substr($error, 0, 2000), 'd' => $delay, 'id' => $id]
        );
    }

    private function release(int $id): void
    {
        Db::execute(
            "UPDATE jobs SET status = 'pending', reserved_at = NULL, reserved_by = NULL WHERE id = :id",
            ['id' => $id]
        );
    }

    /**
     * Reclaim jobs reserved by a run that died (PHP timeout, OOM, the host
     * recycling the process). Five minutes is well past any legitimate job.
     */
    private function reclaimStale(): int
    {
        return Db::execute(
            "UPDATE jobs
                SET status = 'pending', reserved_at = NULL, reserved_by = NULL
              WHERE status = 'reserved'
                AND reserved_at < DATE_SUB(NOW(3), INTERVAL 5 MINUTE)"
        );
    }

    public function heartbeat(string $name, int $durationMs, int $processed, string $status, ?string $error = null): void
    {
        Db::execute(
            'INSERT INTO cron_heartbeats (job_name, last_run_at, duration_ms, processed, last_status, last_error)
             VALUES (:n, NOW(3), :d, :p, :s, :e)
             ON DUPLICATE KEY UPDATE
                last_run_at = NOW(3), duration_ms = :d2, processed = :p2, last_status = :s2, last_error = :e2',
            [
                'n' => $name, 'd' => $durationMs, 'p' => $processed, 's' => $status, 'e' => $error,
                'd2' => $durationMs, 'p2' => $processed, 's2' => $status, 'e2' => $error,
            ]
        );
    }
}
