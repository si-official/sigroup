<?php
declare(strict_types=1);

namespace App\Services;

use App\Core\Db;
use App\Core\Logger;
use App\Core\RateLimitException;

/**
 * Login throttling: 5 failures per key per 15 minutes, then exponential lockout.
 *
 * Throttled on TWO independent keys:
 *   email  — stops credential stuffing against one account
 *   ip     — stops one host spraying many accounts
 *
 * Keeping them separate matters: if only the email were throttled, an attacker
 * could lock a real customer out of their own account at will by failing five
 * logins against their address. With both, the attacker's IP trips first.
 */
final class LoginThrottle
{
    private const MAX_FAILURES   = 5;
    private const WINDOW_SECONDS = 900;      // 15 minutes
    private const MAX_LOCK       = 86400;    // cap backoff at 24h

    /** @throws RateLimitException */
    public function assertNotLocked(string $email, string $ip): void
    {
        foreach ($this->keysFor($email, $ip) as $key) {
            $row = Db::selectOne(
                'SELECT failures, locked_until,
                        TIMESTAMPDIFF(SECOND, NOW(), locked_until) AS retry_after
                   FROM login_attempts
                  WHERE attempt_key = :k',
                ['k' => $key]
            );

            if ($row === null || $row['locked_until'] === null) {
                continue;
            }

            $retryAfter = (int) $row['retry_after'];
            if ($retryAfter > 0) {
                Logger::warning('auth.locked_out', ['key_type' => explode(':', $key)[0], 'retry_after' => $retryAfter]);
                throw new RateLimitException(
                    $retryAfter,
                    'Too many failed sign-in attempts. Please try again later.'
                );
            }
        }
    }

    public function recordFailure(string $email, string $ip): void
    {
        foreach ($this->keysFor($email, $ip) as $key) {
            // Reset the counter if the previous window has fully elapsed,
            // otherwise increment — decided inside the statement so two
            // simultaneous failures cannot both reset it.
            Db::execute(
                'INSERT INTO login_attempts (attempt_key, failures, first_fail_at, last_fail_at)
                 VALUES (:k, 1, NOW(), NOW())
                 ON DUPLICATE KEY UPDATE
                    failures      = IF(last_fail_at < DATE_SUB(NOW(), INTERVAL :w SECOND), 1, failures + 1),
                    first_fail_at = IF(last_fail_at < DATE_SUB(NOW(), INTERVAL :w2 SECOND), NOW(), first_fail_at),
                    last_fail_at  = NOW()',
                ['k' => $key, 'w' => self::WINDOW_SECONDS, 'w2' => self::WINDOW_SECONDS]
            );

            $failures = (int) Db::scalar('SELECT failures FROM login_attempts WHERE attempt_key = :k', ['k' => $key]);

            if ($failures >= self::MAX_FAILURES) {
                // 5th failure -> 15 min, 6th -> 30, 7th -> 60 ... capped at 24h.
                $lockSeconds = min(
                    self::WINDOW_SECONDS * (2 ** ($failures - self::MAX_FAILURES)),
                    self::MAX_LOCK
                );

                Db::execute(
                    'UPDATE login_attempts
                        SET locked_until = DATE_ADD(NOW(), INTERVAL :s SECOND)
                      WHERE attempt_key = :k',
                    ['s' => $lockSeconds, 'k' => $key]
                );

                Logger::warning('auth.lockout_applied', [
                    'key_type' => explode(':', $key)[0],
                    'failures' => $failures,
                    'lock_sec' => $lockSeconds,
                ]);
            }
        }
    }

    /** Successful login clears the counters for that identity. */
    public function clear(string $email, string $ip): void
    {
        Db::execute(
            'DELETE FROM login_attempts WHERE attempt_key IN (:e, :i)',
            ['e' => $this->emailKey($email), 'i' => $this->ipKey($ip)]
        );
    }

    /** @return string[] */
    private function keysFor(string $email, string $ip): array
    {
        return [$this->emailKey($email), $this->ipKey($ip)];
    }

    private function emailKey(string $email): string
    {
        // Hashed so the throttle table is not itself a list of customer emails.
        return 'email:' . substr(hash('sha256', strtolower(trim($email))), 0, 40);
    }

    private function ipKey(string $ip): string
    {
        return 'ip:' . substr(hash('sha256', $ip), 0, 40);
    }

    /** Called by the retention cron. */
    public static function prune(): int
    {
        return Db::execute(
            'DELETE FROM login_attempts
              WHERE (locked_until IS NULL OR locked_until < NOW())
                AND last_fail_at < DATE_SUB(NOW(), INTERVAL 7 DAY)
              LIMIT 5000'
        );
    }
}
