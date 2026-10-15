<?php
declare(strict_types=1);

/**
 * Auth mechanics: hashing, token rotation, replay detection, throttling,
 * password reset, and the limits resolution order.
 *
 *   php tests/auth_flow.php     (needs the API running for the HTTP section)
 */

require_once dirname(__DIR__) . '/vendor/autoload.php';

use App\Core\Bootstrap;
use App\Core\Db;
use App\Core\UnauthorizedException;
use App\Services\AuthService;
use App\Services\LimitsResolver;
use App\Services\PasswordHasher;
use App\Services\TokenService;
use App\Support\Permissions;

Bootstrap::boot(dirname(__DIR__));

$pass = 0; $fail = 0;
function check(string $l, bool $ok, string $d = ''): void {
    global $pass, $fail;
    if ($ok) { $pass++; echo "  ok    {$l}\n"; }
    else     { $fail++; echo "  FAIL  {$l}" . ($d !== '' ? " — {$d}" : '') . "\n"; }
}

$suffix = bin2hex(random_bytes(4));

echo "\n== Password hashing (algorithm: " . PasswordHasher::algorithm() . ") ==\n";
$hasher = new PasswordHasher();

$h = $hasher->hash('CorrectHorse9');
check('hash is not the plaintext', $h !== 'CorrectHorse9' && strlen($h) > 20);
check('correct password verifies', $hasher->verify('CorrectHorse9', $h)['valid']);
check('wrong password does not', !$hasher->verify('CorrectHorse8', $h)['valid']);
check('two hashes of one password differ (salted)', $hasher->hash('same') !== $hasher->hash('same'));

// The bcrypt truncation case. A long Bangla passphrase exceeds 72 BYTES, so
// without pre-hashing these two distinct passwords would share a prefix and
// both unlock the account.
$bangla1 = 'আমারব্যবসারপাসওয়ার্ডটিখুবইলম্বাএবংনিরাপদএকটিবাক্য';
$bangla2 = $bangla1 . 'ভিন্ন';
check('long Bangla password exceeds bcrypt 72-byte limit', strlen($bangla1) > 72, strlen($bangla1) . ' bytes');

$hb = $hasher->hash($bangla1);
check('long Bangla password verifies', $hasher->verify($bangla1, $hb)['valid']);
check('a LONGER password sharing its prefix is REJECTED (no truncation)',
      !$hasher->verify($bangla2, $hb)['valid']);
check('a truncated prefix is rejected', !$hasher->verify(substr($bangla1, 0, 72), $hb)['valid']);

echo "\n== Timing equalisation ==\n";
// Wall-clock timing is noisy on a shared dev box, so take the median of
// several runs and assert the same ORDER of magnitude. The property that
// matters is that fakeVerify() is not ~free — if it were, the difference
// between "no such user" and "wrong password" would be externally observable.
$times = ['real' => [], 'fake' => []];
for ($i = 0; $i < 7; $i++) {
    $t0 = microtime(true); $hasher->verify('whatever', $h); $times['real'][] = microtime(true) - $t0;
    $t0 = microtime(true); $hasher->fakeVerify();           $times['fake'][] = microtime(true) - $t0;
}
sort($times['real']);
sort($times['fake']);
$real = $times['real'][3];
$fake = $times['fake'][3];
$ratio = $fake > 0 ? $real / $fake : 999;
check('fakeVerify() costs the same order as a real verify',
      $ratio > 0.1 && $ratio < 10.0, sprintf('median real/fake = %.2f', $ratio));
check('fakeVerify() is not effectively free',
      $fake > 0.0005, sprintf('%.4fs', $fake));

echo "\n== Registration provisioning (one transaction) ==\n";
$auth = new AuthService();
$email = "flow-{$suffix}@example.test";
$reg = $auth->register('টেস্ট শপ', 'Owner', $email, 'CorrectHorse9', '01712345678', '127.0.0.1');
$tenantId = (int) $reg['tenant']['id'];
$userId   = (int) $reg['user']['id'];

