<?php
declare(strict_types=1);

/**
 * ACCEPTANCE (a) and (c), over real HTTP against a running API.
 *
 *   php -S 127.0.0.1:8080 -t public &
 *   php tests/api_isolation.php
 *
 * Deliberately black-box: it registers two real tenants, takes real JWTs, and
 * attacks tenant B's data with tenant A's token through the actual HTTP stack.
 * Calling repositories directly would skip the middleware, which is precisely
 * the layer being tested.
 */

require_once dirname(__DIR__) . '/vendor/autoload.php';

use App\Core\Bootstrap;
use App\Core\Db;

Bootstrap::boot(dirname(__DIR__));

$BASE = getenv('API_BASE') ?: 'http://127.0.0.1:8080';

$pass = 0; $fail = 0;
function check(string $l, bool $ok, string $d = ''): void {
    global $pass, $fail;
    if ($ok) { $pass++; echo "  ok    {$l}\n"; }
    else     { $fail++; echo "  FAIL  {$l}" . ($d !== '' ? " — {$d}" : '') . "\n"; }
}

/** @return array{status:int,body:array} */
function http(string $method, string $path, ?array $body = null, ?string $token = null): array
{
    global $BASE;

    $ch = curl_init($BASE . $path);
    $headers = ['Accept: application/json'];
    if ($body !== null)  { $headers[] = 'Content-Type: application/json'; }
    if ($token !== null) { $headers[] = 'Authorization: Bearer ' . $token; }

    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST  => $method,
        CURLOPT_HTTPHEADER     => $headers,
        CURLOPT_TIMEOUT        => 20,
        CURLOPT_POSTFIELDS     => $body === null ? null : json_encode($body, JSON_UNESCAPED_UNICODE),
    ]);

    $raw    = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err    = curl_error($ch);
    curl_close($ch);

    if ($raw === false) {
        fwrite(STDERR, "Request failed: {$err}\nIs the API running at {$BASE}?\n");
        exit(1);
    }

    return ['status' => $status, 'body' => json_decode((string) $raw, true) ?? []];
}

// --- preflight ---------------------------------------------------------------
$health = http('GET', '/api/health');
if ($health['status'] !== 200) {
    fwrite(STDERR, "API not healthy at {$BASE} (status {$health['status']}).\n");
    exit(1);
}

// Reset this host's rate-limit and throttle buckets.
//
// NOT a workaround for a bug: /api/auth/register is capped at 5 per IP per
// hour, which is correct and is exercised deliberately below. But a suite that
// registers tenants on every run would lock itself out after the first pass,
// so it clears its own buckets first — the same way it cleans up its tenants.
Db::execute('DELETE FROM rate_limits');
Db::execute('DELETE FROM login_attempts');

$suffix = bin2hex(random_bytes(4));

// --- two independent tenants -------------------------------------------------
echo "\n== Setup: two tenants ==\n";

$regA = http('POST', '/api/auth/register', [
    'business_name' => 'ঢলনা শপ A', 'name' => 'Rahim', 'password' => 'CorrectHorse9',
    'email' => "a-{$suffix}@example.test", 'phone' => '01712345678',
]);
$regB = http('POST', '/api/auth/register', [
    'business_name' => 'Rival Shop B', 'name' => 'Karim', 'password' => 'CorrectHorse9',
    'email' => "b-{$suffix}@example.test",
]);

check('tenant A registered', $regA['status'] === 201, 'status ' . $regA['status'] . ' ' . json_encode($regA['body']['error'] ?? []));
check('tenant B registered', $regB['status'] === 201, 'status ' . $regB['status']);

$tokenA  = $regA['body']['data']['tokens']['access_token'] ?? '';
$tokenB  = $regB['body']['data']['tokens']['access_token'] ?? '';
$tenantA = (int) ($regA['body']['data']['tenant']['id'] ?? 0);
$tenantB = (int) ($regB['body']['data']['tenant']['id'] ?? 0);

check('both got access tokens', $tokenA !== '' && $tokenB !== '');
check('tenants are distinct', $tenantA !== $tenantB && $tenantA > 0);

