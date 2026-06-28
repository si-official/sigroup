<?php
namespace App\Controllers;

use App\Middleware\AuthMiddleware;

class AuthController
{
    public static function login(): void
    {
        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        $email = trim($body['email'] ?? '');
        $password = $body['password'] ?? '';

        // Load users from DB or config
        $db = \App\DB::instance();
        $user = $db->query(
            "SELECT * FROM users WHERE email = ? LIMIT 1",
            [$email]
        )->fetch();

        if (!$user || !password_verify($password, $user['password'])) {
            respond(401, ['message' => 'Invalid credentials']);
        }

        $token = AuthMiddleware::generate([
            'id'   => $user['id'],
            'name' => $user['name'],
            'email'=> $user['email'],
            'role' => $user['role'],
        ]);

        respond(200, [
            'token' => $token,
            'user'  => [
                'id'    => $user['id'],
                'name'  => $user['name'],
                'email' => $user['email'],
                'role'  => $user['role'],
            ]
        ]);
    }

    public static function me(array $user): void
    {
        respond(200, ['user' => $user]);
    }

    public static function logout(): void
    {
        respond(200, ['message' => 'Logged out']);
    }
}
