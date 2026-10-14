<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Bootstrap;
use App\Core\Crypto;
use App\Core\Env;
use App\Core\Logger;
use App\Core\Request;
use App\Core\Response;
use App\Database\Migrator;
use Throwable;

/**
 * Web-triggered migrations, because Hostinger shared hosting does not always
 * give reliable SSH — and when it does, it is still useful to run migrations
 * as part of a deploy script that only speaks HTTP.
 *
 * Guarded by MIGRATE_SECRET with a timing-safe comparison, POST only, and
 * every invocation is logged. GET returns status without changing anything,
 * so a half-finished deploy can be diagnosed from a browser.
 */
final class MigrateController
{
    public function status(Request $request): Response
    {
        $this->authorize($request);

        $migrator = new Migrator(Bootstrap::basePath() . '/database/migrations');
        $status   = $migrator->status();

        return Response::ok([
            'migrations' => $status,
            'pending'    => array_values(array_column(array_filter($status, fn ($m) => !$m['applied']), 'file')),
            'drift'      => array_values(array_column(array_filter($status, fn ($m) => $m['drift']), 'file')),
        ]);
    }

    public function run(Request $request): Response
    {
        $this->authorize($request);

        $dryRun = (bool) $request->input('dry_run', false);

        Logger::warning('migrate.web_triggered', ['ip' => $request->ip(), 'dry_run' => $dryRun]);

        try {
            $migrator = new Migrator(Bootstrap::basePath() . '/database/migrations');
            $result   = $migrator->run($dryRun);

            return Response::ok([
                'dry_run' => $dryRun,
                'applied' => $result['applied'],
                'skipped' => count($result['skipped']),
                'drift'   => $result['drift'],
                'batch'   => $result['batch'],
                'log'     => $migrator->output(),
            ]);
        } catch (Throwable $e) {
            Logger::exception($e, 'migrate.failed');
            return Response::error('MIGRATION_FAILED', $e->getMessage(), 500);
        }
    }

    private function authorize(Request $request): void
    {
        $provided = $request->header('x-migrate-secret')
            ?? (string) ($request->input('secret') ?? $request->query('secret', ''));

        if (!Crypto::equals(Env::string('MIGRATE_SECRET'), (string) $provided)) {
            Logger::warning('migrate.unauthorized', ['ip' => $request->ip()]);
            throw new \App\Core\ForbiddenException('Invalid migration secret.', 'INVALID_SECRET');
        }
    }
}
