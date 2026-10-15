<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\ApiException;
use App\Core\Context;
use App\Core\Crypto;
use App\Core\Db;
use App\Core\NotFoundException;
use App\Core\Request;
use App\Core\Response;
use App\Core\Validator;
use App\Services\AuditLogger;
use App\Services\PasswordHasher;
use App\Services\QuotaService;
use App\Support\Permissions;

/**
 * Staff management. Belongs to Phase 3 because it is where roles are assigned
 * and where the staff_seats quota is actually spent.
 *
 * Every query here goes through the tenant-scoped Context, so an id from
 * another tenant simply does not resolve — see tests/api_isolation.php.
 */
final class TeamController
{
    public function index(Request $request): Response
    {
        $tenantId = Context::current()->tenantId();

        $members = Db::select(
            'SELECT id, name, email, phone, role, status, last_login_at, created_at
               FROM users
              WHERE tenant_id = :t
              ORDER BY FIELD(role, :owner, :manager, :agent), created_at ASC',
            [
                't' => $tenantId,
                'owner' => Permissions::OWNER,
                'manager' => Permissions::MANAGER,
                'agent' => Permissions::AGENT,
            ]
        );

        $quota = QuotaService::forTenant($tenantId);

        return Response::ok([
            'members' => array_map(static fn (array $m) => [
                'id'            => (int) $m['id'],
                'name'          => $m['name'],
                'email'         => $m['email'],
                'phone'         => $m['phone'],
                'role'          => $m['role'],
                'status'        => $m['status'],
                'last_login_at' => $m['last_login_at'],
            ], $members),
            'seats' => $quota->check('staff_seats', 0),
        ]);
    }

    public function invite(Request $request): Response
    {
        $tenantId = Context::current()->tenantId();

        $data = Validator::validate($request->json(), [
            'name'  => 'required|string|min:2|max:120',
            'email' => 'required|email|max:190',
            'role'  => 'required|in:' . Permissions::MANAGER . ',' . Permissions::AGENT,
            'phone' => 'nullable|bd_phone',
        ]);

        // An owner cannot be invited — there is exactly one, created at
        // registration, and ownership transfer is a separate deliberate action.
        if ($data['role'] === Permissions::OWNER) {
            throw new ApiException('INVALID_ROLE', 'Ownership cannot be granted by invitation.', 422);
        }

        if (Db::scalar('SELECT id FROM users WHERE email = :e', ['e' => $data['email']]) !== null) {
            throw new ApiException('EMAIL_TAKEN', 'That email is already in use.', 409);
        }

        $quota = QuotaService::forTenant($tenantId);

        // reserveState locks the tenant row, so two simultaneous invites on the
        // last seat cannot both succeed. Throws QuotaExceededException (402)
        // carrying the numbers the panel needs for its upgrade prompt.
        $userId = $quota->reserveState('staff_seats', function () use ($data, $tenantId) {
            return Db::insert('users', [
                'tenant_id'     => $tenantId,
                'name'          => $data['name'],
                'email'         => $data['email'],
                'phone'         => $data['phone'] ?? null,
                // Placeholder credential: the account cannot be used until the
                // invitee sets a password through the reset flow.
                'password_hash' => (new PasswordHasher())->hash(Crypto::randomToken(32)),
                'role'          => $data['role'],
                'status'        => 'invited',
            ]);
        });

        AuditLogger::record('team.invited', 'user', $userId, null, [
            'email' => $data['email'], 'role' => $data['role'],
        ], $request->ip(), $request->userAgent());

        return Response::created([
            'id'     => $userId,
            'name'   => $data['name'],
            'email'  => $data['email'],
            'role'   => $data['role'],
            'status' => 'invited',
        ]);
    }

    public function changeRole(Request $request): Response
    {
        $tenantId = Context::current()->tenantId();
        $targetId = $request->paramInt('id');

        $data = Validator::validate($request->json(), [
            'role' => 'required|in:' . Permissions::MANAGER . ',' . Permissions::AGENT,
        ]);

        $target = $this->findMember($tenantId, $targetId);

        if ($target['role'] === Permissions::OWNER) {
            throw new ApiException('CANNOT_DEMOTE_OWNER', 'The account owner cannot be demoted.', 422);
        }

        Db::execute(
            'UPDATE users SET role = :r WHERE id = :id AND tenant_id = :t',
            ['r' => $data['role'], 'id' => $targetId, 't' => $tenantId]
        );

        AuditLogger::record('team.role_changed', 'user', $targetId,
            ['role' => $target['role']], ['role' => $data['role']],
            $request->ip(), $request->userAgent());

        return Response::ok(['id' => $targetId, 'role' => $data['role']]);
    }

    public function remove(Request $request): Response
    {
        $tenantId = Context::current()->tenantId();
        $targetId = $request->paramInt('id');

        $target = $this->findMember($tenantId, $targetId);

        if ($target['role'] === Permissions::OWNER) {
            throw new ApiException('CANNOT_REMOVE_OWNER', 'The account owner cannot be removed.', 422);
        }

        if ($targetId === Context::current()->userId()) {
            throw new ApiException('CANNOT_REMOVE_SELF', 'You cannot remove your own account.', 422);
        }

        Db::transaction(function () use ($targetId, $tenantId) {
            // Disable rather than delete: their replies are referenced by
            // conversation history, and a hard delete would orphan it.
            Db::execute(
                'UPDATE users SET status = :s WHERE id = :id AND tenant_id = :t',
                ['s' => 'disabled', 'id' => $targetId, 't' => $tenantId]
            );
            Db::execute(
                "UPDATE refresh_tokens SET revoked_at = NOW(), revoked_reason = 'removed_from_team'
                  WHERE user_id = :u AND revoked_at IS NULL",
                ['u' => $targetId]
            );
        });

        AuditLogger::record('team.removed', 'user', $targetId, $target, null,
            $request->ip(), $request->userAgent());

        return Response::ok(['id' => $targetId, 'status' => 'disabled']);
    }

    /** @return array<string,mixed> */
    private function findMember(int $tenantId, int $userId): array
    {
        $row = Db::selectOne(
            'SELECT id, name, email, role, status FROM users WHERE id = :id AND tenant_id = :t',
            ['id' => $userId, 't' => $tenantId]
        );

        if ($row === null) {
            // Same 404 whether the user does not exist or belongs to another
            // tenant — a 403 would confirm existence and let someone enumerate
            // other tenants' staff by walking ids.
            throw new NotFoundException('Team member not found.');
        }

        return $row;
    }
}
