<?php
declare(strict_types=1);

namespace App\Services;

use App\Core\Crypto;
use App\Core\Db;
use App\Core\Env;
use App\Core\Logger;
use App\Core\UnauthorizedException;
use Firebase\JWT\JWT;

/**
 * Access + refresh token lifecycle.
 *
 * Refresh tokens are organised into FAMILIES. One family = one login on one
 * device. Rotation marks the old token rotated and issues a successor in the
 * same family.
 *
 * The reason for families: if a rotated token is ever presented again, there
 * are only two explanations — the token was stolen and replayed, or the
 * legitimate client raced itself. Either way the family is no longer
 * trustworthy, so the entire family is revoked and the user must sign in
 * again. Without this, a stolen refresh token grants an attacker indefinite
 * access that silently coexists with the real user's session.
 */
final class TokenService
{
    /** @return array{access_token:string,refresh_token:string,expires_in:int} */
    public function issuePair(array $user, ?string $deviceLabel = null, ?string $ip = null): array
    {
        $familyId = bin2hex(random_bytes(16));

        return [
            'access_token'  => $this->issueAccessToken($user),
            'refresh_token' => $this->issueRefreshToken((int) $user['id'], $familyId, $deviceLabel, $ip),
            'expires_in'    => Env::int('JWT_ACCESS_TTL', 900),
        ];
    }

    public function issueAccessToken(array $user, ?int $actAsTenantId = null): string
    {
        $now = time();
        $ttl = Env::int('JWT_ACCESS_TTL', 900);

        $claims = [
            'iss' => Env::string('JWT_ISSUER', 'chatcommerce'),
            'iat' => $now,
            'nbf' => $now,
            'exp' => $now + $ttl,
            'sub' => (string) $user['id'],
            'typ' => 'access',
            // Carried for convenience; the Auth middleware still re-reads
            // role and status from the DB so a disabled account loses access
            // immediately rather than at token expiry.
            'role' => $user['role'],
            'tid'  => $user['tenant_id'] === null ? null : (int) $user['tenant_id'],
        ];

        if ($actAsTenantId !== null) {
            $claims['act_as'] = $actAsTenantId;
        }

        return JWT::encode($claims, Env::string('JWT_SECRET'), Env::string('JWT_ALGO', 'HS256'));
    }

    private function issueRefreshToken(int $userId, string $familyId, ?string $deviceLabel, ?string $ip): string
    {
        $token = Crypto::randomToken(32);

        Db::insert('refresh_tokens', [
            'user_id'      => $userId,
            'family_id'    => $familyId,
            'token_hash'   => Crypto::hashToken($token),
            'device_label' => $deviceLabel === null ? null : mb_substr($deviceLabel, 0, 120),
            'ip'           => $ip,
            'expires_at'   => date('Y-m-d H:i:s', time() + Env::int('JWT_REFRESH_TTL', 2592000)),
        ]);

        // The raw token is returned to the client and never stored. Only its
        // HMAC lives in the DB, so a database dump does not yield usable
        // sessions.
        return $token;
    }

    /**
     * Rotate. Returns a fresh pair, or throws and burns the family on reuse.
     *
     * @return array{access_token:string,refresh_token:string,expires_in:int}
     */
    public function rotate(string $presentedToken, ?string $ip = null): array
    {
        $hash = Crypto::hashToken($presentedToken);

        $row = Db::selectOne(
            'SELECT rt.id, rt.user_id, rt.family_id, rt.expires_at, rt.rotated_at, rt.revoked_at,
                    rt.device_label,
                    u.id AS uid, u.tenant_id, u.role, u.status
               FROM refresh_tokens rt
               JOIN users u ON u.id = rt.user_id
              WHERE rt.token_hash = :h',
            ['h' => $hash]
        );

        if ($row === null) {
            Logger::warning('auth.refresh_unknown_token', ['ip' => $ip]);
            throw new UnauthorizedException('Your session has expired. Please sign in again.', 'REFRESH_INVALID');
        }

        // --- REPLAY DETECTION ---
        if ($row['rotated_at'] !== null || $row['revoked_at'] !== null) {
            $this->revokeFamily((string) $row['family_id'], 'reuse_detected');

            // A security event, not a routine auth failure: either a token was
            // stolen, or one was exfiltrated from a device that still has it.
            Logger::critical('security.refresh_token_reuse', [
                'user_id'   => (int) $row['user_id'],
                'family_id' => $row['family_id'],
                'ip'        => $ip,
            ]);

            $this->audit((int) $row['user_id'], $row['tenant_id'], 'auth.refresh_reuse_detected', [
                'family_id' => $row['family_id'],
                'ip'        => $ip,
            ]);

            throw new UnauthorizedException(
                'Your session was ended for security reasons. Please sign in again.',
                'REFRESH_REUSED'
            );
        }

        if (strtotime((string) $row['expires_at']) < time()) {
            throw new UnauthorizedException('Your session has expired. Please sign in again.', 'REFRESH_EXPIRED');
        }

        if ($row['status'] !== 'active') {
            throw new UnauthorizedException('Account is not active.', 'ACCOUNT_INACTIVE');
        }

        return Db::transaction(function () use ($row, $ip) {
            Db::execute(
                'UPDATE refresh_tokens SET rotated_at = NOW() WHERE id = :id',
                ['id' => $row['id']]
            );

            $user = [
                'id'        => (int) $row['uid'],
                'tenant_id' => $row['tenant_id'],
                'role'      => $row['role'],
            ];

            return [
                'access_token'  => $this->issueAccessToken($user),
                'refresh_token' => $this->issueRefreshToken(
                    (int) $row['uid'],
                    (string) $row['family_id'],   // successor stays in the family
                    $row['device_label'],
                    $ip
                ),
                'expires_in'    => Env::int('JWT_ACCESS_TTL', 900),
            ];
        });
    }

    /** Logout: kill just this device's family. */
    public function revokeByToken(string $presentedToken, string $reason = 'logout'): bool
    {
        $row = Db::selectOne(
            'SELECT family_id FROM refresh_tokens WHERE token_hash = :h',
            ['h' => Crypto::hashToken($presentedToken)]
        );

        if ($row === null) {
            return false;
        }

        $this->revokeFamily((string) $row['family_id'], $reason);
        return true;
    }

    public function revokeFamily(string $familyId, string $reason): int
    {
        return Db::execute(
            'UPDATE refresh_tokens
                SET revoked_at = NOW(), revoked_reason = :r
              WHERE family_id = :f AND revoked_at IS NULL',
            ['r' => $reason, 'f' => $familyId]
        );
    }

    /** Password change / reset: every session everywhere must die. */
    public function revokeAllForUser(int $userId, string $reason): int
    {
        return Db::execute(
            'UPDATE refresh_tokens
                SET revoked_at = NOW(), revoked_reason = :r
              WHERE user_id = :u AND revoked_at IS NULL',
            ['r' => $reason, 'u' => $userId]
        );
    }

    public static function prune(): int
    {
        return Db::execute(
            'DELETE FROM refresh_tokens
              WHERE expires_at < DATE_SUB(NOW(), INTERVAL 7 DAY)
              LIMIT 5000'
        );
    }

    private function audit(int $userId, mixed $tenantId, string $action, array $detail): void
    {
        Db::insert('audit_logs', [
            'tenant_id'     => $tenantId === null ? null : (int) $tenantId,
            'actor_user_id' => $userId,
            'actor_type'    => 'system',
            'action'        => $action,
            'entity_type'   => 'refresh_token',
            'after_json'    => json_encode($detail, JSON_UNESCAPED_UNICODE),
        ]);
    }
}