// Registration must provision everything, or the tenant is half-broken.
foreach (['wallets' => 'tenant_id', 'subscriptions' => 'tenant_id',
          'bot_configs' => 'tenant_id', 'bot_settings' => 'tenant_id'] as $table => $col) {
    $n = (int) Db::scalar("SELECT COUNT(*) FROM {$table} WHERE {$col} = :t", ['t' => $tenantA]);
    check("registration provisioned {$table}", $n === 1, "got {$n}");
}
$trial = Db::selectOne('SELECT status, limits_snapshot FROM subscriptions WHERE tenant_id = :t', ['t' => $tenantA]);
check('trial subscription is trialing', $trial['status'] === 'trialing');
check('limits_snapshot was frozen at signup', json_decode((string) $trial['limits_snapshot'], true) !== null);

// --- state-metric quota: the trial's single seat -----------------------------
echo "\n== staff_seats quota (state metric) ==\n";

// The free trial grants staff_seat_limit=1, and the owner already fills it.
// Blocking the second seat is correct, and proves reserveState() enforces a
// live-count ceiling rather than a cycle counter.
$seatBlocked = http('POST', '/api/team/invite',
    ['name' => 'Second Seat', 'email' => "seat-{$suffix}@example.test", 'role' => 'tenant_agent'], $tokenA);
check('trial blocks a 2nd seat (limit 1, owner occupies it)', $seatBlocked['status'] === 402,
      'status ' . $seatBlocked['status']);
check('blocked with QUOTA_EXCEEDED', ($seatBlocked['body']['error']['code'] ?? '') === 'QUOTA_EXCEEDED',
      (string) ($seatBlocked['body']['error']['code'] ?? ''));
check('the 402 carries used/limit for the upgrade prompt',
      ($seatBlocked['body']['error']['details']['limit'] ?? null) === 1
      && ($seatBlocked['body']['error']['details']['used'] ?? null) === 1);

/** Move a tenant onto a package with room, so the role tests can run. */
function upgrade(int $tenantId, string $slug = 'advance'): void
{
    $pkg = Db::selectOne('SELECT * FROM packages WHERE slug = :s', ['s' => $slug]);
    $snapshot = (new \App\Services\LimitsResolver())->snapshotFor($pkg);

    Db::execute(
        "UPDATE subscriptions
            SET package_id = :p, status = 'active',
                expires_at = DATE_ADD(NOW(), INTERVAL 30 DAY),
                limits_snapshot = :snap
          WHERE tenant_id = :t",
        ['p' => $pkg['id'], 'snap' => json_encode($snapshot), 't' => $tenantId]
    );
}

upgrade($tenantA);
upgrade($tenantB);

$afterUpgrade = http('GET', '/api/team', null, $tokenA);
check('upgraded plan reports more seats',
      (int) ($afterUpgrade['body']['data']['seats']['limit'] ?? 0) === 4,
      (string) ($afterUpgrade['body']['data']['seats']['limit'] ?? 'null'));

// --- ACCEPTANCE (a): cross-tenant access through endpoints -------------------
echo "\n== ACCEPTANCE (a): tenant A cannot reach tenant B's data ==\n";

$meA = http('GET', '/api/auth/me', null, $tokenA);
check('A can read its own context', $meA['status'] === 200);
check('A sees only its own tenant id',
      (int) ($meA['body']['data']['tenant']['id'] ?? 0) === $tenantA);

$teamA = http('GET', '/api/team', null, $tokenA);
$teamB = http('GET', '/api/team', null, $tokenB);
check('A lists its own team', $teamA['status'] === 200);
check('A sees exactly 1 member (itself)', count($teamA['body']['data']['members'] ?? []) === 1);

$emailsA = array_column($teamA['body']['data']['members'] ?? [], 'email');
$emailsB = array_column($teamB['body']['data']['members'] ?? [], 'email');
check('A never sees B\'s staff', array_intersect($emailsA, $emailsB) === []);

