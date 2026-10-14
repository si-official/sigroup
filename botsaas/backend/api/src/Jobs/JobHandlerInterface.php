<?php
declare(strict_types=1);

namespace App\Jobs;

interface JobHandlerInterface
{
    /**
     * @param array<string,mixed> $payload
     * @throws \Throwable to trigger a retry (or final failure past max_attempts)
     */
    public function handle(array $payload, int $jobId, ?int $tenantId): void;
}
