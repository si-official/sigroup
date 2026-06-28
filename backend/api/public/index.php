<?php
declare(strict_types=1);

define('BASE_PATH', dirname(__DIR__));
require_once BASE_PATH . '/vendor/autoload.php';

use Dotenv\Dotenv;

// Load environment
if (file_exists(BASE_PATH . '/.env')) {
    $dotenv = Dotenv::createImmutable(BASE_PATH);
    $dotenv->load();
}

// CORS Headers
$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
$allowed = ['https://portal.sigroup.com.bd','https://shop.sigroup.com.bd','https://school.sigroup.com.bd','https://sigroup.com.bd'];
if (in_array($origin, $allowed) || ($_ENV['APP_ENV'] ?? 'production') === 'local') {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header("Access-Control-Allow-Origin: https://portal.sigroup.com.bd");
}
header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Router
require_once BASE_PATH . '/routes/api.php';
