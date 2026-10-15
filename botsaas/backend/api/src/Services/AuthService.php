<?php
declare(strict_types=1);

namespace App\Services;

use App\Core\ApiException;
use App\Core\Crypto;
use App\Core\Db;
use App\Core\Env;
use App\Core\Logger;
use App\Core\UnauthorizedException;
use App\Support\Permissions;
use SensitiveParameter;

/**
 * Registration, login, and credential recovery.
 *
 * Account-enumeration policy, applied consistently: login, forgot-password and
 * register must not reveal whether an email is registered. Login returns one
 * generic error; forgot-password always reports success; register is the one
 * unavoidable exception, since it genuinely cannot create a duplicate — so it
 * is throttled instead.
 */
final class AuthService
{
    private PasswordHasher $hasher;
    private TokenService $tokens;
    private LoginThrottle $throttle;
    private LimitsResolver $limits;

    // Defaults assigned in the body rather than as promoted-property
    // initialisers: `new` in initialisers is PHP 8.1+, and the source is kept
    // 8.0-parsable so `php -l` stays a real check on the dev box.
    public function __construct(
        ?PasswordHasher $hasher = null,
        ?TokenService $tokens = null,
        ?LoginThrottle $throttle = null,
        ?LimitsResolver $limits = null
    ) {
        $this->hasher   = $hasher ?? new PasswordHasher();
        $this->tokens   = $tokens ?? new TokenService();
        $this->throttle = $throttle ?? new LoginThrottle();
        $this->limits   = $limits ?? new LimitsResolver();
    }

    /**
     * Provision a whole tenant: tenant + owner + wallet + trial subscription +
     * default bot_config + bot_settings, in ONE transaction.
     *
     * All of it or none of it. A half-provisioned tenant — a user row with no
     * subscription, say — produces a customer who can log in and then hits an
     * error on every single page, with no way to fix it from the UI.
     *
     * @return array{user:array,tenant:array,tokens:array}
     */
    public function register(
        string $businessName,
        string $ownerName,
        string $email,
        #[SensitiveParameter] string $password,
        ?string $phone = null,
        ?string $ip = null,
        ?string $userAgent = null
    ): array {
        $email = strtolower(trim($email));

        if (Db::scalar('SELECT id FROM users WHERE email = :e', ['e' => $email]) !== null) {
            throw new ApiException('EMAIL_TAKEN', 'An account with this email already exists.', 409);
        }

        $trial = Db::selectOne(
            'SELECT * FROM packages WHERE is_trial = 1 AND is_active = 1 ORDER BY sort_order ASC LIMIT 1'
        );

        if ($trial === null) {
            Logger::critical('register.no_trial_package');
            throw new ApiException('NO_TRIAL_PACKAGE', 'Signup is temporarily unavailable.', 503);
        }

        $passwordHash = $this->hasher->hash($password);

        return Db::transaction(function () use ($businessName, $ownerName, $email, $passwordHash, $phone, $trial, $ip, $userAgent) {
            $tenantId = Db::insert('tenants', [
                'name'            => $businessName,
                'slug'            => $this->uniqueSlug($businessName),
                'phone'           => $phone,
                'timezone'        => Env::string('APP_TIMEZONE', 'Asia/Dhaka'),
                'currency'        => 'BDT',
                'status'          => 'active',
                'onboarding_step' => 0,
            ]);

            $userId = Db::insert('users', [
                'tenant_id'     => $tenantId,
                'name'          => $ownerName,
                'email'         => $email,
                'phone'         => $phone,
                'password_hash' => $passwordHash,
                'role'          => Permissions::OWNER,
                'status'        => 'active',
                'locale'        => 'bn',
            ]);

            Db::execute('UPDATE tenants SET owner_user_id = :u WHERE id = :t', ['u' => $userId, 't' => $tenantId]);

            Db::insert('wallets', [
                'tenant_id'    => $tenantId,
                'balance'      => 0,
                'billing_mode' => 'subscription',
            ]);

            $subscriptionId = Db::insert('subscriptions', [
                'tenant_id'       => $tenantId,
                'package_id'      => $trial['id'],
                'status'          => 'trialing',
                'price_paid'      => 0,
                'expires_at'      => date('Y-m-d H:i:s', time() + ((int) $trial['duration_days'] * 86400)),
                // Freeze what they were given, so editing the trial package
                // later does not retroactively change existing trials.
                'limits_snapshot' => json_encode($this->limits->snapshotFor($trial), JSON_UNESCAPED_UNICODE),
            ]);

            Db::insert('subscription_usage', [
                'tenant_id'       => $tenantId,
                'subscription_id' => $subscriptionId,
                'cycle_start'     => date('Y-m-d'),
                'cycle_end'       => date('Y-m-d', time() + ((int) $trial['duration_days'] * 86400)),
            ]);

            Db::insert('bot_configs', [
                'tenant_id'  => $tenantId,
                'channel_id' => null,
                'language'   => 'auto',
                'ai_enabled' => 1,
            ]);

            Db::insert('bot_settings', [
                'tenant_id'        => $tenantId,
                'channel_scope'    => 'all',
                'human_takeover'   => json_encode(['enabled' => true, 'pause_minutes' => 30]),
                'schedule'         => json_encode(['enabled' => false]),
                'keyword_filter'   => json_encode(['enabled' => false, 'blocked' => [], 'autoreply' => []]),
                'order_protection' => json_encode([
                    'enabled' => true, 'same_conv_min' => 10, 'same_phone_min' => 30,
                    'daily_limit' => 3, 'require_phone' => true, 'keep_ai_active' => true,
                ]),
                'delivery_pricing' => json_encode(['inside_dhaka' => 60, 'outside_dhaka' => 120]),
                'escalation'       => json_encode(['enabled' => true, 'triggers' => ['repeated_failure', 'human_requested']]),
            ]);

            $user = [
                'id' => $userId, 'tenant_id' => $tenantId, 'role' => Permissions::OWNER,
                'name' => $ownerName, 'email' => $email,
            ];

            $tokens = $this->tokens->issuePair($user, $userAgent, $ip);

            AuditLogger::recordAs($tenantId, $userId, 'user', 'tenant.registered', 'tenant', $tenantId, [
                'business_name' => $businessName, 'trial_package' => $trial['slug'], 'ip' => $ip,
            ]);

            Logger::info('tenant.registered', ['tenant_id' => $tenantId, 'user_id' => $userId]);

            return [
                'user'   => $user + ['permissions' => Permissions::forRole(Permissions::OWNER)],
                'tenant' => ['id' => $tenantId, 'name' => $businessName],
                'tokens' => $tokens,
            ];
        });
    }

