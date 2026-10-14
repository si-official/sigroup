<?php
declare(strict_types=1);

namespace App\Core;

use RuntimeException;
use SensitiveParameter;

/**
 * AES-256-GCM for third-party credentials at rest: Facebook page access
 * tokens, WhatsApp tokens, courier API keys, tenant-supplied AI keys.
 *
 * Envelope format (base64 of):  v1 | iv(12) | tag(16) | ciphertext
 * The version byte is what makes key rotation and algorithm migration
 * possible later without a flag day.
 *
 * GCM is authenticated: a tampered ciphertext fails to decrypt rather than
 * returning garbage that some integration then sends to Meta.
 */
final class Crypto
{
    private const CIPHER     = 'aes-256-gcm';
    private const VERSION    = "\x01";
    private const IV_LENGTH  = 12;
    private const TAG_LENGTH = 16;

    private static ?string $key = null;
    private static ?string $previousKey = null;

    private static function key(): string
    {
        if (self::$key !== null) {
            return self::$key;
        }
        $raw = base64_decode(Env::string('CRYPTO_KEY'), true);
        if ($raw === false || strlen($raw) !== 32) {
            throw new RuntimeException(
                'CRYPTO_KEY must be 32 raw bytes, base64 encoded. Generate: openssl rand -base64 32'
            );
        }
        return self::$key = $raw;
    }

    /** Set during rotation so existing rows still decrypt while being re-encrypted. */
    private static function previousKey(): ?string
    {
        if (self::$previousKey !== null) {
            return self::$previousKey;
        }
        $b64 = Env::stringOrNull('CRYPTO_KEY_PREVIOUS');
        if ($b64 === null) {
            return null;
        }
        $raw = base64_decode($b64, true);
        if ($raw === false || strlen($raw) !== 32) {
            throw new RuntimeException('CRYPTO_KEY_PREVIOUS is set but malformed.');
        }
        return self::$previousKey = $raw;
    }

    /**
     * @param string $aad Additional authenticated data. Pass a stable context
     *                    string (e.g. "channel:{$id}:page_token") to bind the
     *                    ciphertext to its row — a blob copied from one row to
     *                    another then fails to decrypt.
     */
    public static function encrypt(#[SensitiveParameter] string $plaintext, string $aad = ''): string
    {
        $iv  = random_bytes(self::IV_LENGTH);
        $tag = '';

        $ciphertext = openssl_encrypt(
            $plaintext,
            self::CIPHER,
            self::key(),
            OPENSSL_RAW_DATA,
            $iv,
            $tag,
            $aad,
            self::TAG_LENGTH
        );

        if ($ciphertext === false) {
            throw new RuntimeException('Encryption failed.');
        }

        return base64_encode(self::VERSION . $iv . $tag . $ciphertext);
    }

    /** Returns null when the payload is absent, malformed, or fails authentication. */
    public static function decrypt(?string $payload, string $aad = ''): ?string
    {
        if ($payload === null || $payload === '') {
            return null;
        }

        $raw = base64_decode($payload, true);
        if ($raw === false || strlen($raw) < 1 + self::IV_LENGTH + self::TAG_LENGTH) {
            Logger::warning('crypto.malformed_payload');
            return null;
        }

        $version = $raw[0];
        if ($version !== self::VERSION) {
            Logger::warning('crypto.unknown_version', ['version' => bin2hex($version)]);
            return null;
        }

        $iv         = substr($raw, 1, self::IV_LENGTH);
        $tag        = substr($raw, 1 + self::IV_LENGTH, self::TAG_LENGTH);
        $ciphertext = substr($raw, 1 + self::IV_LENGTH + self::TAG_LENGTH);

        foreach (array_filter([self::key(), self::previousKey()]) as $key) {
            $plain = openssl_decrypt(
                $ciphertext,
                self::CIPHER,
                $key,
                OPENSSL_RAW_DATA,
                $iv,
                $tag,
                $aad
            );
            if ($plain !== false) {
                return $plain;
            }
        }

        // Authentication failure: wrong key, tampering, or wrong AAD.
        Logger::error('crypto.decrypt_failed', ['aad' => $aad]);
        return null;
    }

    /**
     * Encrypt an array (credential bundles: {page_access_token, app_secret, ...}).
     * @param array<string,mixed> $data
     */
    public static function encryptArray(#[SensitiveParameter] array $data, string $aad = ''): string
    {
        return self::encrypt(json_encode($data, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE), $aad);
    }

    /** @return array<string,mixed>|null */
    public static function decryptArray(?string $payload, string $aad = ''): ?array
    {
        $json = self::decrypt($payload, $aad);
        if ($json === null) {
            return null;
        }
        $decoded = json_decode($json, true);
        return is_array($decoded) ? $decoded : null;
    }

    /** Lookup hash for refresh tokens / API tokens. Deterministic, not reversible. */
    public static function hashToken(#[SensitiveParameter] string $token): string
    {
        return hash_hmac('sha256', $token, self::key());
    }

    public static function randomToken(int $bytes = 32): string
    {
        return rtrim(strtr(base64_encode(random_bytes($bytes)), '+/', '-_'), '=');
    }

    /** Masked display form: "sk-ant...4f2a". Never return a full key to a client. */
    public static function hint(#[SensitiveParameter] string $secret): string
    {
        $len = strlen($secret);
        if ($len <= 8) {
            return str_repeat('*', $len);
        }
        return substr($secret, 0, 6) . '...' . substr($secret, -4);
    }

    public static function equals(string $known, string $given): bool
    {
        return hash_equals($known, $given);
    }
}
