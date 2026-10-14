<?php
declare(strict_types=1);

/**
 * Dependency-free smoke test for the Phase 1 foundation.
 * Exercises everything that does not need a database.
 *
 *   php tests/smoke.php
 */

require_once dirname(__DIR__) . '/vendor/autoload.php';

use App\Core\Bootstrap;
use App\Core\Crypto;
use App\Core\Request;
use App\Core\Response;
use App\Core\Router;
use App\Core\ValidationException;
use App\Core\Validator;
use App\Support\Money;

Bootstrap::boot(dirname(__DIR__));

$pass = 0;
$fail = 0;

function check(string $label, bool $ok, string $detail = ''): void
{
    global $pass, $fail;
    if ($ok) {
        $pass++;
        echo "  ok    {$label}\n";
    } else {
        $fail++;
        echo "  FAIL  {$label}" . ($detail !== '' ? " — {$detail}" : '') . "\n";
    }
}

echo "\n== Crypto (AES-256-GCM) ==\n";
$secret = 'EAAG...page-access-token-with-বাংলা-text';
$blob   = Crypto::encrypt($secret, 'channel:7:page_token');
check('round-trips', Crypto::decrypt($blob, 'channel:7:page_token') === $secret);
check('ciphertext differs from plaintext', $blob !== $secret);
check('two encryptions of same input differ (random IV)', Crypto::encrypt($secret) !== Crypto::encrypt($secret));
check('wrong AAD fails closed', Crypto::decrypt($blob, 'channel:8:page_token') === null);
check('tampered payload fails closed', Crypto::decrypt(substr($blob, 0, -4) . 'AAAA', 'channel:7:page_token') === null);
check('null in, null out', Crypto::decrypt(null) === null);
$bundle = ['page_access_token' => 'abc123', 'app_secret' => 'xyz', 'page_name' => 'ঢলনা শপ'];
check('array round-trips with Bangla', Crypto::decryptArray(Crypto::encryptArray($bundle, 'c:1'), 'c:1') === $bundle);
check('hint masks the secret', Crypto::hint('sk-ant-api03-verylongkey1234') === 'sk-ant...1234');

echo "\n== Money (integer paisa) ==\n";
check('19.99 taka = 1999 paisa', Money::fromTaka('19.99')->paisa() === 1999);
check('float 19.99 does not drift', Money::fromTaka(19.99)->paisa() === 1999);
$sum = Money::fromTaka('0.10')->add(Money::fromTaka('0.20'));
check('0.10 + 0.20 === 0.30 exactly', $sum->equals(Money::fromTaka('0.30')), $sum->toDecimalString());
check('decimal string is exact', Money::fromTaka('1250')->toDecimalString() === '1250.00');
check('strips thousands separator and ৳', Money::fromTaka('৳1,250.50')->paisa() === 125050);
check('parses Bangla-Indic digits', Money::fromTaka('১২৫০')->paisa() === 125000);
$parts = Money::fromPaisa(100)->allocate(3);
$back  = Money::zero()->add(...$parts);
check('allocate(3) loses no paisa', $back->paisa() === 100, $back->toDecimalString());
check('allocate(3) of 100 = 34+33+33', array_map(fn ($m) => $m->paisa(), $parts) === [34, 33, 33]);
check('5 x 249.50 = 1247.50', Money::fromTaka('249.50')->multiply(5)->toDecimalString() === '1247.50');
check('formats in Bangla digits', Money::fromTaka('1250')->format('bn') === '৳১,২৫০');
check('formats in ASCII digits', Money::fromTaka('1250.75')->format('en') === '৳1,250.75');
check('negative is preserved', Money::fromTaka('-50.25')->toDecimalString() === '-50.25');

echo "\n== Validator (Bangla-aware) ==\n";
$ok = Validator::validate(
    ['name' => '  মোহাম্মদ রহিম  ', 'phone' => '+8801712345678', 'qty' => '3'],
    ['name' => 'required|string|max:20', 'phone' => 'required|bd_phone', 'qty' => 'required|int|min:1']
);
check('Bangla name counted as characters, not bytes', $ok['name'] === 'মোহাম্মদ রহিম');
check('BD phone normalised to 01XXXXXXXXX', $ok['phone'] === '01712345678', (string) $ok['phone']);
check('int is cast', $ok['qty'] === 3);

$bangla25 = str_repeat('অ', 25); // 25 chars, 75 bytes
try {
    Validator::validate(['x' => $bangla25], ['x' => 'required|string|max:30']);
    check('25 Bangla chars pass max:30 (strlen would reject)', true);
} catch (ValidationException) {
    check('25 Bangla chars pass max:30 (strlen would reject)', false, 'rejected — byte counting leaked in');
}

