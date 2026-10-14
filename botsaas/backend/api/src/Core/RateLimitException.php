<?php
declare(strict_types=1);

namespace App\Core;

final class RateLimitException extends ApiException
{
    public function __construct(int $retryAfter, string $message = 'Too many requests. Please slow down.')
    {
        parent::__construct('RATE_LIMITED', $message, 429, ['retry_after' => $retryAfter]);
    }
}
