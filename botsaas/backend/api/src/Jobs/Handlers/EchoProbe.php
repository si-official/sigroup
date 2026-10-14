<?php
declare(strict_types=1);

namespace App\Jobs\Handlers;

use App\Core\Logger;
use App\Jobs\JobHandlerInterface;

/**
 * Diagnostic handler used by tests/queue_probe.php and safe to keep in
 * production: it only logs. Verifies the claim/execute/complete cycle and the
 * retry path without touching any integration.
 */
final class EchoProbe implements JobHandlerInterface
{
    public function handle(array $payload, int $jobId, ?int $tenantId): void
    {
        if (($payload['fail'] ?? false) === true) {
            throw new \RuntimeException('Deliberate probe failure: ' . ($payload['note'] ?? ''));
        }
        Logger::info('probe.handled', ['note' => $payload['note'] ?? null, 'tenant_id' => $tenantId]);
    }
}
