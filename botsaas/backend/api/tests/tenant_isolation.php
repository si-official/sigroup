<?php
declare(strict_types=1);

/**
 * Proves BaseRepository's tenant scoping (constraint 4).
 * This is the test that matters most in the whole codebase: a leak here is
 * the failure that ends a SaaS business.
 *
 *   php tests/tenant_isolation.php
 */

require_once dirname(__DIR__) . '/vendor/autoload.php';

use App\Core\Bootstrap;
use App\Core\Db;
use App\Core\NotFoundException;
use App\Core\TenantScopeViolationException;
use App\Repositories\BaseRepository;

Bootstrap::boot(dirname(__DIR__));

$pass = 0; $fail = 0;
function check(string $l, bool $ok, string $d = ''): void {
    global $pass, $fail;
    if ($ok) { $pass++; echo "  ok    {$l}\n"; }
    else     { $fail++; echo "  FAIL  {$l}" . ($d !== '' ? " — {$d}" : '') . "\n"; }
}

// A throwaway tenant-owned table standing in for `products`.
Db::pdo()->exec('DROP TABLE IF EXISTS probe_products');
Db::pdo()->exec(
    'CREATE TABLE probe_products (
        id        BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        tenant_id BIGINT UNSIGNED NOT NULL,
        name      VARCHAR(190) NOT NULL,
        price     DECIMAL(12,2) NOT NULL DEFAULT 0,
        status    VARCHAR(20) NOT NULL DEFAULT "active",
        INDEX (tenant_id)
     ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
);

final class ProbeProductRepository extends BaseRepository
{
    protected string $table = 'probe_products';
    protected bool $tenantOwned = true;
    protected const TENANT_OWNED_TABLES = ['probe_products'];

    /** Correctly written raw query. */
    public function cheapestName(): ?string
    {
        $row = $this->selectOne(
            'SELECT name FROM probe_products WHERE tenant_id = :t ORDER BY price ASC LIMIT 1',
            ['t' => $this->tenantId()]
        );
        return $row['name'] ?? null;
    }

    /** The mistake this guard exists to catch: no tenant filter. */
    public function leakyQuery(): array
    {
        return $this->select('SELECT id, name FROM probe_products ORDER BY id');
    }
}

final class GlobalProbeRepository extends BaseRepository
{
    protected string $table = 'settings';
    protected bool $tenantOwned = false;
}

$t1 = new ProbeProductRepository(101);
$t2 = new ProbeProductRepository(202);

echo "\n== Writes are stamped with the authenticated tenant ==\n";
$p1 = $t1->create(['name' => 'তেলের বোতল', 'price' => '250.00']);
$p2 = $t1->create(['name' => 'Shampoo', 'price' => '180.50']);
$p3 = $t2->create(['name' => 'Rival shop secret product', 'price' => '999.00']);
check('create() returns an id', $p1 > 0 && $p2 > 0 && $p3 > 0);

$row = Db::selectOne('SELECT tenant_id FROM probe_products WHERE id = :id', ['id' => $p1]);
check('row carries the constructor tenant_id', (int) $row['tenant_id'] === 101);

// The attack: client sends its own tenant_id in the payload.
$spoofed = $t1->create(['name' => 'spoof attempt', 'tenant_id' => 202, 'price' => '1.00']);
$spoofRow = Db::selectOne('SELECT tenant_id FROM probe_products WHERE id = :id', ['id' => $spoofed]);
check('a tenant_id in the payload CANNOT override the authenticated one',
      (int) $spoofRow['tenant_id'] === 101, 'got ' . $spoofRow['tenant_id']);

echo "\n== Reads are scoped ==\n";
check('tenant 101 sees only its own 3 rows', $t1->count() === 3, 'got ' . $t1->count());
check('tenant 202 sees only its own 1 row', $t2->count() === 1, 'got ' . $t2->count());
check('tenant 101 can read its own row', $t1->find($p1) !== null);
check('tenant 101 CANNOT read tenant 202 row by id', $t1->find($p3) === null);
check('tenant 202 CANNOT read tenant 101 row by id', $t2->find($p1) === null);

