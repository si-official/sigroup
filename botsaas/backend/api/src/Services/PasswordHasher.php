<?php
declare(strict_types=1);

namespace App\Services;

use App\Core\Logger;
use RuntimeException;
use SensitiveParameter;

/**
 * Password hashing: Argon2id when the host supports it, bcrypt otherwise.
 *
 * WHY THIS IS NOT JUST `password_hash($p, PASSWORD_DEFAULT)`
 *
 * Argon2id is the right choice — memory-hard, no input length limit. But
 * PASSWORD_ARGON2ID only exists if PHP was built against libargon2, and plenty
 * of shared hosts ship without it. This dev box is one: password_algos()
 * returns only "2y". A hard dependency on Argon2id would mean registration
 * crashes on those hosts with "Undefined constant", which is how you discover
 * the problem from a customer rather than from a test.
 *
 * So bcrypt is the fallback — but bcrypt silently TRUNCATES AT 72 BYTES, and
 * that is a correctness bug in a Bangla product, not a theoretical one:
 *
 *     "আমার পাসওয়ার্ড অনেক বড়"   = 22 characters, 60 bytes
 *     a 30-character Bangla passphrase ≈ 81 bytes -> truncated
 *
 * Users would type a long passphrase and silently get a shorter one, and two
 * different passwords sharing a 72-byte prefix would both unlock the account.
 *
 * The fix is to pre-hash: base64(sha384(password)) is always 64 ASCII
 * characters, so bcrypt sees a fixed-length input no matter how long or how
 * multi-byte the real password is. (Same approach Dropbox documented.) SHA-384
 * over SHA-256 so the base64 lands at 64 chars — comfortably under 72 with no
 * null-byte concerns.
 *
 * The stored hash prefix ($argon2id$ vs $2y$) tells verify() which path the
 * hash came from, so both formats keep working across a host upgrade, and
 * needs_rehash promotes bcrypt hashes to Argon2id once libargon2 appears.
 */
final class PasswordHasher
{
    private const ARGON_OPTIONS = [
        'memory_cost' => 65536, // 64 MiB — meaningful GPU resistance, still cheap hosting
        'time_cost'   => 3,
        'threads'     => 1,     // shared hosting rarely gives usable parallelism
    ];

    private const BCRYPT_OPTIONS = ['cost' => 12];

    /** Marks a bcrypt hash whose input was pre-hashed. */
    private const PREHASH_PREFIX = '$2y$';

    public function hash(#[SensitiveParameter] string $plain): string
    {
        if (self::argon2idAvailable()) {
            $hash = password_hash($plain, PASSWORD_ARGON2ID, self::ARGON_OPTIONS);
        } else {
            $hash = password_hash(self::prehash($plain), PASSWORD_BCRYPT, self::BCRYPT_OPTIONS);
        }

        if (!is_string($hash) || $hash === '') {
            throw new RuntimeException('Password hashing failed.');
        }

        return $hash;
    }

    /**
     * @return array{valid:bool,needs_rehash:bool}
     */
    public function verify(#[SensitiveParameter] string $plain, string $hash): array
    {
        if ($hash === '') {
            return ['valid' => false, 'needs_rehash' => false];
        }

        $isBcrypt = str_starts_with($hash, self::PREHASH_PREFIX);

        // Feed the same transformation the hash was created with.
        $candidate = $isBcrypt ? self::prehash($plain) : $plain;
        $valid     = password_verify($candidate, $hash);

        // Legacy safety net: a bcrypt hash created before pre-hashing existed
        // would have stored the raw password. Accept it, then flag for rehash
        // so it is upgraded on this login.
        if (!$valid && $isBcrypt && password_verify($plain, $hash)) {
            return ['valid' => true, 'needs_rehash' => true];
        }

        if (!$valid) {
            return ['valid' => false, 'needs_rehash' => false];
        }

        return ['valid' => true, 'needs_rehash' => $this->needsRehash($hash)];
    }

    private function needsRehash(string $hash): bool
    {
        if (self::argon2idAvailable()) {
            // On an Argon2id-capable host, any bcrypt hash should be promoted.
            if (str_starts_with($hash, self::PREHASH_PREFIX)) {
                return true;
            }
            return password_needs_rehash($hash, PASSWORD_ARGON2ID, self::ARGON_OPTIONS);
        }

        return password_needs_rehash($hash, PASSWORD_BCRYPT, self::BCRYPT_OPTIONS);
    }

    /**
     * Fixed-length ASCII digest of the password.
     *
     * base64(sha384(x)) is exactly 64 characters, so bcrypt's 72-byte ceiling
     * can never be reached and no Bangla password is ever truncated.
     */
    private static function prehash(#[SensitiveParameter] string $plain): string
    {
        return base64_encode(hash('sha384', $plain, true));
    }

    /**
     * Burn roughly the same CPU as a real verify when no user exists.
     *
     * Without this, "no such email" returns in ~2ms while a real email with a
     * wrong password takes ~80ms — and that difference is an account
     * enumeration oracle no matter how generic the error message is.
     */
    public function fakeVerify(): void
    {
        static $dummy = null;

        if ($dummy === null) {
            $dummy = self::argon2idAvailable()
                ? password_hash('timing-equalisation-dummy', PASSWORD_ARGON2ID, self::ARGON_OPTIONS)
                : password_hash(self::prehash('timing-equalisation-dummy'), PASSWORD_BCRYPT, self::BCRYPT_OPTIONS);
        }

        $candidate = self::argon2idAvailable()
            ? 'wrong-password-on-purpose'
            : self::prehash('wrong-password-on-purpose');

        password_verify($candidate, (string) $dummy);
    }

    public static function argon2idAvailable(): bool
    {
        static $available = null;

        if ($available === null) {
            $available = defined('PASSWORD_ARGON2ID') && in_array('argon2id', password_algos(), true);

            if (!$available) {
                // Loud once per process: the host is on the fallback path, and
                // whoever runs this should know before a security review asks.
                Logger::warning('password.argon2id_unavailable', [
                    'algos'    => password_algos(),
                    'fallback' => 'bcrypt(cost=12) over base64(sha384(password))',
                ]);
            }
        }

        return $available;
    }

    /** For the health endpoint and the admin panel's environment check. */
    public static function algorithm(): string
    {
        return self::argon2idAvailable() ? 'argon2id' : 'bcrypt+sha384';
    }
}
