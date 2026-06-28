<?php
namespace App\Middleware;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class AuthMiddleware
{
    public static function validate(string $token): ?array
    {
        try {
            $secret = $_ENV['JWT_SECRET'] ?? 'sigroup-secret-2024';
            $decoded = JWT::decode($token, new Key($secret, 'HS256'));
            return (array) $decoded->data;
        } catch (\Throwable) {
            return null;
        }
    }

    public static function generate(array $data): string
    {
        $secret = $_ENV['JWT_SECRET'] ?? 'sigroup-secret-2024';
        $payload = [
            'iss' => 'api.sigroup.com.bd',
            'iat' => time(),
            'exp' => time() + (60 * 60 * 24 * 7), // 7 days
            'data' => $data,
        ];
        return JWT::encode($payload, $secret, 'HS256');
    }
}
