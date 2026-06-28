<?php
use App\Controllers\AuthController;
use App\Controllers\ProjectController;
use App\Controllers\InvoiceController;
use App\Controllers\TicketController;
use App\Controllers\PartnerController;
use App\Controllers\AdminController;
use App\Middleware\AuthMiddleware;

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = str_replace('/api', '', $uri);
$method = $_SERVER['REQUEST_METHOD'];

// Helper: json response
function respond(int $code, mixed $data): void {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

// Helper: get bearer token
function getToken(): ?string {
    $auth = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    if (preg_match('/Bearer\s+(.+)/i', $auth, $m)) return $m[1];
    return null;
}

// Auth guard
function requireAuth(): array {
    $token = getToken();
    if (!$token) respond(401, ['message' => 'Unauthenticated']);
    $user = AuthMiddleware::validate($token);
    if (!$user) respond(401, ['message' => 'Invalid token']);
    return $user;
}

// Routes
match(true) {
    // Auth
    $uri === '/login' && $method === 'POST'       => AuthController::login(),
    $uri === '/me'   && $method === 'GET'         => AuthController::me(requireAuth()),
    $uri === '/logout' && $method === 'POST'      => AuthController::logout(),

    // Projects
    $uri === '/projects' && $method === 'GET'     => ProjectController::index(requireAuth()),

    // Invoices
    $uri === '/invoices' && $method === 'GET'     => InvoiceController::index(requireAuth()),
    preg_match('#^/invoices/(\d+)/pay$#', $uri, $m) && $method === 'POST'
                                                  => InvoiceController::pay((int)$m[1], requireAuth()),

    // Tickets
    $uri === '/tickets' && $method === 'GET'      => TicketController::index(requireAuth()),
    $uri === '/tickets' && $method === 'POST'     => TicketController::create(requireAuth()),
    preg_match('#^/tickets/(\d+)/reply$#', $uri, $m) && $method === 'POST'
                                                  => TicketController::reply((int)$m[1], requireAuth()),

    // Partner
    $uri === '/partner/stats' && $method === 'GET'       => PartnerController::stats(requireAuth()),
    $uri === '/partner/referrals' && $method === 'GET'   => PartnerController::referrals(requireAuth()),
    $uri === '/partner/commissions' && $method === 'GET' => PartnerController::commissions(requireAuth()),

    // Admin
    $uri === '/admin/stats' && $method === 'GET'  => AdminController::stats(requireAuth()),
    $uri === '/admin/users' && $method === 'GET'  => AdminController::users(requireAuth()),

    // Health
    $uri === '/health' && $method === 'GET'       => respond(200, ['status' => 'ok', 'version' => '1.0']),

    default => respond(404, ['message' => 'Route not found'])
};