check('owner role assigned', $reg['user']['role'] === Permissions::OWNER);
check('permissions returned for the panel', in_array('billing.view', $reg['user']['permissions'], true));
check('tenant slug generated from a Bangla name',
      (string) Db::scalar('SELECT slug FROM tenants WHERE id = :t', ['t' => $tenantId]) !== '');
check('owner_user_id back-linked',
      (int) Db::scalar('SELECT owner_user_id FROM tenants WHERE id = :t', ['t' => $tenantId]) === $userId);

echo "\n== Registration rolls back entirely on failure ==\n";
$before = (int) Db::scalar('SELECT COUNT(*) FROM tenants');
try {
    // Duplicate email: must fail BEFORE creating any tenant row.
    $auth->register('Dup Shop', 'Dup', $email, 'CorrectHorse9');
    check('duplicate email is rejected', false);
} catch (\App\Core\ApiException $e) {
    check('duplicate email is rejected', $e->errorCode === 'EMAIL_TAKEN');
}
check('no orphan tenant was created', (int) Db::scalar('SELECT COUNT(*) FROM tenants') === $before);

echo "\n== Login ==\n";
$login = $auth->login($email, 'CorrectHorse9', '127.0.0.1', 'phpunit');
check('login returns tokens', ($login['tokens']['access_token'] ?? '') !== '');
check('last_login_at recorded',
      Db::scalar('SELECT last_login_at FROM users WHERE id = :u', ['u' => $userId]) !== null);

try {
    $auth->login($email, 'WrongPassword1', '127.0.0.2');
    check('wrong password rejected', false);
} catch (UnauthorizedException $e) {
    check('wrong password rejected', true);
    check('error code is generic (no account enumeration)', $e->errorCode === 'INVALID_CREDENTIALS');
}

try {
    $auth->login("nosuchuser-{$suffix}@example.test", 'Whatever123', '127.0.0.3');
    check('unknown email rejected', false);
} catch (UnauthorizedException $e) {
    // Identical code AND message to a wrong password: the response must not
    // reveal whether the address is registered.
    check('unknown email gives the IDENTICAL error', $e->errorCode === 'INVALID_CREDENTIALS');
    check('and the identical message', $e->getMessage() === 'Email or password is incorrect.');
}

echo "\n== Login throttle ==\n";
$throttleEmail = "throttle-{$suffix}@example.test";
$auth->register('Throttle Shop', 'T', $throttleEmail, 'CorrectHorse9');

$locked = false;
for ($i = 0; $i < 7; $i++) {
    try {
        $auth->login($throttleEmail, 'WrongPass123', '10.0.0.99');
    } catch (\App\Core\RateLimitException $e) {
        $locked = true;
        check("lockout engaged after {$i} failures", $i >= 5, "locked at attempt {$i}");
        check('lockout reports a retry_after', ($e->details['retry_after'] ?? 0) > 0);
        break;
    } catch (UnauthorizedException) {
        // expected for the first failures
    }
}
check('repeated failures eventually lock the account', $locked);

// Even the CORRECT password must be refused while locked.
try {
    $auth->login($throttleEmail, 'CorrectHorse9', '10.0.0.99');
    check('correct password is also refused while locked', false);
} catch (\App\Core\RateLimitException) {
    check('correct password is also refused while locked', true);
} catch (UnauthorizedException) {
    check('correct password is also refused while locked', false, 'got auth error, not rate limit');
}

echo "\n== Refresh rotation ==\n";
$tokens = new TokenService();
$pair1  = $login['tokens'];

$pair2 = $tokens->rotate($pair1['refresh_token'], '127.0.0.1');
check('rotation issues a new refresh token', $pair2['refresh_token'] !== $pair1['refresh_token']);
check('rotation issues a new access token', ($pair2['access_token'] ?? '') !== '');
check('the old token is marked rotated',
      Db::scalar('SELECT rotated_at FROM refresh_tokens WHERE token_hash = :h',
                 ['h' => \App\Core\Crypto::hashToken($pair1['refresh_token'])]) !== null);

