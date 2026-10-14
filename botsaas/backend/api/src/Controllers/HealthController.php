<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Db;
use App\Core\Env;
use App\Core\Request;
use App\Core\Response;
use App\Jobs\Queue;
use Throwable;

/**
 * Liveness and readiness.
 *
 * GET /api/health      public, minimal — is the API up and is the DB reachable
 * GET /api/health/deep guarded by MIGRATE_SECRET — queue depth, cron freshness,
 *                      migration drift. This is the one you point a monitor at,
 *                      because on shared hosting the thing that breaks is never
 *                      the web process; it is a cron that stopped running three
 *                      days ago and nobody noticed.
 */
final class HealthController
{
    public function index(Request $request): Response
    {
        $dbUp = Db::ping();

        $payload = [
            'db'      => $dbUp ? 'up' : 'down',
            'version' => Env::string('APP_VERSION', '0.1.0'),
            'env'     => Env::string('APP_ENV', 'local'),
            'time'    => gmdate('c'),
        ];

        return $dbUp
            ? Response::ok($payload)
            : Response::error('SERVICE_UNAVAILABLE', 'Database unreachable.', 503, $payload);
    }

    public function deep(Request $request): Response
    {
        $secret = $request->header('x-health-secret') ?? (string) $request->query('secret', '');
        if (!hash_equals(Env::string('MIGRATE_SECRET'), $secret)) {
            return Response::error('FORBIDDEN', 'Invalid health secret.', 403);
        }

        $checks  = [];
        $healthy = true;

        // --- database ---
        $dbUp = Db::ping();
        $checks['database'] = ['ok' => $dbUp, 'version' => $dbUp ? Db::version() : null];
        $healthy = $healthy && $dbUp;

        if (!$dbUp) {
            return Response::error('SERVICE_UNAVAILABLE', 'Database unreachable.', 503, $checks);
        }

        // --- queue depth ---
        try {
            $depth = Queue::depth();
            // A backlog older than 5 minutes means the worker is not keeping
            // up, which for this product means customers waiting on replies.
            $queueOk = $depth['oldest_pending_age_sec'] < 300 && $depth['pending'] < 5000;
            $checks['queue'] = $depth + ['ok' => $queueOk];
            $healthy = $healthy && $queueOk;
        } catch (Throwable $e) {
            $checks['queue'] = ['ok' => false, 'error' => $e->getMessage()];
            $healthy = false;
        }

        // --- cron freshness ---
        try {
            $alertMinutes = Env::int('CRON_HEARTBEAT_ALERT_MINUTES', 5);
            $rows = Db::select(
                'SELECT job_name, last_run_at, duration_ms, processed, last_status,
                        TIMESTAMPDIFF(SECOND, last_run_at, NOW()) AS age_sec
                   FROM cron_heartbeats'
            );

            $cron = [];
            foreach ($rows as $row) {
                $stale = (int) $row['age_sec'] > ($alertMinutes * 60);
                $cron[$row['job_name']] = [
                    'last_run_at' => $row['last_run_at'],
                    'age_sec'     => (int) $row['age_sec'],
                    'duration_ms' => (int) $row['duration_ms'],
                    'status'      => $row['last_status'],
                    'stale'       => $stale,
                ];
                if ($stale) {
                    $healthy = false;
                }
            }

            // No heartbeat at all means the cron was never installed.
            $checks['cron'] = $cron === []
                ? ['ok' => false, 'error' => 'No cron heartbeat recorded. Is the cron installed?']
                : $cron + ['ok' => !in_array(true, array_column($cron, 'stale'), true)];
        } catch (Throwable $e) {
            $checks['cron'] = ['ok' => false, 'error' => $e->getMessage()];
            $healthy = false;
        }

        // --- migration drift ---
        try {
            $migrator = new \App\Database\Migrator(\App\Core\Bootstrap::basePath() . '/database/migrations');
            $status   = $migrator->status();
            $pending  = array_values(array_filter($status, fn (array $m) => !$m['applied']));
            $drift    = array_values(array_filter($status, fn (array $m) => $m['drift']));

            $migrationsOk = $pending === [] && $drift === [];
            $checks['migrations'] = [
                'ok'      => $migrationsOk,
                'applied' => count($status) - count($pending),
                'pending' => array_column($pending, 'file'),
                'drift'   => array_column($drift, 'file'),
            ];
            $healthy = $healthy && $migrationsOk;
        } catch (Throwable $e) {
            $checks['migrations'] = ['ok' => false, 'error' => $e->getMessage()];
        }

        return $healthy
            ? Response::ok($checks)
            : Response::error('DEGRADED', 'One or more health checks failed.', 503, $checks);
    }
}
