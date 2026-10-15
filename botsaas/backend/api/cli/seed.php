<?php
declare(strict_types=1);

/**
 * Seeds packages and a platform super admin.
 *
 *   php cli/seed.php                  idempotent; safe to re-run
 *   php cli/seed.php --fresh          wipe tenant data first (local only)
 */

require_once dirname(__DIR__) . '/vendor/autoload.php';

use App\Core\Bootstrap;
use App\Core\Db;
use App\Core\Env;
use App\Services\PasswordHasher;
use App\Support\Permissions;

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit("CLI only.\n");
}

Bootstrap::boot(dirname(__DIR__));

$fresh = in_array('--fresh', array_slice($argv, 1), true);

if ($fresh) {
    if (Env::isProduction()) {
        fwrite(STDERR, "Refusing to run --fresh in production.\n");
        exit(1);
    }
    Db::pdo()->exec('SET FOREIGN_KEY_CHECKS = 0');
    foreach (['subscription_usage', 'subscriptions', 'wallet_transactions', 'wallets',
              'bot_settings', 'bot_configs', 'refresh_tokens', 'email_verifications',
              'password_resets', 'login_attempts', 'audit_logs', 'users', 'tenants'] as $t) {
        Db::pdo()->exec("TRUNCATE TABLE {$t}");
    }
    Db::pdo()->exec('SET FOREIGN_KEY_CHECKS = 1');
    echo "Wiped tenant data.\n";
}

/**
 * Plans. Every limit must increase (or stay equal) with price — see the
 * assertion below for why that is enforced rather than assumed.
 */
$packages = [
    [
        'name' => 'Free trial', 'slug' => 'free-trial', 'price' => 0, 'duration_days' => 3,
        'is_trial' => 1, 'is_public' => 1, 'sort_order' => 0,
        'msg_limit' => 30, 'comment_reply_limit' => 10, 'faq_rule_limit' => 10,
        'product_limit' => 5, 'staff_seat_limit' => 1,
        'voice_msg_limit' => 5, 'voice_duration_sec' => 300,
        'fb_enabled' => 1, 'wa_enabled' => 0, 'ig_enabled' => 0, 'widget_enabled' => 0,
        'voice_mode' => 'stt', 'courier_enabled' => 1, 'shop_assistant_enabled' => 1,
        'api_access_enabled' => 0, 'ai_credit_type' => 'system',
    ],
    [
        'name' => 'Basic', 'slug' => 'basic', 'price' => 799, 'duration_days' => 30,
        'is_trial' => 0, 'is_public' => 1, 'sort_order' => 1,
        'msg_limit' => 1000, 'comment_reply_limit' => 100, 'faq_rule_limit' => 100,
        'product_limit' => 50, 'staff_seat_limit' => 2,
        'voice_msg_limit' => 100, 'voice_duration_sec' => 300,
        'fb_enabled' => 1, 'wa_enabled' => 1, 'ig_enabled' => 0, 'widget_enabled' => 0,
        'voice_mode' => 'stt', 'courier_enabled' => 1, 'shop_assistant_enabled' => 1,
        'api_access_enabled' => 0, 'ai_credit_type' => 'system',
    ],
    [
        'name' => 'Advance', 'slug' => 'advance', 'price' => 1799, 'duration_days' => 30,
        'is_trial' => 0, 'is_public' => 1, 'sort_order' => 2, 'badge' => 'Most Popular',
        'msg_limit' => 2500, 'comment_reply_limit' => 500, 'faq_rule_limit' => 500,
        'product_limit' => 150, 'staff_seat_limit' => 4,
        'voice_msg_limit' => 300, 'voice_duration_sec' => 300,
        'fb_enabled' => 1, 'wa_enabled' => 1, 'ig_enabled' => 1, 'widget_enabled' => 0,
        'voice_mode' => 'stt', 'courier_enabled' => 1, 'shop_assistant_enabled' => 1,
        'api_access_enabled' => 0, 'ai_credit_type' => 'system',
    ],
    [
        'name' => 'Business', 'slug' => 'business', 'price' => 4499, 'duration_days' => 30,
        'is_trial' => 0, 'is_public' => 1, 'sort_order' => 3,
        'msg_limit' => 6500, 'comment_reply_limit' => 1000, 'faq_rule_limit' => 1000,
        'product_limit' => 400, 'staff_seat_limit' => 8,
        'voice_msg_limit' => 800, 'voice_duration_sec' => 300,
        'fb_enabled' => 1, 'wa_enabled' => 1, 'ig_enabled' => 1, 'widget_enabled' => 1,
        'voice_mode' => 'stt', 'courier_enabled' => 1, 'shop_assistant_enabled' => 1,
        'api_access_enabled' => 0, 'ai_credit_type' => 'system',
    ],
    [
        'name' => 'Pro', 'slug' => 'pro', 'price' => 9999, 'duration_days' => 30,
        'is_trial' => 0, 'is_public' => 1, 'sort_order' => 4,
        'msg_limit' => 15000, 'comment_reply_limit' => 2000, 'faq_rule_limit' => 2000,
        'product_limit' => 1000, 'staff_seat_limit' => 20,
        'voice_msg_limit' => 2000, 'voice_duration_sec' => 600,
        'fb_enabled' => 1, 'wa_enabled' => 1, 'ig_enabled' => 1, 'widget_enabled' => 1,
        'voice_mode' => 'both', 'courier_enabled' => 1, 'shop_assistant_enabled' => 1,
        'api_access_enabled' => 1, 'ai_credit_type' => 'system',
    ],
    [
        'name' => 'Enterprise', 'slug' => 'enterprise', 'price' => 0, 'duration_days' => 30,
        'is_trial' => 0, 'is_public' => 0, 'sort_order' => 5,   // quoted, not self-serve
        'msg_limit' => null, 'comment_reply_limit' => null, 'faq_rule_limit' => null,
        'product_limit' => null, 'staff_seat_limit' => 100,
        'voice_msg_limit' => 100000, 'voice_duration_sec' => 900,
        'fb_enabled' => 1, 'wa_enabled' => 1, 'ig_enabled' => 1, 'widget_enabled' => 1,
        'voice_mode' => 'both', 'courier_enabled' => 1, 'shop_assistant_enabled' => 1,
        'api_access_enabled' => 1, 'ai_credit_type' => 'system',
    ],
];

