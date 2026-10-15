<?php
declare(strict_types=1);

namespace App\Repositories;

use App\Core\Crypto;
use App\Core\Db;

/**
 * One webhook URL serves every tenant, so resolving an inbound page/phone id
 * to a channel is the hottest lookup in the ingestion path.
 */
final class ChannelRepository extends BaseRepository
{
    protected string $table = 'channels';

    /**
     * Resolve a webhook's external id to its channel AND tenant.
     *
     * Deliberately NOT tenant-scoped — at this point in the request there is
     * no authenticated tenant; the external id is what establishes it. This
     * is the one sanctioned cross-tenant read in the system, which is why it
     * is a static method with an explicit name rather than an instance method
     * that merely forgot its scope.
     *
     * @return array{id:int,tenant_id:int,type:string,credentials:array}|null
     */
    public static function resolveByExternalId(string $type, string $externalId): ?array
    {
        $row = Db::selectOne(
            'SELECT id, tenant_id, type, external_id, credentials_enc, status, is_active
               FROM channels
              WHERE type = :ty AND external_id = :x',
            ['ty' => $type, 'x' => $externalId]
        );

        if ($row === null || (int) $row['is_active'] !== 1) {
            return null;
        }

        return [
            'id'          => (int) $row['id'],
            'tenant_id'   => (int) $row['tenant_id'],
            'type'        => (string) $row['type'],
            'status'      => (string) $row['status'],
            'credentials' => Crypto::decryptArray($row['credentials_enc'], 'channel:' . $row['id']) ?? [],
        ];
    }

    /** Credentials are AES-GCM encrypted and AAD-bound to their own row. */
    public function storeCredentials(int $channelId, array $credentials): void
    {
        $this->execute(
            "UPDATE channels
                SET credentials_enc = :c, status = 'connected', connected_at = NOW(),
                    last_error = NULL
              WHERE id = :id AND tenant_id = :t",
            [
                'c'  => Crypto::encryptArray($credentials, 'channel:' . $channelId),
                'id' => $channelId,
                't'  => $this->tenantId,
            ]
        );
    }

    public function credentials(int $channelId): ?array
    {
        $enc = $this->scalar(
            'SELECT credentials_enc FROM channels WHERE id = :id AND tenant_id = :t',
            ['id' => $channelId, 't' => $this->tenantId]
        );

        return $enc === null ? null : Crypto::decryptArray((string) $enc, 'channel:' . $channelId);
    }

    public function forTenant(): array
    {
        return $this->select(
            'SELECT id, type, display_name, external_id, status, last_error,
                    token_expires_at, connected_at, is_active
               FROM channels WHERE tenant_id = :t ORDER BY type',
            ['t' => $this->tenantId]
        );
    }

    public function markError(int $channelId, string $error, string $status = 'error'): void
    {
        $this->execute(
            'UPDATE channels SET status = :s, last_error = :e, last_checked_at = NOW()
              WHERE id = :id AND tenant_id = :t',
            ['s' => $status, 'e' => mb_substr($error, 0, 500), 'id' => $channelId, 't' => $this->tenantId]
        );
    }

    /**
     * Channels whose token is near expiry, across all tenants.
     *
     * A silently expired page token stops the bot with no error the owner
     * ever sees — the single most common way these platforms lose customers.
     * The daily cron uses this to warn 7 days ahead.
     */
    public static function expiringSoon(int $days = 7, int $limit = 500): array
    {
        return Db::select(
            "SELECT id, tenant_id, type, display_name, token_expires_at, status
               FROM channels
              WHERE is_active = 1
                AND token_expires_at IS NOT NULL
                AND token_expires_at < DATE_ADD(NOW(), INTERVAL :d DAY)
              ORDER BY token_expires_at ASC
              LIMIT {$limit}",
            ['d' => $days]
        );
    }
}
