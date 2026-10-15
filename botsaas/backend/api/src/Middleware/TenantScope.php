<?php
declare(strict_types=1);

namespace App\Middleware;

use App\Core\ApiException;
use App\Core\Context;
use App\Core\ForbiddenException;
use App\Core\Request;
use App\Core\Response;
use App\Services\TenantProvisioner;

/**
 * Loads tenant + subscription + effective limits into the request Context.
 *
 * The limits logic itself lives in LimitsResolver (via TenantProvisioner), not
 * here: jobs, the admin panel and QuotaService all need the same answer, and
 * two implementations of a billing rule eventually disagree.
 *
 * An EXPIRED subscription does not block the request. It yields limits with
 * every channel off and read_only=true, which RequirePermission turns into a
 * read-only panel. See that class for why.
 */
final class TenantScope implements MiddlewareInterface
{
    private TenantProvisioner $provisioner;

    public function __construct(?TenantProvisioner $provisioner = null)
    {
        $this->provisioner = $provisioner ?? new TenantProvisioner();
    }

    public function handle(Request $request, callable $next): Response
    {
        $ctx = Context::current();

        if (!$ctx->isAuthenticated()) {
            throw new ForbiddenException('Tenant scope requires authentication.', 'TENANT_CONTEXT_MISSING');
        }

        $tenantId = $ctx->tenantIdOrNull();

        if ($tenantId === null) {
            // Platform staff on a tenant route without act_as.
            throw new ForbiddenException(
                'This endpoint requires a tenant context. Platform staff must impersonate a tenant.',
                'TENANT_CONTEXT_MISSING'
            );
        }

        $loaded = $this->provisioner->load($tenantId);

        if ($loaded === null) {
            throw new ForbiddenException('Tenant not found.', 'TENANT_NOT_FOUND');
        }

        if ($loaded['tenant']['status'] === 'suspended') {
            throw new ApiException(
                'TENANT_SUSPENDED',
                'This account has been suspended. Please contact support.',
                403
            );
        }

        $ctx->setTenant($loaded['tenant'], $loaded['subscription'], $loaded['limits']);

        return $next($request);
    }
}