    /** @return array{user:array,tokens:array} */
    public function login(
        string $email,
        #[SensitiveParameter] string $password,
        ?string $ip = null,
        ?string $userAgent = null
    ): array {
        $email = strtolower(trim($email));
        $ip ??= '0.0.0.0';

        $this->throttle->assertNotLocked($email, $ip);

        $user = Db::selectOne(
            'SELECT id, tenant_id, name, email, role, status, password_hash, email_verified_at
               FROM users WHERE email = :e',
            ['e' => $email]
        );

        // No such user: still burn comparable CPU, then fail identically to a
        // wrong password. Both the message AND the timing must match, or the
        // endpoint becomes an account-existence oracle.
        if ($user === null) {
            $this->hasher->fakeVerify();
            $this->throttle->recordFailure($email, $ip);
            throw new UnauthorizedException('Email or password is incorrect.', 'INVALID_CREDENTIALS');
        }

        $result = $this->hasher->verify($password, (string) $user['password_hash']);

        if (!$result['valid']) {
            $this->throttle->recordFailure($email, $ip);
            Logger::info('auth.login_failed', ['user_id' => (int) $user['id'], 'ip' => $ip]);
            throw new UnauthorizedException('Email or password is incorrect.', 'INVALID_CREDENTIALS');
        }

        // Disabled accounts get a DIFFERENT message, deliberately: the password
        // was correct, so nothing is leaked, and "your account is disabled" is
        // the only message that lets them act on it.
        if ($user['status'] !== 'active') {
            throw new UnauthorizedException(
                $user['status'] === 'invited'
                    ? 'Please accept your invitation before signing in.'
                    : 'This account has been disabled. Please contact support.',
                'ACCOUNT_INACTIVE'
            );
        }

        if ($result['needs_rehash']) {
            Db::execute(
                'UPDATE users SET password_hash = :h WHERE id = :id',
                ['h' => $this->hasher->hash($password), 'id' => $user['id']]
            );
        }

        $this->throttle->clear($email, $ip);

        Db::execute(
            'UPDATE users SET last_login_at = NOW(), last_login_ip = :ip WHERE id = :id',
            ['ip' => $ip, 'id' => $user['id']]
        );

        $tokens = $this->tokens->issuePair($user, $userAgent, $ip);

        AuditLogger::recordAs(
            $user['tenant_id'] === null ? null : (int) $user['tenant_id'],
            (int) $user['id'],
            'user',
            'auth.login',
            'user',
            (int) $user['id'],
            ['ip' => $ip]
        );

        return [
            'user' => [
                'id'          => (int) $user['id'],
                'tenant_id'   => $user['tenant_id'] === null ? null : (int) $user['tenant_id'],
                'name'        => $user['name'],
                'email'       => $user['email'],
                'role'        => $user['role'],
                'verified'    => $user['email_verified_at'] !== null,
                'permissions' => Permissions::forRole((string) $user['role']),
            ],
            'tokens' => $tokens,
        ];
    }

