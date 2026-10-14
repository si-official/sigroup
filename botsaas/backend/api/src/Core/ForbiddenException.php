<?php
declare(strict_types=1);

namespace App\Core;

final class ForbiddenException extends ApiException
{
    public function __construct(string $message = 'You do not have permission to do that.', string $code = 'FORBIDDEN')
    {
        parent::__construct($code, $message, 403);
    }
}