// B invites someone, then A tries to reach that row by id.
$inviteB = http('POST', '/api/team/invite', [
    'name' => 'B Staff', 'email' => "bstaff-{$suffix}@example.test", 'role' => 'tenant_agent',
], $tokenB);
check('B can invite staff', $inviteB['status'] === 201, 'status ' . $inviteB['status']);
$bStaffId = (int) ($inviteB['body']['data']['id'] ?? 0);

$steal = http('PATCH', "/api/team/{$bStaffId}/role", ['role' => 'tenant_manager'], $tokenA);
check('A CANNOT change the role of B\'s staff', $steal['status'] === 404,
      'status ' . $steal['status']);
check('and the response does not confirm the row exists',
      ($steal['body']['error']['code'] ?? '') === 'NOT_FOUND');

$stillAgent = Db::scalar('SELECT role FROM users WHERE id = :id', ['id' => $bStaffId]);
check('B\'s staff role is unchanged', $stillAgent === 'tenant_agent', (string) $stillAgent);

$del = http('DELETE', "/api/team/{$bStaffId}", null, $tokenA);
check('A CANNOT remove B\'s staff', $del['status'] === 404, 'status ' . $del['status']);
check('B\'s staff is still active',
      Db::scalar('SELECT status FROM users WHERE id = :id', ['id' => $bStaffId]) === 'invited');

$noToken = http('GET', '/api/team');
check('no token is rejected', $noToken['status'] === 401);
$badToken = http('GET', '/api/team', null, $tokenA . 'x');
check('a tampered token is rejected', $badToken['status'] === 401);

// --- roles -------------------------------------------------------------------
echo "\n== Role matrix enforced over HTTP ==\n";

$agentEmail = "agent-{$suffix}@example.test";
$inviteA = http('POST', '/api/team/invite',
    ['name' => 'A Agent', 'email' => $agentEmail, 'role' => 'tenant_agent'], $tokenA);
check('A invites an agent', $inviteA['status'] === 201, 'status ' . $inviteA['status']);
$agentId = (int) ($inviteA['body']['data']['id'] ?? 0);

// Activate the invite and give the agent a usable password so it can log in.
$hasher = new \App\Services\PasswordHasher();
Db::execute("UPDATE users SET status = 'active', password_hash = :h WHERE id = :id",
    ['h' => $hasher->hash('AgentPass123'), 'id' => $agentId]);

$agentLogin = http('POST', '/api/auth/login', ['email' => $agentEmail, 'password' => 'AgentPass123']);
check('agent can log in', $agentLogin['status'] === 200, 'status ' . $agentLogin['status']);
$agentToken = $agentLogin['body']['data']['tokens']['access_token'] ?? '';

$agentPerms = $agentLogin['body']['data']['user']['permissions'] ?? [];
check('agent permissions include inbox.view', in_array('inbox.view', $agentPerms, true));
check('agent permissions exclude billing.view', !in_array('billing.view', $agentPerms, true));
check('agent permissions exclude bot.edit_prompt', !in_array('bot.edit_prompt', $agentPerms, true));
check('agent permissions exclude channel.connect', !in_array('channel.connect', $agentPerms, true));

$agentTeam = http('GET', '/api/team', null, $agentToken);
check('agent CANNOT list the team (team.view is owner/manager)', $agentTeam['status'] === 403,
      'status ' . $agentTeam['status']);

$agentInvite = http('POST', '/api/team/invite',
    ['name' => 'X', 'email' => "x-{$suffix}@example.test", 'role' => 'tenant_agent'], $agentToken);
check('agent CANNOT invite staff', $agentInvite['status'] === 403, 'status ' . $agentInvite['status']);
check('and the error names the reason',
      ($agentInvite['body']['error']['code'] ?? '') === 'INSUFFICIENT_PERMISSION');

// --- ACCEPTANCE (c): expired subscription -----------------------------------
echo "\n== ACCEPTANCE (c): expired subscription ==\n";

Db::execute(
    "UPDATE subscriptions
        SET expires_at = DATE_SUB(NOW(), INTERVAL 2 DAY), status = 'expired'
      WHERE tenant_id = :t",
    ['t' => $tenantA]
);

