<?php
declare(strict_types=1);

namespace App\Repositories;

use App\Core\Crypto;
use App\Core\Db;

final class CourierRepository extends BaseRepository
{
    protected string $table = 'courier_accounts';

    public function storeCredentials(int $accountId, array $credentials): void
    {
        $this->execute(
            'UPDATE courier_accounts SET credentials_enc = :c WHERE id = :id AND tenant_id = :t',
            [
                'c'  => Crypto::encryptArray($credentials, 'courier:' . $accountId),
                'id' => $accountId,
                't'  => $this->tenantId,
            ]
        );
    }

    public function credentials(int $accountId): ?array
    {
        $enc = $this->scalar(
            'SELECT credentials_enc FROM courier_accounts WHERE id = :id AND tenant_id = :t',
            ['id' => $accountId, 't' => $this->tenantId]
        );

        return $enc === null ? null : Crypto::decryptArray((string) $enc, 'courier:' . $accountId);
    }

    public function defaultAccount(): ?array
    {
        return $this->selectOne(
            'SELECT * FROM courier_accounts
              WHERE tenant_id = :t AND is_active = 1
              ORDER BY is_default DESC, id ASC LIMIT 1',
            ['t' => $this->tenantId]
        );
    }

    /**
     * Map an order's free-text district/thana onto a provider's own location
     * ids. A mismatch here is the #1 cause of failed dispatch, so an
     * unmatched name is returned explicitly rather than silently dropped.
     *
     * @return array{matched:bool,city_id:?string,zone_id:?string,unmatched:?string}
     */
    public function resolveLocation(string $provider, ?string $district, ?string $thana): array
    {
        $norm = static fn (?string $s): string => ProductRepository::normalize((string) $s);

        $city = $district === null ? null : Db::selectOne(
            'SELECT external_id, name FROM courier_locations
              WHERE provider = :p AND level = :lv AND name_norm = :n LIMIT 1',
            ['p' => $provider, 'lv' => 'city', 'n' => $norm($district)]
        );

        if ($city === null) {
            return ['matched' => false, 'city_id' => null, 'zone_id' => null, 'unmatched' => $district];
        }

        $zone = $thana === null ? null : Db::selectOne(
            'SELECT external_id FROM courier_locations
              WHERE provider = :p AND level = :lv AND parent_external_id = :c AND name_norm = :n LIMIT 1',
            ['p' => $provider, 'lv' => 'zone', 'c' => $city['external_id'], 'n' => $norm($thana)]
        );

        return [
            'matched'   => $zone !== null || $thana === null,
            'city_id'   => (string) $city['external_id'],
            'zone_id'   => $zone === null ? null : (string) $zone['external_id'],
            'unmatched' => $zone === null && $thana !== null ? $thana : null,
        ];
    }

    /** Shipments still in flight, for the 15-minute sync cron. */
    public static function needingSync(int $limit = 100): array
    {
        return Db::select(
            "SELECT cs.id, cs.tenant_id, cs.order_id, cs.courier_account_id,
                    cs.consignment_id, cs.tracking_code, cs.status,
                    ca.provider, ca.env
               FROM courier_shipments cs
               JOIN courier_accounts ca ON ca.id = cs.courier_account_id
              WHERE (cs.status IS NULL OR cs.status NOT IN ('delivered','returned','cancelled'))
                AND (cs.status_updated_at IS NULL
                     OR cs.status_updated_at < DATE_SUB(NOW(), INTERVAL 15 MINUTE))
              ORDER BY cs.status_updated_at ASC
              LIMIT {$limit}"
        );
    }
}
