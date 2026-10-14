<?php
declare(strict_types=1);

namespace App\Middleware;

use App\Core\Context;
use App\Core\ForbiddenException;
use App\Core\Request;
use App\Core\Response;

/**
 * Coarse role gate. The fine-grained role x action matrix lands in Phase 3;
 * this exists now so admin routes are not reachable by a tenant token from
 * the very first commit.
 */
final class RequireRole implements MiddlewareInterface
{
    /** @var string[] */
    private array $roles;

    public function __construct(string ...$roles)
    {
        $this->roles = $roles;
    }

    public function handle(Request $request, callable $next): Response
    {
        $role = Context::current()->role();

        if (!in_array($role, $this->roles, true)) {
            throw new ForbiddenException(
                'Your role does not permit this action.',
                'INSUFFICIENT_ROLE'
            );
        }

        return $next($request);
    }
}
