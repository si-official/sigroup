<?php
declare(strict_types=1);

namespace App\Core;

use RuntimeException;
use Throwable;

/**
 * Every EXPECTED failure is an ApiException carrying the exact
 * {code, message, status} the client will see. Anything that is not one is a
 * bug, and the Kernel renders it as a generic 500 without leaking internals.
 */
class ApiException extends RuntimeException
{
    public string $errorCode;
    public int $statusCode;
    /** @var array<string,mixed> */
    public array $details;

    public function __construct(
        string $errorCode,
        string $message,
        int $statusCode = 400,
        array $details = [],
        ?Throwable $previous = null
    ) {
        parent::__construct($message, 0, $previous);
        $this->errorCode  = $errorCode;
        $this->statusCode = $statusCode;
        $this->details    = $details;
    }
}
