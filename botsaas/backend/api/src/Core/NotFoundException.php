<?php
declare(strict_types=1);

namespace App\Core;

final class NotFoundException extends ApiException
{
    public function __construct(string $message = 'Resource not found.')
    {
        parent::__construct('NOT_FOUND', $message, 404);
    }
}
