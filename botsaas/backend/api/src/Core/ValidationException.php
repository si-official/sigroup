<?php
declare(strict_types=1);

namespace App\Core;

final class ValidationException extends ApiException
{
    /** @param array<string,string[]> $errors field => messages */
    public function __construct(array $errors, string $message = 'The given data was invalid.')
    {
        parent::__construct('VALIDATION_FAILED', $message, 422, ['fields' => $errors]);
    }
}
