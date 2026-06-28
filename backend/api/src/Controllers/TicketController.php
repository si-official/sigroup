<?php
namespace App\Controllers;

class TicketController
{
    public static function index(array $user): void
    {
        $db = \App\DB::instance();
        $tickets = $db->query(
            "SELECT t.*,
                (SELECT COUNT(*) FROM ticket_replies r WHERE r.ticket_id = t.id) AS reply_count
             FROM tickets t WHERE t.client_id = ? ORDER BY t.updated_at DESC",
            [$user['id']]
        )->fetchAll();
        respond(200, ['tickets' => $tickets]);
    }

    public static function create(array $user): void
    {
        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        $subject = trim($body['subject'] ?? '');
        $message = trim($body['message'] ?? '');

        if (!$subject || !$message) respond(422, ['message' => 'Subject and message required']);

        $db = \App\DB::instance();
        $db->query(
            "INSERT INTO tickets (client_id, subject, status, created_at, updated_at) VALUES (?, ?, 'open', NOW(), NOW())",
            [$user['id'], $subject]
        );
        $ticketId = $db->query("SELECT LAST_INSERT_ID() as id")->fetch()['id'];
        $db->query(
            "INSERT INTO ticket_replies (ticket_id, user_id, role, message, created_at) VALUES (?, ?, 'client', ?, NOW())",
            [$ticketId, $user['id'], $message]
        );

        respond(201, ['message' => 'Ticket created', 'ticket_id' => $ticketId]);
    }

    public static function reply(int $id, array $user): void
    {
        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        $message = trim($body['message'] ?? '');
        if (!$message) respond(422, ['message' => 'Message required']);

        $db = \App\DB::instance();
        $db->query(
            "INSERT INTO ticket_replies (ticket_id, user_id, role, message, created_at) VALUES (?, ?, 'client', ?, NOW())",
            [$id, $user['id'], $message]
        );
        $db->query("UPDATE tickets SET updated_at = NOW() WHERE id = ?", [$id]);

        $reply = $db->query("SELECT * FROM ticket_replies WHERE ticket_id = ? ORDER BY id DESC LIMIT 1", [$id])->fetch();
        respond(201, ['reply' => $reply]);
    }
}
