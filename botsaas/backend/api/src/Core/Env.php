<?php
declare(strict_types=1);

namespace App\Core;

use Dotenv\Dotenv;
use RuntimeException;

/**
 * Typed .env access.
 *
 * Design rule: a missing REQUIRED key is a boot failure, not a runtime
 * surprise three weeks later when a webhook finally hits that code path.
 * Call Env::assertRequired() once at boot so a misconfigured deploy dies
 * immediately and loudly instead of half-working.
 */
final class Env
{
    private static bool $loaded = false;

    /** Keys without which the app cannot function at all. */
    private const REQUIRED = [
        'APP_URL',
        'DB_HOST', 'DB_DATABASE', 'DB_USERNAME',
        'JWT_SECRET',
        'CRYPTO_KEY',
        'MIGRATE_SECRET',
    ];

    public static function load(string $basePath): void
    {
        if (self::$loaded) {
            return;
        }
        if (is_file($basePath . '/.env')) {
            Dotenv::createImmutable($basePath)->load();
        }
        self::$loaded = true;
    }

    public static function assertRequired(): void
    {
        $missing = [];
        foreach (self::REQUIRED as $key) {
            if (self::raw($key) === null || self::raw($key) === '') {
                $missing[] = $key;
            }
        }
        // Empty DB_PASSWORD is fine locally, never in production.
        if (self::string('APP_ENV') === 'production' && self::raw('DB_PASSWORD') === '') {
            $missing[] = 'DB_PASSWORD';
        }
        if ($missing !== []) {
            throw new RuntimeException(
                'Missing required environment keys: ' . implode(', ', $missing)
                . '. Copy .env.example to .env and fill them in.'
            );
        }
    }

    private static function raw(string $key): ?string
    {
        $v = $_ENV[$key] ?? $_SERVER[$key] ?? getenv($key);
        if ($v === false || $v === null) {
            return null;
        }
        return (string) $v;
    }

    public static function string(string $key, ?string $default = null): string
    {
        $v = self::raw($key);
        if ($v === null || $v === '') {
            if ($default === null) {
                throw new RuntimeException("Env key {$key} is not set and has no default.");
            }
            return $default;
        }
        return $v;
    }

    public static function stringOrNull(string $key): ?string
    {
        $v = self::raw($key);
        return ($v === null || $v === '') ? null : $v;
    }

    public static function int(string $key, ?int $default = null): int
    {
        $v = self::raw($key);
        if ($v === null || $v === '') {
            if ($default === null) {
                throw new RuntimeException("Env key {$key} is not set and has no default.");
            }
            return $default;
        }
        if (!is_numeric($v)) {
            throw new RuntimeException("Env key {$key} must be numeric, got '{$v}'.");
        }
        return (int) $v;
    }

    public static function float(string $key, ?float $default = null): float
    {
        $v = self::raw($key);
        if ($v === null || $v === '') {
            if ($default === null) {
                throw new RuntimeException("Env key {$key} is not set and has no default.");
            }
            return $default;
        }
        return (float) $v;
    }

    public static function bool(string $key, bool $default = false): bool
    {
        $v = self::raw($key);
        if ($v === null || $v === '') {
            return $default;
        }
        return in_array(strtolower($v), ['1', 'true', 'yes', 'on'], true);
    }

    /** CSV env value -> trimmed non-empty list. */
    public static function list(string $key, array $default = []): array
    {
        $v = self::raw($key);
        if ($v === null || trim($v) === '') {
            return $default;
        }
        return array_values(array_filter(array_map('trim', explode(',', $v)), fn ($s) => $s !== ''));
    }

    public static function isProduction(): bool
    {
        return self::string('APP_ENV', 'local') === 'production';
    }

    public static function isDebug(): bool
    {
        // Debug is force-disabled in production regardless of what .env says.
        return !self::isProduction() && self::bool('APP_DEBUG', false);
    }
}
