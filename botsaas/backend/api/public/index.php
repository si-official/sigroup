<?php
declare(strict_types=1);

/**
 * Front controller. Every API request enters here.
 */

require_once dirname(__DIR__) . '/vendor/autoload.php';

use App\Core\Bootstrap;
use App\Core\Logger;
use App\Core\Request;
use App\Core\Response;
use App\Core\Router;
use App\Http\Kernel;
use App\Middleware\Cors;
use App\Middleware\RateLimit;

$basePath = dirname(__DIR__);

try {
    Bootstrap::boot($basePath);
} catch (Throwable $e) {
    // Boot failed: no logger, no env. Emit a valid envelope and nothing else —
    // a misconfiguration message must never expose paths or credentials.
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    $debug = (getenv('APP_DEBUG') === 'true' && getenv('APP_ENV') !== 'production');
    echo json_encode([
        'ok'    => false,
        'error' => [
            'code'    => 'BOOT_FAILED',
            'message' => $debug ? $e->getMessage() : 'Service is not configured correctly.',
        ],
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$request = Request::capture();

// Correlate a whole request chain (webhook -> job -> AI call -> send) under one
// id when the caller supplies it.
$incomingId = $request->header('x-request-id');
if ($incomingId !== null && preg_match('/^[a-zA-Z0-9_-]{8,64}$/', $incomingId) === 1) {
    Logger::setRequestId($incomingId);
}

$router = new Router();
require $basePath . '/routes/api.php';

$kernel = (new Kernel($router))
    ->pushGlobal(new Cors())      // first: a preflight never reaches the DB
    ->pushGlobal(new RateLimit()); // second: unauthenticated floods stay cheap

$response = $kernel->handle($request);
$response->send();
$kernel->terminate();