/**
 * MONOTONIC PRICING ASSERTION.
 *
 * Every numeric limit must be non-decreasing as price rises, and every feature
 * flag must never switch off on a dearer plan. This exists because the
 * competitor this product is modelled on ships exactly that bug: their
 * Business tier (৳4,499) grants FEWER products and FEWER FAQ rules than their
 * cheaper Advance tier (৳1,799). It is the kind of mistake that survives for
 * years because nothing checks it — a spreadsheet error becomes a pricing page.
 *
 * Refusing to seed is the right failure: a wrong plan matrix silently
 * overcharges or undercharges every customer who buys it.
 */
function assertMonotonic(array $packages): void
{
    $paid = array_values(array_filter(
        $packages,
        static fn (array $p) => !$p['is_trial'] && $p['price'] > 0
    ));
    usort($paid, static fn (array $a, array $b) => $a['price'] <=> $b['price']);

    $numeric = ['msg_limit', 'comment_reply_limit', 'faq_rule_limit', 'product_limit',
                'staff_seat_limit', 'voice_msg_limit', 'voice_duration_sec'];
    $flags   = ['fb_enabled', 'wa_enabled', 'ig_enabled', 'widget_enabled',
                'courier_enabled', 'shop_assistant_enabled', 'api_access_enabled'];
    $voiceRank = ['none' => 0, 'stt' => 1, 'both' => 2];

    $errors = [];

    for ($i = 1; $i < count($paid); $i++) {
        $lower  = $paid[$i - 1];
        $higher = $paid[$i];

        foreach ($numeric as $field) {
            // NULL = unlimited, which is always >= any finite value.
            if ($higher[$field] === null) {
                continue;
            }
            if ($lower[$field] === null) {
                $errors[] = sprintf(
                    '%s (%d) has unlimited %s but the dearer %s (%d) caps it at %d',
                    $lower['name'], $lower['price'], $field, $higher['name'], $higher['price'], $higher[$field]
                );
                continue;
            }
            if ($higher[$field] < $lower[$field]) {
                $errors[] = sprintf(
                    '%s (%d) gives %s=%d but the cheaper %s (%d) gives %d',
                    $higher['name'], $higher['price'], $field, $higher[$field],
                    $lower['name'], $lower['price'], $lower[$field]
                );
            }
        }

        foreach ($flags as $flag) {
            if ((int) $higher[$flag] < (int) $lower[$flag]) {
                $errors[] = sprintf(
                    '%s (%d) disables %s, but the cheaper %s (%d) enables it',
                    $higher['name'], $higher['price'], $flag, $lower['name'], $lower['price']
                );
            }
        }

        if ($voiceRank[$higher['voice_mode']] < $voiceRank[$lower['voice_mode']]) {
            $errors[] = sprintf(
                '%s (%d) has voice_mode=%s, weaker than the cheaper %s (%d) at %s',
                $higher['name'], $higher['price'], $higher['voice_mode'],
                $lower['name'], $lower['price'], $lower['voice_mode']
            );
        }
    }

    if ($errors !== []) {
        fwrite(STDERR, "\nPRICING IS NOT MONOTONIC — refusing to seed:\n");
        foreach ($errors as $e) {
            fwrite(STDERR, "  - {$e}\n");
        }
        fwrite(STDERR, "\nA dearer plan must never give less than a cheaper one.\n");
        exit(1);
    }
}

