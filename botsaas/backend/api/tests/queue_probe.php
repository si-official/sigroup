<?php
declare(strict_types=1);

/**
 * Live queue verification. Requires a reachable database.
 *   php tests/queue_probe.php
 */

require_once dirname(__DIR__) . '/vendor/autoload.php';

use App\Core\Bootstrap;
use App\Core\Db;
use App\Jobs\Handlers\EchoProbe;
use App\Jobs\JobRunner;
use App\Jobs\Queue;

Bootstrap::boot(dirname(__DIR__));

$pass = 0; $fail = 0;
function check(string $l, bool $ok, string $d = ''): void {
    global $pass, $fail;
    if ($ok) {
        $pass++;
        echo "  ok    {$l}\n";
    } else {
        $fail++;
        echo "  FAIL  {$l}" . ($d !== '' ? " — {$d}" : '') . "\n";
    }
}

Db::execute('DELETE FROM jobs');

echo "\n== Queue enqueue ==\n";
$a = Queue::push('probe.echo', ['note' => 'প্রথম কাজ'], 101, Queue::PRIORITY_NORMAL);
$b = Queue::push('probe.echo', ['note' => 'urgent'], 101, Queue::PRIORITY_URGENT);
check('push returns ids', $a > 0 && $b > 0);

$d1 = Queue::push('probe.echo', ['note' => 'dup'], 101, Queue::PRIORITY_NORMAL, 'dedupe-key-xyz');
$d2 = Queue::push('probe.echo', ['note' => 'dup'], 101, Queue::PRIORITY_NORMAL, 'dedupe-key-xyz');
check('dedupe_key makes a repeat enqueue a no-op', $d1 > 0 && $d2 === 0);

$delayed = Queue::push('probe.echo', ['note' => 'later'], 101, Queue::PRIORITY_LOW, null, 3600);
check('delayed job is enqueued', $delayed > 0);

$failing = Queue::push('probe.echo', ['fail' => true, 'note' => 'boom'], 101);
$unknown = Queue::push('probe.nonexistent', [], 101);

$depth = Queue::depth();
check('depth() counts pending', $depth['pending'] === 6, 'got ' . $depth['pending']);

echo "\n== Worker run ==\n";
$runner = (new JobRunner('probe-worker'))->register('probe.echo', EchoProbe::class);
$result = $runner->run();

// 5 jobs are due: 3 succeed, 1 throws (retried, not counted), 1 has no handler (terminal fail).
check('processed the 3 succeeding jobs', $result['processed'] === 3, 'got ' . $result['processed']);
check('failed the unknown-type job terminally', $result['failed'] === 1, 'got ' . $result['failed']);

$done = (int) Db::scalar("SELECT COUNT(*) FROM jobs WHERE status = 'done'");
check('3 rows marked done', $done === 3, 'got ' . $done);

$urgentFirst = Db::selectOne(
    "SELECT payload FROM jobs WHERE status = 'done' ORDER BY completed_at ASC, id ASC LIMIT 1"
);
check('urgent priority ran first', str_contains((string) $urgentFirst['payload'], 'urgent'),
      (string) ($urgentFirst['payload'] ?? ''));

$retry = Db::selectOne("SELECT status, attempts, available_at > NOW() AS backed_off FROM jobs WHERE id = {$failing}");
check('failing job is pending again for retry', $retry['status'] === 'pending', (string) $retry['status']);
check('failing job attempt was counted', (int) $retry['attempts'] === 1);
check('failing job is backed off into the future', (int) $retry['backed_off'] === 1);

$unknownRow = Db::selectOne("SELECT status, last_error FROM jobs WHERE id = {$unknown}");
check('unknown type fails immediately, no retries', $unknownRow['status'] === 'failed');
check('unknown type records why', str_contains((string) $unknownRow['last_error'], 'No handler registered'));

$delayedRow = Db::selectOne("SELECT status FROM jobs WHERE id = {$delayed}");
check('delayed job was NOT picked up', $delayedRow['status'] === 'pending');

echo "\n== Stale reservation reclaim ==\n";
Db::execute("UPDATE jobs SET status = 'reserved', reserved_at = DATE_SUB(NOW(3), INTERVAL 10 MINUTE),
             reserved_by = 'dead-worker:abcd1234', attempts = 0, available_at = NOW(3)
             WHERE id = {$delayed}");
$second = (new JobRunner('probe-worker-2'))->register('probe.echo', EchoProbe::class)->run();
check('a crashed worker reservation is reclaimed', $second['reclaimed'] === 1, 'got ' . $second['reclaimed']);
check('and then processed', $second['processed'] === 1, 'got ' . $second['processed']);

echo "\n== Heartbeat ==\n";
$hb = Db::selectOne("SELECT job_name, processed, last_status FROM cron_heartbeats WHERE job_name = 'worker'");
check('worker wrote a heartbeat', $hb !== null && $hb['last_status'] === 'ok');

Db::execute('DELETE FROM jobs');

echo "\n" . str_repeat('-', 52) . "\n";
printf("  %d passed, %d failed\n\n", $pass, $fail);
exit($fail === 0 ? 0 : 1);
