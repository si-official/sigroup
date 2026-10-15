<?php
declare(strict_types=1);

namespace App\Support;

/**
 * The role x action permission matrix.
 *
 * ONE table, declared explicitly, rather than scattered `if ($role === ...)`
 * checks. Two reasons this matters more than it looks:
 *
 *  1. It is auditable. You can read this file and answer "what can an agent
 *     do?" without grepping thirty controllers.
 *  2. A new action that nobody added here DENIES by default. The alternative
 *     — permissive unless denied — means every forgotten check is a hole.
 *
 * Platform roles (tenant_id IS NULL) are not in the matrix: they are handled
 * separately, because platform access is about the admin surface, not about a
 * tenant's data. A platform admin reaches tenant data only by impersonating,
 * at which point they carry a tenant role and this matrix applies again.
 */
final class Permissions
{
    // --- tenant roles -------------------------------------------------------
    public const OWNER   = 'tenant_owner';
    public const MANAGER = 'tenant_manager';
    public const AGENT   = 'tenant_agent';

    // --- platform roles -----------------------------------------------------
    public const SUPER_ADMIN      = 'super_admin';
    public const PLATFORM_SUPPORT = 'platform_support';

    /**
     * action => roles allowed.
     *
     * The shape of it: an AGENT answers customers and nothing else. A MANAGER
     * runs the shop day to day — products, orders, automation, the bot's
     * prompt. Only the OWNER touches money, channel credentials, staff and
     * the account itself. That split exists because the owner is usually the
     * only person who should be able to spend money or disconnect a Page,
     * while agents are often part-time staff on a shared device.
     *
     * @var array<string,string[]>
     */
    private const MATRIX = [
        // ---- inbox & conversations ----
        'inbox.view'              => [self::OWNER, self::MANAGER, self::AGENT],
        'inbox.reply'             => [self::OWNER, self::MANAGER, self::AGENT],
        'inbox.assign'            => [self::OWNER, self::MANAGER],
        'inbox.resolve'           => [self::OWNER, self::MANAGER, self::AGENT],
        'inbox.toggle_ai'         => [self::OWNER, self::MANAGER, self::AGENT],
        'inbox.delete'            => [self::OWNER],
        'contact.view'            => [self::OWNER, self::MANAGER, self::AGENT],
        'contact.edit'            => [self::OWNER, self::MANAGER, self::AGENT],
        'contact.block'           => [self::OWNER, self::MANAGER],
        'contact.export'          => [self::OWNER],   // bulk PII leaves the system

        // ---- catalog ----
        'product.view'            => [self::OWNER, self::MANAGER, self::AGENT],
        'product.create'          => [self::OWNER, self::MANAGER],
        'product.edit'            => [self::OWNER, self::MANAGER],
        'product.delete'          => [self::OWNER, self::MANAGER],
        'product.import'          => [self::OWNER, self::MANAGER],

        // ---- orders ----
        'order.view'              => [self::OWNER, self::MANAGER, self::AGENT],
        'order.create'            => [self::OWNER, self::MANAGER, self::AGENT],
        'order.edit'              => [self::OWNER, self::MANAGER],
        'order.change_status'     => [self::OWNER, self::MANAGER, self::AGENT],
        'order.cancel'            => [self::OWNER, self::MANAGER],
        'order.export'            => [self::OWNER, self::MANAGER],
        'lead.view'               => [self::OWNER, self::MANAGER, self::AGENT],
        'lead.edit'               => [self::OWNER, self::MANAGER, self::AGENT],

        // ---- bot configuration: the AI's instructions ARE the business ----
        'bot.view_config'         => [self::OWNER, self::MANAGER, self::AGENT],
        'bot.edit_prompt'         => [self::OWNER, self::MANAGER],
        'bot.edit_settings'       => [self::OWNER, self::MANAGER],
        'bot.test'                => [self::OWNER, self::MANAGER],

        // ---- automation ----
        'automation.view'         => [self::OWNER, self::MANAGER, self::AGENT],
        'automation.edit'         => [self::OWNER, self::MANAGER],

        // ---- channels: credentials, so owner only ----
        'channel.view'            => [self::OWNER, self::MANAGER],
        'channel.connect'         => [self::OWNER],
        'channel.disconnect'      => [self::OWNER],

        // ---- courier ----
        'courier.view'            => [self::OWNER, self::MANAGER],
        'courier.configure'       => [self::OWNER],
        'courier.dispatch'        => [self::OWNER, self::MANAGER],

        // ---- analytics ----
        'analytics.view'          => [self::OWNER, self::MANAGER],
        'analytics.export'        => [self::OWNER],
        'activity.view'           => [self::OWNER, self::MANAGER],
        'shop_assistant.use'      => [self::OWNER, self::MANAGER],

        // ---- billing: money. Owner only, always. ----
        'billing.view'            => [self::OWNER],
        'billing.purchase'        => [self::OWNER],
        'billing.switch_mode'     => [self::OWNER],
        'billing.topup'           => [self::OWNER],

        // ---- team ----
        'team.view'               => [self::OWNER, self::MANAGER],
        'team.invite'             => [self::OWNER],
        'team.change_role'        => [self::OWNER],
        'team.remove'             => [self::OWNER],

        // ---- account ----
        'account.view'            => [self::OWNER, self::MANAGER, self::AGENT],
        'account.edit'            => [self::OWNER],
        'account.delete'          => [self::OWNER],
        'api_token.manage'        => [self::OWNER],
    ];

