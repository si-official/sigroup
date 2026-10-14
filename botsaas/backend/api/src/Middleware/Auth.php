<?php
declare(strict_types=1);

namespace App\Middleware;

use App\Core\Context;
use App\Core\Db;
use App\Core\Env;
use App\Core\Logger;
use App\Core\Request;
use App\Core\Response;
use App\Core\UnauthorizedException;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Throwable;

/**
 * JWT bearer authentication.
 *
 * Algorithm is PINNED to one value from .env and passed explicitly to decode().
 * firebase/php-jwt requires the algorithm up front, which closes the classic
 * "alg: none" and HS/RS confusion attacks — but only if you never pass the
 * token's own header algorithm back in. We never do.
 */
final class Auth implements MiddlewareInterface
{
    /** @param bool $optional true = populate context if a token is present, but allow anonymous */
    public function __construct(private bool $optional = false)
    {
    }

    public function handle(Request $request, callable $next): Response
    {
        $token = $request->bearerToken();

        if ($token === null) {
            if ($this->optional) {
                return $next($request);
            }
            throw new UnauthorizedException('Missing bearer token.');
        }

        $algo   = Env::string('JWT_ALGO', 'HS256');
        $leeway = Env::int('JWT_LEEWAY', 10);

        if (!in_array($algo, ['HS256', 'HS384', 'HS512'], true)) {
            // Guard against a misconfiguration that would weaken verification.
            Logger::critical('auth.bad_algo_config', ['algo' => $algo]);
            throw new UnauthorizedException('Authentication is misconfigured.', 'AUTH_MISCONFIGURED');
        }

        JWT::$leeway = $leeway;

        try {
            $claims = (array) JWT::decode(
                $token,
                new Key(Env::string('JWT_SECRET'), $algo)
            );
        } catch (Throwable $e) {
            Logger::info('auth.token_rejected', ['reason' => get_class($e)]);
            throw new UnauthorizedException('Your session has expired. Please sign in again.', 'TOKEN_INVALID');
        }

        if (($claims['iss'] ?? null) !== Env::string('JWT_ISSUER', 'chatcommerce')) {
            throw new UnauthorizedException('Token issuer mismatch.', 'TOKEN_INVALID');
        }
        if (($claims['typ'] ?? 'access') !== 'access') {
            // A refresh token must never be accepted as an access token.
            throw new UnauthorizedException('Wrong token type.', 'TOKEN_INVALID');
        }

        $userId = isset($claims['sub']) ? (int) $claims['sub'] : 0;
        if ($userId <= 0) {
            throw new UnauthorizedException('Token subject missing.', 'TOKEN_INVALID');
        }

        // The token carries role/tenant for speed, but a disabled user must
        // lose access immediately rather than at token expiry — so we verify
        // status against the database on every request. One indexed primary-key
        // lookup is a fair price for being able to cut off a compromised account.
        $user = Db::selectOne(
            'SELECT id, tenant_id, role, status FROM users WHERE id = :id',
            ['id' => $userId]
        );

        if ($user === null || $user['status'] !== 'active') {
            throw new UnauthorizedException('Account is not active.', 'ACCOUNT_INACTIVE');
        }

        $ctx = Context::current()->setUser(
            (int) $user['id'],
            (string) $user['role'],
            $user['tenant_id'] !== null ? (int) $user['tenant_id'] : null
        );

        // Platform staff impersonating a tenant: the token carries act_as.
        if (isset($claims['act_as']) && $ctx->isPlatformStaff()) {
            $ctx->setImpersonating((int) $user['id']);
            $ctx->setUser((int) $user['id'], (string) $user['role'], (int) $claims['act_as']);
        }

        return $next($request);
    }
}