$familyId = (string) Db::scalar(
    'SELECT family_id FROM refresh_tokens WHERE token_hash = :h',
    ['h' => \App\Core\Crypto::hashToken($pair2['refresh_token'])]
);
check('the successor stays in the same family',
      $familyId === (string) Db::scalar('SELECT family_id FROM refresh_tokens WHERE token_hash = :h',
                                        ['h' => \App\Core\Crypto::hashToken($pair1['refresh_token'])]));

echo "\n== Replay detection burns the family ==\n";
// Present the ALREADY-ROTATED token again — the signature of a stolen token.
try {
    $tokens->rotate($pair1['refresh_token'], '66.66.66.66');
    check('reusing a rotated token is rejected', false);
} catch (UnauthorizedException $e) {
    check('reusing a rotated token is rejected', true);
    check('with REFRESH_REUSED', $e->errorCode === 'REFRESH_REUSED');
}

$liveInFamily = (int) Db::scalar(
    'SELECT COUNT(*) FROM refresh_tokens WHERE family_id = :f AND revoked_at IS NULL',
    ['f' => $familyId]
);
check('the ENTIRE family is revoked, not just the replayed token', $liveInFamily === 0, "got {$liveInFamily}");

// The still-valid successor must now also be dead.
try {
    $tokens->rotate($pair2['refresh_token'], '127.0.0.1');
    check('the legitimate successor is dead too', false);
} catch (UnauthorizedException) {
    check('the legitimate successor is dead too', true);
}

check('the reuse was logged as a security event',
      (int) Db::scalar("SELECT COUNT(*) FROM audit_logs WHERE action = 'auth.refresh_reuse_detected'") > 0);

echo "\n== Password reset ==\n";
$resetEmail = "reset-{$suffix}@example.test";
$r = $auth->register('Reset Shop', 'R', $resetEmail, 'OldPassword1');
$resetUserId = (int) $r['user']['id'];

$token = $auth->requestPasswordReset($resetEmail, '127.0.0.1');
check('a reset token is issued for a real account', is_string($token) && strlen((string) $token) > 20);
check('no token for an unknown address',
      $auth->requestPasswordReset("ghost-{$suffix}@example.test") === null);

$auth->resetPassword((string) $token, 'BrandNewPass9');
check('the new password works', $auth->login($resetEmail, 'BrandNewPass9', '127.0.0.1')['user']['id'] === $resetUserId);

try {
    $auth->login($resetEmail, 'OldPassword1', '127.0.0.1');
    check('the old password no longer works', false);
} catch (UnauthorizedException) {
    check('the old password no longer works', true);
}

try {
    $auth->resetPassword((string) $token, 'AnotherPass9');
    check('a reset token is single-use', false);
} catch (\App\Core\ApiException $e) {
    check('a reset token is single-use', $e->errorCode === 'RESET_TOKEN_INVALID');
}

check('every session was revoked by the reset',
      (int) Db::scalar(
          "SELECT COUNT(*) FROM refresh_tokens
            WHERE user_id = :u AND revoked_reason = 'password_reset'",
          ['u' => $resetUserId]
      ) > 0);

echo "\n== Limits resolution order ==\n";
$resolver = new LimitsResolver();

$snapshotLimits = $resolver->resolve(
    ['status' => 'active', 'package_id' => 1, 'limits_snapshot' => json_encode(['msg_limit' => 777, 'wa_enabled' => true])],
    ['billing_mode' => 'subscription']
);
check('1. snapshot wins over the package row', ($snapshotLimits['msg_limit'] ?? 0) === 777);
check('   and is labelled as such', $snapshotLimits['_source'] === 'snapshot');