    public function logout(string $refreshToken): void
    {
        $this->tokens->revokeByToken($refreshToken, 'logout');
    }

    /**
     * Always reports success, whether or not the email exists — otherwise the
     * endpoint tells an attacker which addresses are registered.
     *
     * @return string|null the raw token, for the mailer. Never returned to the client.
     */
    public function requestPasswordReset(string $email, ?string $ip = null): ?string
    {
        $email  = strtolower(trim($email));
        $userId = Db::scalar('SELECT id FROM users WHERE email = :e AND status = "active"', ['e' => $email]);

        if ($userId === null) {
            Logger::info('auth.reset_requested_unknown_email', ['ip' => $ip]);
            return null;
        }

        // Invalidate outstanding tokens so only the newest link works.
        Db::execute('UPDATE password_resets SET used_at = NOW() WHERE email = :e AND used_at IS NULL', ['e' => $email]);

        $token = Crypto::randomToken(32);

        Db::insert('password_resets', [
            'email'      => $email,
            'token_hash' => Crypto::hashToken($token),
            'expires_at' => date('Y-m-d H:i:s', time() + 3600), // 1 hour
            'ip'         => $ip,
        ]);

        Logger::info('auth.reset_requested', ['user_id' => (int) $userId]);

        return $token;
    }

    public function resetPassword(string $token, #[SensitiveParameter] string $newPassword): void
    {
        $row = Db::selectOne(
            'SELECT id, email, expires_at, used_at FROM password_resets WHERE token_hash = :h',
            ['h' => Crypto::hashToken($token)]
        );

        if ($row === null || $row['used_at'] !== null || strtotime((string) $row['expires_at']) < time()) {
            throw new ApiException('RESET_TOKEN_INVALID', 'This reset link is invalid or has expired.', 400);
        }

        $user = Db::selectOne('SELECT id, tenant_id FROM users WHERE email = :e', ['e' => $row['email']]);
        if ($user === null) {
            throw new ApiException('RESET_TOKEN_INVALID', 'This reset link is invalid or has expired.', 400);
        }

        $hash = $this->hasher->hash($newPassword);

        Db::transaction(function () use ($hash, $user, $row) {
            Db::execute('UPDATE users SET password_hash = :h WHERE id = :id', ['h' => $hash, 'id' => $user['id']]);
            Db::execute('UPDATE password_resets SET used_at = NOW() WHERE id = :id', ['id' => $row['id']]);

            // A password reset is how someone recovers a COMPROMISED account,
            // so every existing session must die — otherwise the attacker's
            // refresh token outlives the reset.
            $this->tokens->revokeAllForUser((int) $user['id'], 'password_reset');
        });

        AuditLogger::recordAs(
            $user['tenant_id'] === null ? null : (int) $user['tenant_id'],
            (int) $user['id'],
            'user',
            'auth.password_reset',
            'user',
            (int) $user['id']
        );

        Logger::info('auth.password_reset', ['user_id' => (int) $user['id']]);
    }

    public function issueEmailVerification(int $userId): string
    {
        $token = Crypto::randomToken(32);

        Db::insert('email_verifications', [
            'user_id'    => $userId,
            'token_hash' => Crypto::hashToken($token),
            'expires_at' => date('Y-m-d H:i:s', time() + 86400 * 3),
        ]);

        return $token;
    }

    public function verifyEmail(string $token): void
    {
        $row = Db::selectOne(
            'SELECT id, user_id, expires_at, used_at FROM email_verifications WHERE token_hash = :h',
            ['h' => Crypto::hashToken($token)]
        );

        if ($row === null || $row['used_at'] !== null || strtotime((string) $row['expires_at']) < time()) {
            throw new ApiException('VERIFICATION_INVALID', 'This verification link is invalid or has expired.', 400);
        }

        Db::transaction(function () use ($row) {
            Db::execute('UPDATE users SET email_verified_at = NOW() WHERE id = :id', ['id' => $row['user_id']]);
            Db::execute('UPDATE email_verifications SET used_at = NOW() WHERE id = :id', ['id' => $row['id']]);
        });
    }

    private function uniqueSlug(string $name): string
    {
        // Bangla business names transliterate to nothing useful, so fall back
        // to a readable random slug rather than an empty string.
        $base = strtolower(trim(preg_replace('/[^a-zA-Z0-9]+/', '-', $name) ?? '', '-'));

        if ($base === '' || strlen($base) < 3) {
            $base = 'shop';
        }

        $base = substr($base, 0, 60);
        $slug = $base;
        $i    = 1;

        while (Db::scalar('SELECT id FROM tenants WHERE slug = :s', ['s' => $slug]) !== null) {
            $slug = $base . '-' . (++$i);
            if ($i > 50) {
                $slug = $base . '-' . bin2hex(random_bytes(4));
                break;
            }
        }

        return $slug;
    }
}