try {
    $t2->findOrFail($p1);
    check('findOrFail on another tenant row throws', false);
} catch (NotFoundException) {
    check('findOrFail on another tenant row throws 404 (not 403 — no existence leak)', true);
}

$names = array_column($t1->all([], ['name'], 'id', 100), 'name');
check('all() never returns another tenant row',
      !in_array('Rival shop secret product', $names, true), implode('|', $names));

echo "\n== Updates and deletes are scoped ==\n";
check('update across tenants affects 0 rows', $t1->update($p3, ['name' => 'hijacked']) === 0);
$untouched = Db::selectOne('SELECT name FROM probe_products WHERE id = :id', ['id' => $p3]);
check('the other tenant row is unchanged', $untouched['name'] === 'Rival shop secret product');
check('delete across tenants affects 0 rows', $t1->delete($p3) === 0);
check('the other tenant row still exists', Db::scalar('SELECT COUNT(*) FROM probe_products WHERE id = :id', ['id' => $p3]) === 1);
check('update within the tenant works', $t1->update($p1, ['price' => '275.00']) === 1);
check('tenant_id cannot be reassigned via update', $t1->update($p1, ['tenant_id' => 202]) === 0);

echo "\n== Raw SQL guard ==\n";
check('a correctly scoped raw query runs', $t1->cheapestName() !== null);
try {
    $t1->leakyQuery();
    check('an unscoped raw query is REFUSED', false, 'the guard let it through');
} catch (TenantScopeViolationException $e) {
    check('an unscoped raw query is REFUSED', true);
    check('the error names the table and the repository',
          str_contains($e->getMessage(), 'probe_products') && str_contains($e->getMessage(), 'ProbeProduct'));
}

echo "\n== Construction guard ==\n";
try {
    new ProbeProductRepository(null);
    check('a tenant-owned repo cannot be built without a tenant', false);
} catch (TenantScopeViolationException) {
    check('a tenant-owned repo cannot be built without a tenant', true);
}
try {
    new GlobalProbeRepository(null);
    check('a global repo CAN be built without a tenant', true);
} catch (TenantScopeViolationException $e) {
    check('a global repo CAN be built without a tenant', false, $e->getMessage());
}

echo "\n== Identifier injection ==\n";
foreach (['name; DROP TABLE probe_products', 'name OR 1=1', '`name`'] as $bad) {
    try {
        $t1->all([$bad => 'x']);
        check("illegal column identifier rejected: {$bad}", false);
    } catch (TenantScopeViolationException) {
        check("illegal column identifier rejected: {$bad}", true);
    }
}
try {
    $t1->all([], ['*'], 'price; DROP TABLE probe_products');
    check('illegal ORDER BY rejected', false);
} catch (TenantScopeViolationException) {
    check('illegal ORDER BY rejected', true);
}

echo "\n== Cursor pagination ==\n";
for ($i = 0; $i < 8; $i++) {
    $t1->create(['name' => "bulk {$i}", 'price' => (string) (10 + $i)]);
}
$page1 = $t1->paginate([], 5);
check('first page respects the limit', count($page1['items']) === 5, (string) count($page1['items']));
check('first page returns a cursor', $page1['next_cursor'] !== null);
$page2 = $t1->paginate([], 5, $page1['next_cursor']);
$ids1 = array_column($page1['items'], 'id');
$ids2 = array_column($page2['items'], 'id');
check('second page does not repeat rows', array_intersect($ids1, $ids2) === []);
check('page size is capped at 100', count($t1->paginate([], 9999)['items']) <= 100);
check('a tampered cursor is ignored, not obeyed', $t1->paginate([], 5, 'bm90LWEtcmVhbC1jdXJzb3I=')['items'] !== []);
$allPaged = array_merge($ids1, $ids2);
check('pagination never crosses tenants',
      Db::scalar('SELECT COUNT(*) FROM probe_products WHERE id IN (' . implode(',', array_map('intval', $allPaged)) . ') AND tenant_id <> 101') === 0);

Db::pdo()->exec('DROP TABLE probe_products');

echo "\n" . str_repeat('-', 56) . "\n";
printf("  %d passed, %d failed\n\n", $pass, $fail);
exit($fail === 0 ? 0 : 1);
