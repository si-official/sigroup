<?php
declare(strict_types=1);

namespace App\Middleware;

use App\Core\Context;
use App\Core\ForbiddenException;
use App\Core\Logger;
use App\Core\Request;
use App\Core\Response;
use App\Support\Permissions;

/**
 * Checks one action against the role x action matrix, and — for write actions
 * — against subscription state.
 *
 * Expiry is deliberately read-only rather than locked-out: a lapsed customer
 * keeps full visibility of their orders, conversations and analytics, and
 * loses only the ability to change things. Locking them out of their own data
 * is how a renewal conversation becomes a chargeback.
 */
final class RequirePermission implements MiddlewareInterface
{
    private string $action;

    public function __construct(string $action)
    {
        $this->action = $action;

        // A typo'd permission name would deny everything at runtime in a way
        // that looks like a role bug. Fail at construction instead, where the
        // route table is being built.
        if (!Permissions::isKnownAction($action)) {
            throw new \InvalidArgumentException("Unknown permission action '{$action}'.");
        }
    }

    public function handle(Request $request, callable $next): Response
    {
        $ctx  = Context::current();
        $role = $ctx->role();

        if (!Permissions::allows($role, $this->action)) {
            Logger::info('permission.denied', [
                'action' => $this->action,
                'role'   => $role,
                'path'   => $request->path(),
            ]);

            throw new ForbiddenException(
                'Your role does not permit this action.',
                'INSUFFICIENT_PERMISSION'
            );
        }

        // Writes additionally require a live subscription.
        if (Permissions::isWriteAction($this->action) && $ctx->tenantIdOrNull() !== null) {
            if ((bool) $ctx->limit('read_only', false) || !$ctx->subscriptionIsActive()) {
                $source = (string) $ctx->limit('_source', 'expired');

                throw new ForbiddenException(
                    $source === 'credit'
                        ? 'Your wallet balance is empty. Top up to continue.'
                        : 'Your subscription has expired. Renew to make changes — your data is safe and still visible.',
                    $source === 'credit' ? 'WALLET_EMPTY' : 'SUBSCRIPTION_EXPIRED'
                );
            }
        }

        return $next($request);
    }
}
