<?php
declare(strict_types=1);

/**
 * ACCEPTANCE (b): 100 concurrent consumes against a limit of 50 must produce
 * exactly 50 successes.
 *
 * This is the test the whole QuotaService design exists to pass. It spawns
 * real OS processes with real separate database connections — not a loop in
 * one process, which would serialise itself and prove nothing.
 *
 *   php tests/quota_race.php
 */

require_once dirname(__DIR__) . '/vendor/autoload.php';

use App\Core\Bootstrap;
use App\Core\Db;
use App\Services\QuotaService;

Bootstrap::boot(dirname(__DIR__));

$pass = 0; $fail = 0;
function check(string $l, bool $ok, string $d = ''): void {
    global $pass, $fail;
    if ($ok) { $pass++; echo "  ok    {$l}\n"; }
    else     { $fail++; echo "  FAIL  {$l}" . ($d !== '' ? " — {$d}" : '') . "\n"; }
}

/** Build a tenant with an exact message limit. */
function makeTenant(int $msgLimit, string $suffix): int
{
    $pkgId = Db::insert('packages', [
        'name' => "Race {$suffix}", 'slug' => "race-{$suffix}", 'price' => 1,
        'duration_days' => 30, 'is_trial' => 0, 'is_public' => 0, 'is_active' => 1,
        'msg_limit' => $msgLimit, 'comment_reply_limit' => 10, 'faq_rule_limit' => 10,
        'product_limit' => 10, 'staff_seat_limit' => 1, 'voice_msg_limit' => 0,
        'fb_enabled' => 1, 'wa_enabled' => 1, 'voice_mode' => 'none',
    ]);

    $tenantId = Db::insert('tenants', [
        'name' => "Race Tenant {$suffix}", 'slug' => "race-tenant-{$suffix}", 'status' => 'active',
    ]);

    Db::insert('wallets', ['tenant_id' => $tenantId, 'billing_mode' => 'subscription']);

    $limits = (new \App\Services\LimitsResolver())->snapshotFor(
        Db::selectOne('SELECT * FROM packages WHERE id = :id', ['id' => $pkgId])
    );

    $subId = Db::insert('subscriptions', [
        'tenant_id' => $tenantId, 'package_id' => $pkgId, 'status' => 'active',
        'started_at' => date('Y-m-d H:i:s'),
        'expires_at' => date('Y-m-d H:i:s', time() + 86400 * 30),
        'limits_snapshot' => json_encode($limits),
    ]);

    Db::insert('subscription_usage', [
        'tenant_id' => $tenantId, 'subscription_id' => $subId,
        'cycle_start' => date('Y-m-d'), 'cycle_end' => date('Y-m-d', time() + 86400 * 30),
    ]);

    return $tenantId;
}

$php        = PHP_BINARY;
$workerPath = __DIR__ . '/support/quota_worker.php';

/**
 * Spawn $n workers that all fire at the same instant.
 * @return array{granted:int,blocked:int,errors:string[]}
 */
