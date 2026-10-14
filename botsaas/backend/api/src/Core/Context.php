<?php
declare(strict_types=1);

namespace App\Core;

/**
 * Request-scoped identity + plan context, populated by Auth and TenantScope
 * middleware and read by everything downstream.
 *
 * This object is the ONLY sanctioned source of tenant_id. Nothing may take a
 * tenant id from a request body, query string, or an id the LLM produced in a
 * tool call — that is precisely how cross-tenant data leaks happen. Repositories
 * read it from here and nowhere else.
 */
final class Context
{
    private ?int $userId = null;
    private ?int $tenantId = null;
    private string $role = 'guest';
    /** @var array<string,mixed> */
    private array $tenant = [];
    /** @var array<string,mixed> effective limits (snapshot > package > credit mode) */
    private array $limits = [];
    /** @var array<string,mixed> */
    private array $subscription = [];
    private bool $impersonating = false;
    private ?int $realActorUserId = null;

    private static ?self $current = null;

    public static function current(): self
    {
        return self::$current ??= new self();
    }

    public static function reset(): void
    {
        self::$current = null;
    }

    public function setUser(int $userId, string $role, ?int $tenantId): self
    {
        $this->userId   = $userId;
        $this->role     = $role;
        $this->tenantId = $tenantId;
        Logger::withContext(['user_id' => $userId, 'tenant_id' => $tenantId]);
        return $this;
    }

    /** @param array<string,mixed> $tenant */
    public function setTenant(array $tenant, array $subscription, array $limits): self
    {
        $this->tenant       = $tenant;
        $this->subscription = $subscription;
        $this->limits       = $limits;
        $this->tenantId     = isset($tenant['id']) ? (int) $tenant['id'] : $this->tenantId;
        return $this;
    }

    /**
     * Platform staff acting as a tenant. Every write performed in this state
     * must be audited against the REAL actor, not the impersonated owner —
     * otherwise an admin mistake is indistinguishable from a customer's own
     * action when you are investigating it later.
     */
    public function setImpersonating(int $realActorUserId): self
    {
        $this->impersonating   = true;
        $this->realActorUserId = $realActorUserId;
        Logger::withContext(['impersonating' => true, 'real_actor' => $realActorUserId]);
        return $this;
    }

    public function userId(): ?int   { return $this->userId; }
    public function role(): string   { return $this->role; }
    public function isImpersonating(): bool { return $this->impersonating; }
    public function realActorUserId(): ?int { return $this->realActorUserId ?? $this->userId; }
    public function isAuthenticated(): bool { return $this->userId !== null; }

    public function isPlatformStaff(): bool
    {
        return in_array($this->role, ['super_admin', 'platform_support'], true);
    }

    /** Throws rather than returning null: a nullable tenantId invites `?? 0`. */
    public function tenantId(): int
    {
        if ($this->tenantId === null) {
            throw new ForbiddenException('No tenant context on this request.', 'TENANT_CONTEXT_MISSING');
        }
        return $this->tenantId;
    }

    public function tenantIdOrNull(): ?int { return $this->tenantId; }

    /** @return array<string,mixed> */
    public function tenant(): array { return $this->tenant; }

    public function timezone(): string
    {
        return (string) ($this->tenant['timezone'] ?? Env::string('APP_TIMEZONE', 'Asia/Dhaka'));
    }

    /** @return array<string,mixed> */
    public function subscription(): array { return $this->subscription; }

    public function limit(string $key, mixed $default = null): mixed
    {
        return $this->limits[$key] ?? $default;
    }

    /** @return array<string,mixed> */
    public function limits(): array { return $this->limits; }

    /** Boolean feature flag from the effective limits. */
    public function hasFeature(string $feature): bool
    {
        return (bool) ($this->limits[$feature] ?? false);
    }

    public function subscriptionIsActive(): bool
    {
        $status = (string) ($this->subscription['status'] ?? 'expired');
        if (!in_array($status, ['active', 'trialing'], true)) {
            return false;
        }
        $expires = $this->subscription['expires_at'] ?? null;
        return $expires === null || strtotime((string) $expires) > time();
    }
}