    /** Actions on the platform admin surface. Never reachable by a tenant token. */
    private const PLATFORM_MATRIX = [
        'platform.overview'        => [self::SUPER_ADMIN, self::PLATFORM_SUPPORT],
        'platform.tenant.view'     => [self::SUPER_ADMIN, self::PLATFORM_SUPPORT],
        'platform.tenant.suspend'  => [self::SUPER_ADMIN],
        'platform.tenant.impersonate' => [self::SUPER_ADMIN],
        'platform.tenant.grant_credit' => [self::SUPER_ADMIN],
        'platform.package.view'    => [self::SUPER_ADMIN, self::PLATFORM_SUPPORT],
        'platform.package.edit'    => [self::SUPER_ADMIN],
        'platform.ai.view'         => [self::SUPER_ADMIN, self::PLATFORM_SUPPORT],
        'platform.ai.edit'         => [self::SUPER_ADMIN],
        'platform.payment.view'    => [self::SUPER_ADMIN, self::PLATFORM_SUPPORT],
        'platform.payment.verify'  => [self::SUPER_ADMIN],
        'platform.payment.refund'  => [self::SUPER_ADMIN],
        'platform.jobs.view'       => [self::SUPER_ADMIN, self::PLATFORM_SUPPORT],
        'platform.jobs.retry'      => [self::SUPER_ADMIN],
        'platform.settings.edit'   => [self::SUPER_ADMIN],
        'platform.support.respond' => [self::SUPER_ADMIN, self::PLATFORM_SUPPORT],
    ];

    public static function allows(string $role, string $action): bool
    {
        $allowed = self::MATRIX[$action] ?? self::PLATFORM_MATRIX[$action] ?? null;

        // Unknown action denies. A typo'd permission name must fail closed, not
        // silently grant access to everyone.
        if ($allowed === null) {
            return false;
        }

        return in_array($role, $allowed, true);
    }

    public static function isKnownAction(string $action): bool
    {
        return isset(self::MATRIX[$action]) || isset(self::PLATFORM_MATRIX[$action]);
    }

    public static function isTenantRole(string $role): bool
    {
        return in_array($role, [self::OWNER, self::MANAGER, self::AGENT], true);
    }

    public static function isPlatformRole(string $role): bool
    {
        return in_array($role, [self::SUPER_ADMIN, self::PLATFORM_SUPPORT], true);
    }

    /**
     * Everything a role can do. The panel calls this once at login to hide
     * controls the user cannot use — but hiding is cosmetic; the server check
     * is the real one, and both read this same table.
     *
     * @return string[]
     */
    public static function forRole(string $role): array
    {
        $actions = [];
        foreach ([self::MATRIX, self::PLATFORM_MATRIX] as $matrix) {
            foreach ($matrix as $action => $roles) {
                if (in_array($role, $roles, true)) {
                    $actions[] = $action;
                }
            }
        }
        return $actions;
    }

    /** @return array<string,string[]> the whole table, for docs and tests */
    public static function matrix(): array
    {
        return self::MATRIX + self::PLATFORM_MATRIX;
    }

    /**
     * Actions that MUTATE tenant data. An expired subscription downgrades the
     * panel to read-only, and this is the list that enforces it. Reads stay
     * open so a lapsed customer can still see their orders and be convinced
     * to renew — locking them out of their own data is how you lose them.
     *
     * @return string[]
     */
    public static function writeActions(): array
    {
        return array_values(array_filter(
            array_keys(self::MATRIX),
            static fn (string $a) => !str_ends_with($a, '.view') && !str_ends_with($a, '.use')
        ));
    }

    public static function isWriteAction(string $action): bool
    {
        return isset(self::MATRIX[$action])
            && !str_ends_with($action, '.view')
            && !str_ends_with($action, '.use');
    }
}
