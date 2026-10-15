<?php
declare(strict_types=1);

/**
 * AI providers, models and routing profiles.
 *
 * PRICING PROVENANCE — read before trusting these numbers.
 *
 * Anthropic rates below are the first-party API rates as published, and carry
 * a price_verified_at stamp. The OpenAI and Google rows are seeded as
 * PLACEHOLDERS with price_verified_at = NULL and is_active = 0, because this
 * seeder had no authoritative source for them at write time and inventing
 * rates would silently corrupt every margin report and every credit-mode
 * charge — the failure would be invisible until the monthly numbers were
 * wrong.
 *
 * Fill them in from each provider's pricing page via the admin panel (Phase
 * 13), which stamps price_verified_at. ModelProfileRepository::stalePricing()
 * surfaces anything unverified or older than 90 days.
 */

use App\Core\Db;

return static function (): array {
    $today = date('Y-m-d');

    // ---------------------------------------------------------- providers --
    $providers = [
        ['slug' => 'anthropic', 'label' => 'Anthropic', 'base_url' => 'https://api.anthropic.com',  'is_active' => 1],
        ['slug' => 'openai',    'label' => 'OpenAI',    'base_url' => 'https://api.openai.com/v1',  'is_active' => 0],
        ['slug' => 'google',    'label' => 'Google AI', 'base_url' => 'https://generativelanguage.googleapis.com', 'is_active' => 0],
    ];

    $providerIds = [];
    foreach ($providers as $p) {
        $existing = Db::scalar('SELECT id FROM ai_providers WHERE slug = :s', ['s' => $p['slug']]);
        if ($existing !== null) {
            Db::execute(
                'UPDATE ai_providers SET label = :l, base_url = :b WHERE id = :id',
                ['l' => $p['label'], 'b' => $p['base_url'], 'id' => $existing]
            );
            $providerIds[$p['slug']] = (int) $existing;
        } else {
            $providerIds[$p['slug']] = Db::insert('ai_providers', $p);
        }
    }

    // ------------------------------------------------------------- models --
    // Anthropic: verified rates, $ per 1M tokens.
    $models = [
        ['anthropic', 'claude-opus-5',    'Claude Opus 5',    'chat',  5.00, 25.00, 0.50, 1000000, 128000, 1, 1, 1, $today],
        ['anthropic', 'claude-sonnet-5',  'Claude Sonnet 5',  'chat',  2.00, 10.00, 0.20, 1000000, 128000, 1, 1, 1, $today],
        ['anthropic', 'claude-haiku-4-5', 'Claude Haiku 4.5', 'chat',  1.00,  5.00, 0.10,  200000,  64000, 1, 1, 1, $today],
        ['anthropic', 'claude-opus-4-8',  'Claude Opus 4.8',  'chat',  5.00, 25.00, 0.50, 1000000, 128000, 1, 1, 1, $today],
        ['anthropic', 'claude-fable-5-1', 'Claude Fable 5.1', 'chat', 10.00, 50.00, 0.25, 1000000, 128000, 1, 1, 1, $today],

        // PLACEHOLDERS — pricing unverified, inactive until an admin confirms.
        ['openai', 'gpt-placeholder-chat', 'OpenAI chat (configure)',  'chat', 0, 0, null, null, null, 1, 1, 0, null],
        ['openai', 'whisper-1',            'Whisper (speech-to-text)', 'stt',  0, 0, null, null, null, 0, 0, 0, null],
        ['openai', 'tts-placeholder',      'OpenAI TTS (configure)',   'tts',  0, 0, null, null, null, 0, 0, 0, null],
        ['google', 'gemini-placeholder',   'Gemini (configure)',       'chat', 0, 0, null, null, null, 1, 1, 0, null],
        ['google', 'google-stt-placeholder','Google STT (configure)',  'stt',  0, 0, null, null, null, 0, 0, 0, null],
    ];

    $modelIds = [];
    foreach ($models as $m) {
        [$slug, $modelId, $label, $kind, $in, $out, $cached, $ctx, $maxOut, $tools, $vision, $caching, $verified] = $m;

        $row = [
            'provider_id'         => $providerIds[$slug],
            'model_id'            => $modelId,
            'label'               => $label,
            'kind'                => $kind,
            'input_price_per_1m'  => $in,
            'output_price_per_1m' => $out,
            'cached_price_per_1m' => $cached,
            'context_window'      => $ctx,
            'max_output_tokens'   => $maxOut,
            'supports_tools'      => $tools,
            'supports_vision'     => $vision,
            'supports_caching'    => $caching,
            'price_verified_at'   => $verified,
            'price_source'        => $verified !== null ? 'anthropic first-party API rates' : null,
            // Placeholders stay inactive so nothing routes to an unpriced model.
            'is_active'           => $verified !== null ? 1 : 0,
        ];

        $existing = Db::scalar(
            'SELECT id FROM ai_models WHERE provider_id = :p AND model_id = :m',
            ['p' => $providerIds[$slug], 'm' => $modelId]
        );

        if ($existing !== null) {
            $sets = implode(', ', array_map(static fn ($c) => "`{$c}` = :{$c}", array_keys($row)));
            Db::execute("UPDATE ai_models SET {$sets} WHERE id = " . (int) $existing, $row);
            $modelIds[$modelId] = (int) $existing;
        } else {
            $modelIds[$modelId] = Db::insert('ai_models', $row);
        }
    }

    // ----------------------------------------------------------- profiles --
    //
    // Model choice per purpose is a cost decision as much as a quality one:
    //   chat            — the hot path. Sonnet 5 is the quality/cost sweet
    //                     spot for customer replies; Haiku catches a Sonnet
    //                     outage without dropping the customer.
    //   comment         — short, high volume, low judgement. Haiku.
    //   shop_assistant  — multi-step tool use over the owner's own data, low
    //                     volume. Worth Opus.
    //   prompt_gen      — runs once per tenant during onboarding and shapes
    //                     every later reply. Worth Opus.
    //   classify        — intent/language detection. Haiku.
    $profiles = [
        [
            'name' => 'Customer chat (standard)', 'slug' => 'chat-standard', 'purpose' => 'chat',
            'primary' => 'claude-sonnet-5', 'fallback' => 'claude-haiku-4-5',
            'temperature' => 0.40, 'max_output_tokens' => 600, 'effort' => 'medium',
            'is_default' => 1, 'is_tenant_selectable' => 1, 'min_package_price' => 0,
        ],
        [
            'name' => 'Customer chat (premium)', 'slug' => 'chat-premium', 'purpose' => 'chat',
            'primary' => 'claude-opus-5', 'fallback' => 'claude-sonnet-5',
            'temperature' => 0.40, 'max_output_tokens' => 900, 'effort' => 'high',
            'is_default' => 0, 'is_tenant_selectable' => 1, 'min_package_price' => 4499,
        ],
        [
            'name' => 'Comment replies', 'slug' => 'comment-fast', 'purpose' => 'comment',
            'primary' => 'claude-haiku-4-5', 'fallback' => 'claude-sonnet-5',
            'temperature' => 0.60, 'max_output_tokens' => 200, 'effort' => 'low',
            'is_default' => 1, 'is_tenant_selectable' => 0, 'min_package_price' => 0,
        ],
        [
            'name' => 'Shop Assistant', 'slug' => 'shop-assistant', 'purpose' => 'shop_assistant',
            'primary' => 'claude-opus-5', 'fallback' => 'claude-sonnet-5',
            'temperature' => 0.20, 'max_output_tokens' => 1500, 'effort' => 'high',
            'is_default' => 1, 'is_tenant_selectable' => 0, 'min_package_price' => 0,
        ],
        [
            'name' => 'Prompt generator', 'slug' => 'prompt-gen', 'purpose' => 'prompt_gen',
            'primary' => 'claude-opus-5', 'fallback' => 'claude-sonnet-5',
            'temperature' => 0.70, 'max_output_tokens' => 4000, 'effort' => 'high',
            'is_default' => 1, 'is_tenant_selectable' => 0, 'min_package_price' => 0,
        ],
        [
            'name' => 'Intent classifier', 'slug' => 'classify-fast', 'purpose' => 'classify',
            'primary' => 'claude-haiku-4-5', 'fallback' => null,
            'temperature' => 0.00, 'max_output_tokens' => 64, 'effort' => 'low',
            'is_default' => 1, 'is_tenant_selectable' => 0, 'min_package_price' => 0,
        ],
    ];

    $profileCount = 0;
    foreach ($profiles as $p) {
        $row = [
            'name'                 => $p['name'],
            'slug'                 => $p['slug'],
            'purpose'              => $p['purpose'],
            'primary_model_id'     => $modelIds[$p['primary']],
            'fallback_model_id'    => $p['fallback'] === null ? null : $modelIds[$p['fallback']],
            'temperature'          => $p['temperature'],
            'max_output_tokens'    => $p['max_output_tokens'],
            'effort'               => $p['effort'],
            'is_default'           => $p['is_default'],
            'is_tenant_selectable' => $p['is_tenant_selectable'],
            'min_package_price'    => $p['min_package_price'],
        ];

        $existing = Db::scalar('SELECT id FROM model_profiles WHERE slug = :s', ['s' => $p['slug']]);
        if ($existing !== null) {
            $sets = implode(', ', array_map(static fn ($c) => "`{$c}` = :{$c}", array_keys($row)));
            Db::execute("UPDATE model_profiles SET {$sets} WHERE id = " . (int) $existing, $row);
        } else {
            Db::insert('model_profiles', $row);
        }
        $profileCount++;
    }

    $unverified = (int) Db::scalar(
        'SELECT COUNT(*) FROM ai_models WHERE price_verified_at IS NULL'
    );

    return [
        'providers'  => count($providerIds),
        'models'     => count($modelIds),
        'profiles'   => $profileCount,
        'unverified' => $unverified,
    ];
};