assertMonotonic($packages);
echo "Pricing monotonicity: OK (" . count($packages) . " packages checked)\n";

$upserted = 0;
foreach ($packages as $pkg) {
    $existing = Db::scalar('SELECT id FROM packages WHERE slug = :s', ['s' => $pkg['slug']]);

    if ($existing !== null) {
        $sets = implode(', ', array_map(static fn ($c) => "`{$c}` = :{$c}", array_keys($pkg)));
        Db::execute("UPDATE packages SET {$sets} WHERE id = " . (int) $existing, $pkg);
    } else {
        Db::insert('packages', $pkg);
    }
    $upserted++;
}
echo "Packages seeded: {$upserted}\n";

// Platform super admin (tenant_id NULL).
$adminEmail = Env::string('SEED_ADMIN_EMAIL', 'admin@chatcommerce.local');

if (Db::scalar('SELECT id FROM users WHERE email = :e', ['e' => $adminEmail]) === null) {
    $password = Env::stringOrNull('SEED_ADMIN_PASSWORD') ?? bin2hex(random_bytes(9));

    Db::insert('users', [
        'tenant_id'         => null,
        'name'              => 'Platform Admin',
        'email'             => $adminEmail,
        'password_hash'     => (new PasswordHasher())->hash($password),
        'role'              => Permissions::SUPER_ADMIN,
        'status'            => 'active',
        'locale'            => 'en',
        'email_verified_at' => date('Y-m-d H:i:s'),
    ]);

    // Written to a gitignored file rather than printed, so it does not end up
    // in a terminal scrollback or a CI log.
    $path = dirname(__DIR__) . '/storage/seed-admin.txt';
    file_put_contents($path, "email: {$adminEmail}\npassword: {$password}\n");
    chmod($path, 0600);

    echo "Super admin created. Credentials written to storage/seed-admin.txt\n";
} else {
    echo "Super admin already exists.\n";
}

// ---- AI providers, models, routing profiles -------------------------------
$aiSeeder = require dirname(__DIR__) . '/database/seeds/ai.php';
$ai = $aiSeeder();
printf(
    "AI seeded: %d providers, %d models, %d profiles\n",
    $ai['providers'], $ai['models'], $ai['profiles']
);
if ($ai['unverified'] > 0) {
    printf(
        "  WARNING: %d model(s) have UNVERIFIED pricing and are inactive.\n"
        . "  Set their real rates in the admin panel before enabling them —\n"
        . "  an unpriced model silently corrupts margin reports and credit charges.\n",
        $ai['unverified']
    );
}

// ---- system prompt library ------------------------------------------------
$tplSeeder = require dirname(__DIR__) . '/database/seeds/prompt_templates.php';
$tpl = $tplSeeder();
printf(
    "Prompt templates: %d total (%d new, %d updated)\n",
    $tpl['total'], $tpl['inserted'], $tpl['updated']
);

echo "Seed complete.\n";
