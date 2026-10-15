<?php
declare(strict_types=1);

namespace App\Services;

use App\Core\Context;
use App\Core\Db;
use App\Core\Logger;
use Throwable;

/**
 * Writes audit_logs entries.
 *
 * The impersonation rule is the point of this class: when platform staff act
 * as a tenant, the row records BOTH the impersonated identity and the real
 * actor. Without that, an admin's mistake is indistinguishable from the
 * customer's own action when you investigate it three weeks later — and the
 * customer will insist, correctly, that they never did it.
 */
final class AuditLogger
{
    /** @param array<string,mixed>|null $before @param array<string,mixed>|null $after */
    public static function record(
        string $action,
        ?string $entityType = null,
        ?int $entityId = null,
        ?array $before = null,
        ?array $after = null,
        ?string $ip = null,
        ?string $userAgent = null
    ): void {
        $ctx = Context::current();

        try {
            Db::insert('audit_logs', [
                'tenant_id'     => $ctx->tenantIdOrNull(),
                'actor_user_id' => $ctx->userId(),
                'actor_type'    => $ctx->isAuthenticated() ? 'user' : 'system',
                'impersonated'  => $ctx->isImpersonating() ? 1 : 0,
                // The human actually responsible, even when acting as someone else.
                'real_actor_id' => $ctx->isImpersonating() ? $ctx->realActorUserId() : null,
                'action'        => $action,
                'entity_type'   => $entityType,
                'entity_id'     => $entityId,
                'before_json'   => $before === null ? null : self::encode($before),
                'after_json'    => $after === null ? null : self::encode($after),
                'ip'            => $ip,
                'user_agent'    => $userAgent === null ? null : mb_substr($userAgent, 0, 255),
            ]);
        } catch (Throwable $e) {
            // An audit write must never break the operation it is recording,
            // but a silent loss is unacceptable — so it goes to the log file.
            Logger::error('audit.write_failed', ['action' => $action, 'message' => $e->getMessage()]);
        }
    }

    /** For system/job context where there is no request Context. */
    public static function recordAs(
        ?int $tenantId,
        ?int $actorUserId,
        string $actorType,
        string $action,
        ?string $entityType = null,
        ?int $entityId = null,
        ?array $after = null
    ): void {
        try {
            Db::insert('audit_logs', [
                'tenant_id'     => $tenantId,
                'actor_user_id' => $actorUserId,
                'actor_type'    => $actorType,
                'action'        => $action,
                'entity_type'   => $entityType,
                'entity_id'     => $entityId,
                'after_json'    => $after === null ? null : self::encode($after),
            ]);
        } catch (Throwable $e) {
            Logger::error('audit.write_failed', ['action' => $action, 'message' => $e->getMessage()]);
        }
    }

    /** Strip secrets before they reach a table people export and email around. */
    private static function encode(array $data): string
    {
        foreach ($data as $key => $value) {
            $lower = strtolower((string) $key);
            foreach (['password', 'token', 'secret', 'api_key', 'credential'] as $needle) {
                if (str_contains($lower, $needle)) {
                    $data[$key] = '[redacted]';
                    continue 2;
                }
            }
        }

        return (string) json_encode($data, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    }
}