$pkg = Db::selectOne("SELECT id FROM packages WHERE slug = 'basic'");
$packageLimits = $resolver->resolve(
    ['status' => 'active', 'package_id' => $pkg['id'], 'limits_snapshot' => null],
    ['billing_mode' => 'subscription']
);
check('2. missing snapshot falls back to the package', $packageLimits['_source'] === 'package');
check('   with that package\'s real numbers', ($packageLimits['msg_limit'] ?? 0) === 1000);

$creditLimits = $resolver->resolve(
    ['status' => 'active', 'package_id' => $pkg['id'], 'limits_snapshot' => json_encode(['msg_limit' => 5])],
    ['billing_mode' => 'credit', 'lifetime_deposited' => '2500.00', 'balance' => '300.00']
);
check('3. credit mode overrides the snapshot entirely', $creditLimits['_source'] === 'credit');
check('   messages become unlimited (money is the cap)', $creditLimits['msg_limit'] === null);
check('   deposits unlock WhatsApp at 500', $creditLimits['wa_enabled'] === true);
check('   deposits unlock the widget at 2000', $creditLimits['widget_enabled'] === true);
check('   but not API access below 5000', $creditLimits['api_access_enabled'] === false);

$brokeCredit = $resolver->resolve(
    ['status' => 'active', 'package_id' => $pkg['id'], 'limits_snapshot' => null],
    ['billing_mode' => 'credit', 'lifetime_deposited' => '2500.00', 'balance' => '0.00']
);
check('   an empty wallet is read-only', $brokeCredit['read_only'] === true);

$expired = $resolver->resolve(['status' => 'expired'], ['billing_mode' => 'subscription']);
check('expired yields every channel off', $expired['fb_enabled'] === false && $expired['wa_enabled'] === false);
check('expired is read_only', $expired['read_only'] === true);

echo "\n== Permission matrix ==\n";
check('owner can touch billing', Permissions::allows(Permissions::OWNER, 'billing.purchase'));
check('manager cannot touch billing', !Permissions::allows(Permissions::MANAGER, 'billing.purchase'));
check('agent cannot touch billing', !Permissions::allows(Permissions::AGENT, 'billing.purchase'));
check('agent can read the inbox', Permissions::allows(Permissions::AGENT, 'inbox.view'));
check('agent can reply', Permissions::allows(Permissions::AGENT, 'inbox.reply'));
check('agent cannot edit the system prompt', !Permissions::allows(Permissions::AGENT, 'bot.edit_prompt'));
check('agent cannot connect a channel', !Permissions::allows(Permissions::AGENT, 'channel.connect'));
check('manager can edit the prompt', Permissions::allows(Permissions::MANAGER, 'bot.edit_prompt'));
check('manager cannot connect a channel (credentials)', !Permissions::allows(Permissions::MANAGER, 'channel.connect'));
check('an UNKNOWN action denies by default', !Permissions::allows(Permissions::OWNER, 'nonexistent.action'));
check('a tenant role cannot reach platform actions',
      !Permissions::allows(Permissions::OWNER, 'platform.tenant.suspend'));
check('super_admin can', Permissions::allows(Permissions::SUPER_ADMIN, 'platform.tenant.suspend'));
check('platform_support cannot suspend', !Permissions::allows(Permissions::PLATFORM_SUPPORT, 'platform.tenant.suspend'));
check('view actions are not write actions', !Permissions::isWriteAction('inbox.view'));
check('edit actions are write actions', Permissions::isWriteAction('product.edit'));

// cleanup
Db::execute("DELETE FROM tenants WHERE slug LIKE 'test%' OR name IN ('টেস্ট শপ','Throttle Shop','Reset Shop')");
Db::execute('DELETE FROM users WHERE email LIKE :e', ['e' => "%-{$suffix}@example.test"]);
Db::execute('DELETE FROM login_attempts');

echo "\n" . str_repeat('-', 56) . "\n";
printf("  %d passed, %d failed\n\n", $pass, $fail);
exit($fail === 0 ? 0 : 1);
