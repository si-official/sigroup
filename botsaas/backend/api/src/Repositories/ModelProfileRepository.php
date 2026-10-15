<?php
declare(strict_types=1);

namespace App\Repositories;

use App\Core\Crypto;
use App\Core\Db;

/**
 * Model routing. Global (not tenant-owned): profiles and models are platform
 * configuration that tenants select from, never own.
 *
 * This is what makes "choose your AI model" real rather than marketing copy —
 * changing which model serves customer chat is a DB edit, not a deploy.
 */
final class ModelProfileRepository extends BaseRepository
{
    protected string $table = 'model_profiles';
    protected bool $tenantOwned = false;

    /**
     * Resolve the model for a purpose, honouring tenant and package overrides.
     *
     * @return array{profile:array,primary:array,fallback:?array,api_key:?string}|null
     */
    public function resolve(string $purpose, ?int $tenantId = null, ?int $overrideProfileId = null): ?array
    {
        $profile = null;

        if ($overrideProfileId !== null) {
            $profile = $this->selectOne(
                'SELECT * FROM model_profiles WHERE id = :id AND purpose = :p',
                ['id' => $overrideProfileId, 'p' => $purpose]
            );
        }

        $profile ??= $this->selectOne(
            'SELECT * FROM model_profiles WHERE purpose = :p AND is_default = 1 LIMIT 1',
            ['p' => $purpose]
        );

        $profile ??= $this->selectOne(
            'SELECT * FROM model_profiles WHERE purpose = :p ORDER BY id LIMIT 1',
            ['p' => $purpose]
        );

        if ($profile === null) {
            return null;
        }

        $primary  = $this->model((int) $profile['primary_model_id']);
        $fallback = $profile['fallback_model_id'] !== null
            ? $this->model((int) $profile['fallback_model_id'])
            : null;

        if ($primary === null) {
            return null;
        }

        return [
            'profile'  => $profile,
            'primary'  => $primary,
            'fallback' => $fallback,
            'api_key'  => $this->apiKeyFor((int) $primary['provider_id'], $tenantId),
        ];
    }

    public function model(int $modelId): ?array
    {
        return $this->selectOne(
            'SELECT m.*, pr.slug AS provider_slug, pr.base_url, pr.id AS provider_id
               FROM ai_models m
               JOIN ai_providers pr ON pr.id = m.provider_id
              WHERE m.id = :id AND m.is_active = 1',
            ['id' => $modelId]
        );
    }

    /** Tenant's own key (BYOK) wins over the platform key. */
    private function apiKeyFor(int $providerId, ?int $tenantId): ?string
    {
        if ($tenantId !== null) {
            $enc = Db::scalar(
                'SELECT api_key_enc FROM tenant_ai_keys
                  WHERE tenant_id = :t AND provider_id = :p AND is_active = 1',
                ['t' => $tenantId, 'p' => $providerId]
            );

            if ($enc !== null) {
                $key = Crypto::decrypt((string) $enc, 'tenant_ai_key:' . $tenantId . ':' . $providerId);
                if ($key !== null) {
                    return $key;
                }
            }
        }

        $enc = Db::scalar('SELECT api_key_enc FROM ai_providers WHERE id = :p', ['p' => $providerId]);

        return $enc === null ? null : Crypto::decrypt((string) $enc, 'provider:' . $providerId);
    }

    /** Cost of a completed call, from the model's own stored rates. */
    public function computeCost(int $modelId, int $tokensIn, int $tokensOut, int $cachedTokens = 0): string
    {
        $m = $this->selectOne(
            'SELECT input_price_per_1m, output_price_per_1m, cached_price_per_1m
               FROM ai_models WHERE id = :id',
            ['id' => $modelId]
        );

        if ($m === null) {
            return '0.000000';
        }

        $billableIn = max(0, $tokensIn - $cachedTokens);

        $cost = ($billableIn   / 1_000_000) * (float) $m['input_price_per_1m']
              + ($tokensOut    / 1_000_000) * (float) $m['output_price_per_1m']
              + ($cachedTokens / 1_000_000) * (float) ($m['cached_price_per_1m'] ?? $m['input_price_per_1m']);

        return number_format($cost, 6, '.', '');
    }

    /**
     * Models whose stored pricing cannot be trusted — a silent margin
     * corruptor, since every cost figure and every credit-mode charge is
     * computed from these rates.
     *
     * Covers BOTH failure modes, because they need different action:
     *   'unpriced' — never verified. Usually an inactive placeholder that
     *                must be priced BEFORE it is enabled; if one of these is
     *                somehow active it is billing at zero, which is worse.
     *   'stale'    — verified once, but longer ago than $days. Providers
     *                change prices and nothing tells you.
     *
     * Deliberately includes inactive models: the whole point is to catch an
     * unpriced model before somebody enables it.
     */
    public static function stalePricing(int $days = 90): array
    {
        return Db::select(
            "SELECT m.id, m.model_id, m.label, m.is_active, m.price_verified_at,
                    m.input_price_per_1m, m.output_price_per_1m,
                    pr.slug AS provider,
                    CASE
                        WHEN m.price_verified_at IS NULL THEN 'unpriced'
                        ELSE 'stale'
                    END AS reason,
                    (m.is_active = 1 AND m.price_verified_at IS NULL) AS is_urgent
               FROM ai_models m
               JOIN ai_providers pr ON pr.id = m.provider_id
              WHERE m.price_verified_at IS NULL
                 OR m.price_verified_at < DATE_SUB(CURDATE(), INTERVAL :d DAY)
              ORDER BY is_urgent DESC, pr.slug, m.model_id",
            ['d' => $days]
        );
    }
}
