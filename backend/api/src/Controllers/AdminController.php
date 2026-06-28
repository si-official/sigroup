<?php
namespace App\Controllers;

class AdminController
{
    private static function requireAdmin(array $user): void
    {
        if ($user['role'] !== 'admin') respond(403, ['message' => 'Forbidden']);
    }

    public static function stats(array $user): void
    {
        self::requireAdmin($user);
        $db = \App\DB::instance();
        $stats = [
            'total_users'    => $db->query("SELECT COUNT(*) FROM users")->fetchColumn(),
            'total_projects' => $db->query("SELECT COUNT(*) FROM projects")->fetchColumn(),
            'total_invoices' => $db->query("SELECT COUNT(*) FROM invoices")->fetchColumn(),
            'pending_invoices'=> $db->query("SELECT COUNT(*) FROM invoices WHERE status='pending'")->fetchColumn(),
            'open_tickets'   => $db->query("SELECT COUNT(*) FROM tickets WHERE status='open'")->fetchColumn(),
            'total_revenue'  => $db->query("SELECT COALESCE(SUM(amount),0) FROM invoices WHERE status='paid'")->fetchColumn(),
        ];
        respond(200, ['stats' => $stats]);
    }

    public static function users(array $user): void
    {
        self::requireAdmin($user);
        $db = \App\DB::instance();
        $users = $db->query(
            "SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC"
        )->fetchAll();
        respond(200, ['users' => $users]);
    }
}
