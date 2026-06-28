<?php
namespace App\Controllers;

class ProjectController
{
    public static function index(array $user): void
    {
        $db = \App\DB::instance();
        $projects = $db->query(
            "SELECT p.*, GROUP_CONCAT(m.title, '|', m.status, '|', m.due_date ORDER BY m.sort_order SEPARATOR ';;') AS milestones_raw
             FROM projects p
             LEFT JOIN milestones m ON m.project_id = p.id
             WHERE p.client_id = ?
             GROUP BY p.id
             ORDER BY p.created_at DESC",
            [$user['id']]
        )->fetchAll();

        $projects = array_map(function ($p) {
            $mRaw = $p['milestones_raw'] ?? '';
            $milestones = [];
            if ($mRaw) {
                foreach (explode(';;', $mRaw) as $m) {
                    [$title, $status, $due] = explode('|', $m);
                    $milestones[] = compact('title', 'status', 'due');
                }
            }
            $p['milestones'] = $milestones;
            unset($p['milestones_raw']);
            return $p;
        }, $projects);

        respond(200, ['projects' => $projects]);
    }
}