try {
    Validator::validate(['email' => 'nope', 'phone' => '0171234'], ['email' => 'required|email', 'phone' => 'required|bd_phone']);
    check('invalid input throws', false);
} catch (ValidationException $e) {
    $fields = $e->details['fields'] ?? [];
    check('invalid input throws 422', $e->statusCode === 422);
    check('reports both bad fields', isset($fields['email'], $fields['phone']));
}

try {
    Validator::validate([], ['name' => 'required']);
    check('missing required throws', false);
} catch (ValidationException) {
    check('missing required throws', true);
}

echo "\n== Router ==\n";
$router = new Router();
$router->get('/api/health', fn () => Response::ok());
$router->get('/api/orders/{id:int}', fn () => Response::ok());
$router->group('/api/admin', [], function (Router $r) {
    $r->get('/tenants/{id:int}/usage', fn () => Response::ok());
});

$make = fn (string $m, string $p) => new Request($m, $p, '', [], [], ['REMOTE_ADDR' => '127.0.0.1']);

check('matches a static route', $router->match($make('GET', '/api/health')) !== null);
$m = $router->match($make('GET', '/api/orders/4210'));
check('extracts an int path param', ($m['params']['id'] ?? null) === '4210');
check('rejects a non-numeric int param', $router->match($make('GET', '/api/orders/abc')) === null);
$m = $router->match($make('GET', '/api/admin/tenants/9/usage'));
check('group prefix applies', $m !== null && ($m['params']['id'] ?? null) === '9');
check('unknown path returns null (404)', $router->match($make('GET', '/api/nope')) === null);
try {
    $router->match($make('DELETE', '/api/health'));
    check('wrong method raises 405, not 404', false);
} catch (\App\Core\ApiException $e) {
    check('wrong method raises 405, not 404', $e->statusCode === 405);
}

echo "\n== Response envelope ==\n";
$body = Response::ok(['x' => 1])->body();
check('success shape is {ok:true,data}', $body === ['ok' => true, 'data' => ['x' => 1]]);
check('success status is 200', Response::ok()->status() === 200);
$err = Response::error('QUOTA_EXCEEDED', 'limit reached', 402, ['metric' => 'msg']);
check('error shape is {ok:false,error}', ($err->body()['ok'] ?? null) === false && isset($err->body()['error']['code']));
check('error status matches', $err->status() === 402);
$page = Response::page([1, 2, 3], 'abc', 30)->body();
check('page meta carries cursor', ($page['meta']['next_cursor'] ?? null) === 'abc' && ($page['meta']['has_more'] ?? null) === true);
$feat = Response::fromException(new \App\Core\FeatureNotInPlanException('wa_enabled', 'WhatsApp Bot'));
check('402 carries upgrade payload for the locked card',
    ($feat->body()['error']['details']['upgrade_url'] ?? null) !== null && $feat->status() === 402);

echo "\n== Request (raw body preservation) ==\n";
$raw = '{"entry":[{"messaging":[{"text":"আসসালামু আলাইকুম"}]}]}';
$req = new Request('POST', '/api/webhook/messenger', $raw, ['content-type' => 'application/json'], [], ['REMOTE_ADDR' => '1.2.3.4']);
check('rawBody survives a json() call', $req->json() !== [] && $req->rawBody() === $raw);
$sig = 'sha256=' . hash_hmac('sha256', $req->rawBody(), 'app-secret');
check('HMAC over rawBody is reproducible', hash_equals($sig, 'sha256=' . hash_hmac('sha256', $raw, 'app-secret')));
check('dot-notation input()', $req->input('entry.0.messaging.0.text') === 'আসসালামু আলাইকুম');
$req2 = new Request('GET', '/api/inbox', '', [], ['limit' => '9999'], []);
check('limit is capped at 100', $req2->limit(30, 100) === 100);
$req3 = new Request('GET', '/x', '', ['authorization' => 'Bearer abc.def.ghi'], [], []);
check('bearer token extracted', $req3->bearerToken() === 'abc.def.ghi');
$spoof = new Request('GET', '/x', '', ['x-forwarded-for' => '9.9.9.9'], [], ['REMOTE_ADDR' => '1.2.3.4']);
check('X-Forwarded-For ignored from untrusted peer', $spoof->ip() === '1.2.3.4');

echo "\n" . str_repeat('-', 52) . "\n";
printf("  %d passed, %d failed\n\n", $pass, $fail);
exit($fail === 0 ? 0 : 1);
