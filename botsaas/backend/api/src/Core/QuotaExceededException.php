<?php
declare(strict_types=1);

namespace App\Core;

/** 402: within the plan, but the metered allowance for this cycle is spent. */
final class QuotaExceededException extends ApiException
{
    public function __construct(string $metric, int $used, int $limit)
    {
        parent::__construct(
            'QUOTA_EXCEEDED',
            "You have used your {$metric} allowance for this cycle ({$used}/{$limit}).",
            402,
            ['metric' => $metric, 'used' => $used, 'limit' => $limit, 'upgrade_url' => '/subscription/packages']
        );
    }
}