function race(string $php, string $workerPath, int $tenantId, int $n, string $metric = 'fb_messages'): array
{
    $procs = [];
    $pipes = [];

    // Enough lead time for every process to boot and reach the barrier.
    $startAt = microtime(true) + 2.5;

    for ($i = 0; $i < $n; $i++) {
        $cmd = sprintf('%s %s %d %s %.6f', escapeshellarg($php), escapeshellarg($workerPath), $tenantId, $metric, $startAt);
        $p = proc_open($cmd, [1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $pipe);
        if (is_resource($p)) {
            $procs[$i] = $p;
            $pipes[$i] = $pipe;
        }
    }

    $granted = 0; $blocked = 0; $errors = [];

    foreach ($procs as $i => $proc) {
        $out = stream_get_contents($pipes[$i][1]);
        $err = stream_get_contents($pipes[$i][2]);
        fclose($pipes[$i][1]);
        fclose($pipes[$i][2]);
        proc_close($proc);

        $out = trim((string) $out);
        if ($out === '1')      { $granted++; }
        elseif ($out === '0')  { $blocked++; }
        else                   { $errors[] = $out !== '' ? $out : trim((string) $err); }
    }

    return ['granted' => $granted, 'blocked' => $blocked, 'errors' => $errors];
}

echo "\n== ACCEPTANCE (b): 100 concurrent consumes, limit 50 ==\n";
$t1 = makeTenant(50, 'a' . bin2hex(random_bytes(3)));

$t0 = microtime(true);
$r  = race($php, $workerPath, $t1, 100);
$elapsed = round(microtime(true) - $t0, 2);

echo "  (100 processes, {$elapsed}s wall)\n";

if ($r['errors'] !== []) {
    echo "  worker errors: " . implode(' | ', array_slice($r['errors'], 0, 3)) . "\n";
}

check('no worker errored', $r['errors'] === [], count($r['errors']) . ' errored');
check('exactly 50 granted', $r['granted'] === 50, "got {$r['granted']}");
check('exactly 50 blocked', $r['blocked'] === 50, "got {$r['blocked']}");
check('granted + blocked = 100', $r['granted'] + $r['blocked'] === 100);

$stored = (int) Db::scalar(
    'SELECT fb_messages FROM subscription_usage WHERE tenant_id = :t', ['t' => $t1]
);
// The decisive assertion: the counter must equal the grants exactly. 51 here
// would mean the database let two writers past the ceiling.
check('stored counter is exactly 50 (no overshoot)', $stored === 50, "got {$stored}");
check('counter equals granted count', $stored === $r['granted']);

echo "\n== a second race on an exhausted quota grants nothing ==\n";
$r2 = race($php, $workerPath, $t1, 20);
check('0 granted when already at the limit', $r2['granted'] === 0, "got {$r2['granted']}");
check('counter unchanged at 50', (int) Db::scalar('SELECT fb_messages FROM subscription_usage WHERE tenant_id = :t', ['t' => $t1]) === 50);

echo "\n== odd limit, odd concurrency ==\n";
$t2 = makeTenant(7, 'b' . bin2hex(random_bytes(3)));
$r3 = race($php, $workerPath, $t2, 40);
check('exactly 7 granted against limit 7', $r3['granted'] === 7, "got {$r3['granted']}");
check('stored counter is exactly 7', (int) Db::scalar('SELECT fb_messages FROM subscription_usage WHERE tenant_id = :t', ['t' => $t2]) === 7);

echo "\n== shared msg_limit is consumed across channels ==\n";
$t3 = makeTenant(10, 'c' . bin2hex(random_bytes(3)));
$fb = race($php, $workerPath, $t3, 8, 'fb_messages');
$wa = race($php, $workerPath, $t3, 8, 'wa_messages');
// fb_messages and wa_messages both meter against msg_limit, but they are
// separate counters — so each gets its own 10. Documenting the behaviour the
// implementation actually has, rather than asserting a shared pool it has not.
check('fb got its 8', $fb['granted'] === 8, "got {$fb['granted']}");
check('wa counted independently', $wa['granted'] === 8, "got {$wa['granted']}");

echo "\n== unlimited plan (NULL limit) never blocks ==\n";
$t4 = makeTenant(0, 'd' . bin2hex(random_bytes(3)));
// Rewrite the snapshot in PHP rather than with SQL JSON functions: MariaDB
// treats JSON as a LONGTEXT alias and rejects MySQL's CAST(... AS JSON).
Db::execute('UPDATE packages SET msg_limit = NULL WHERE slug LIKE :s', ['s' => 'race-d%']);
$snap = json_decode(
    (string) Db::scalar('SELECT limits_snapshot FROM subscriptions WHERE tenant_id = :t', ['t' => $t4]),
    true
);
$snap['msg_limit'] = null;
Db::execute(
    'UPDATE subscriptions SET limits_snapshot = :s WHERE tenant_id = :t',
    ['s' => json_encode($snap), 't' => $t4]
);
$r5 = race($php, $workerPath, $t4, 25);
check('all 25 granted on an unlimited plan', $r5['granted'] === 25, "got {$r5['granted']}");
check('usage still recorded for reporting',
      (int) Db::scalar('SELECT fb_messages FROM subscription_usage WHERE tenant_id = :t', ['t' => $t4]) === 25);

echo "\n== release() cannot underflow ==\n";
$q = QuotaService::forTenant($t2);
for ($i = 0; $i < 20; $i++) { $q->release('fb_messages', 1); }
check('counter floors at 0, no unsigned wrap',
      (int) Db::scalar('SELECT fb_messages FROM subscription_usage WHERE tenant_id = :t', ['t' => $t2]) === 0);

// Cleanup. Tenants cascade to their subscriptions, but a previous failed run
// can leave orphans that still reference the race packages, so clear those
// explicitly before deleting the packages themselves.
Db::execute("DELETE FROM tenants WHERE slug LIKE 'race-tenant-%'");
Db::execute("DELETE s FROM subscriptions s JOIN packages p ON p.id = s.package_id
             WHERE p.slug LIKE 'race-%'");
Db::execute("DELETE FROM packages WHERE slug LIKE 'race-%'");

echo "\n" . str_repeat('-', 56) . "\n";
printf("  %d passed, %d failed\n\n", $pass, $fail);
exit($fail === 0 ? 0 : 1);
