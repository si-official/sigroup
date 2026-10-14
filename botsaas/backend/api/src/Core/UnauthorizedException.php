<?php
declare(strict_types=1);

namespace App\Core;

final class UnauthorizedException extends ApiException
{
    public function __construct(string $message = 'Authentication required.', string $code = 'UNAUTHENTICATED')
    {
        parent::__construct($code, $message, 401);
    }
}