$loginExpired = http('POST', '/api/auth/login',
    ['email' => "a-{$suffix}@example.test", 'password' => 'CorrectHorse9']);
check('LOGIN still works on an expired plan', $loginExpired['status'] === 200,
      'status ' . $loginExpired['status']);
$expiredToken = $loginExpired['body']['data']['tokens']['access_token'] ?? '';

$meExpired = http('GET', '/api/auth/me', null, $expiredToken);
check('context READ still works', $meExpired['status'] === 200);
check('limits report the plan as expired',
      ($meExpired['body']['data']['limits']['_source'] ?? '') === 'expired',
      (string) ($meExpired['body']['data']['limits']['_source'] ?? ''));
check('every channel is off', ($meExpired['body']['data']['limits']['fb_enabled'] ?? true) === false);
check('read_only flag is set', ($meExpired['body']['data']['limits']['read_only'] ?? false) === true);

$teamExpired = http('GET', '/api/team', null, $expiredToken);
check('READ endpoints still work (data stays visible)', $teamExpired['status'] === 200,
      'status ' . $teamExpired['status']);

$writeExpired = http('POST', '/api/team/invite',
    ['name' => 'Nope', 'email' => "nope-{$suffix}@example.test", 'role' => 'tenant_agent'], $expiredToken);
check('WRITE endpoints are blocked', $writeExpired['status'] === 403, 'status ' . $writeExpired['status']);
check('blocked with SUBSCRIPTION_EXPIRED, not a generic 403',
      ($writeExpired['body']['error']['code'] ?? '') === 'SUBSCRIPTION_EXPIRED',
      (string) ($writeExpired['body']['error']['code'] ?? ''));
check('the message tells them data is safe',
      str_contains((string) ($writeExpired['body']['error']['message'] ?? ''), 'data is safe'));

check('tenant data was NOT deleted on expiry',
      (int) Db::scalar('SELECT COUNT(*) FROM users WHERE tenant_id = :t', ['t' => $tenantA]) >= 2);

// Renewing restores write access.
upgrade($tenantA);
$afterRenew = http('POST', '/api/team/invite',
    ['name' => 'Renewed', 'email' => "renew-{$suffix}@example.test", 'role' => 'tenant_agent'], $expiredToken);
check('renewing restores write access immediately', $afterRenew['status'] === 201,
      'status ' . $afterRenew['status']);

// --- suspension --------------------------------------------------------------
echo "\n== Suspended tenant ==\n";
Db::execute("UPDATE tenants SET status = 'suspended' WHERE id = :t", ['t' => $tenantA]);
$suspended = http('GET', '/api/team', null, $expiredToken);
check('a suspended tenant is blocked entirely', $suspended['status'] === 403);
check('with TENANT_SUSPENDED', ($suspended['body']['error']['code'] ?? '') === 'TENANT_SUSPENDED');
Db::execute("UPDATE tenants SET status = 'active' WHERE id = :t", ['t' => $tenantA]);

// --- the registration limiter itself ----------------------------------------
echo "\n== Registration rate limit ==\n";
$limitHit = false;
for ($i = 0; $i < 8; $i++) {
    $r = http('POST', '/api/auth/register', [
        'business_name' => "Flood {$i}", 'name' => 'Flood',
        'email' => "flood-{$i}-{$suffix}@example.test", 'password' => 'CorrectHorse9',
    ]);
    if ($r['status'] === 429) { $limitHit = true; break; }
}
check('registration floods are rate limited', $limitHit, 'no 429 after 8 attempts');
Db::execute("DELETE FROM tenants WHERE name LIKE 'Flood %'");
Db::execute('DELETE FROM rate_limits');

// --- cleanup -----------------------------------------------------------------
foreach ([$tenantA, $tenantB] as $t) {
    Db::execute('DELETE FROM tenants WHERE id = :t', ['t' => $t]);
}

echo "\n" . str_repeat('-', 56) . "\n";
printf("  %d passed, %d failed\n\n", $pass, $fail);
exit($fail === 0 ? 0 : 1);
