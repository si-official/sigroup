<?php
declare(strict_types=1);

/**
 * Phase 2 repository behaviour: cross-script product search, inbox
 * denormalisation, order lifecycle and stock, duplicate guards, webhook
 * idempotency, model routing, and retention safety.
 *
 *   php tests/repositories.php
 */

require_once dirname(__DIR__) . '/vendor/autoload.php';

use App\Core\Bootstrap;
use App\Core\Db;
use App\Repositories\ChannelRepository;
use App\Repositories\CommentLogRepository;
use App\Repositories\ContactRepository;
use App\Repositories\ConversationRepository;
use App\Repositories\InstantReplyRepository;
use App\Repositories\MessageRepository;
use App\Repositories\ModelProfileRepository;
use App\Repositories\OrderGuardRepository;
use App\Repositories\OrderRepository;
use App\Repositories\ProductRepository;
use App\Repositories\WebhookEventRepository;
use App\Services\LimitsResolver;
use App\Services\RetentionService;

Bootstrap::boot(dirname(__DIR__));

$pass = 0; $fail = 0;
function check(string $l, bool $ok, string $d = ''): void {
    global $pass, $fail;
    if ($ok) { $pass++; echo "  ok    {$l}\n"; }
    else     { $fail++; echo "  FAIL  {$l}" . ($d !== '' ? " — {$d}" : '') . "\n"; }
}

$suffix = bin2hex(random_bytes(3));

// --- fixture -----------------------------------------------------------------
$tenantId = Db::insert('tenants', [
    'name' => "Repo Test {$suffix}", 'slug' => "repo-{$suffix}", 'status' => 'active',
]);
Db::insert('wallets', ['tenant_id' => $tenantId, 'billing_mode' => 'subscription']);
$pkg = Db::selectOne("SELECT * FROM packages WHERE slug = 'pro'");
Db::insert('subscriptions', [
    'tenant_id' => $tenantId, 'package_id' => $pkg['id'], 'status' => 'active',
    'expires_at' => date('Y-m-d H:i:s', time() + 86400 * 30),
    'limits_snapshot' => json_encode((new LimitsResolver())->snapshotFor($pkg)),
]);
$channelId = Db::insert('channels', [
    'tenant_id' => $tenantId, 'type' => 'messenger',
    'external_id' => "page_{$suffix}", 'status' => 'connected', 'is_active' => 1,
]);

$products = new ProductRepository($tenantId);
$convos   = new ConversationRepository($tenantId);
$messages = new MessageRepository($tenantId);
$orders   = new OrderRepository($tenantId);
$contacts = new ContactRepository($tenantId);

echo "\n== Product search across scripts ==\n";

$shariId = $products->create([
    'name' => 'জামদানি শাড়ি', 'price' => 3500, 'stock' => 10, 'status' => 'active',
    'ai_keywords' => 'jamdani silk',
]);
$products->refreshSearchBlob($shariId);

$panjabiId = $products->create([
    'name' => 'পাঞ্জাবি', 'price' => 1200, 'stock' => 5, 'status' => 'active',
]);
$products->refreshSearchBlob($panjabiId);

check('transliteration produces Latin text',
      str_contains(ProductRepository::transliterate('শাড়ি'), 'sh'),
      ProductRepository::transliterate('শাড়ি'));

$byBangla = $products->searchForAi('শাড়ি');
check('Bangla query finds the Bangla product', count($byBangla) > 0);

// THE case a pure FULLTEXT implementation silently fails.
$byBanglish = $products->searchForAi('shari');
check('BANGLISH query finds the Bangla product', count($byBanglish) > 0,
      'this is what FULLTEXT alone cannot do');

$byKeyword = $products->searchForAi('jamdani');
check('English ai_keywords match', count($byKeyword) > 0);

check('empty query falls back to top products', count($products->searchForAi('')) > 0);
check('nonsense query returns nothing', $products->searchForAi('zzzqqqxxx') === []);

$formatted = $products->formatForPrompt($byBangla);
check('prompt format is compact and priced',
      str_contains($formatted, '৳') && str_contains($formatted, '#'));

echo "\n== Stock cannot oversell ==\n";
check('decrement within stock succeeds', $products->decrementStock($panjabiId, 3));
check('decrement beyond stock is refused', !$products->decrementStock($panjabiId, 10));
check('stock is exactly 2, not negative',
      (int) Db::scalar('SELECT stock FROM products WHERE id = :p', ['p' => $panjabiId]) === 2);
$products->restoreStock($panjabiId, 3);
check('restore puts it back', (int) Db::scalar('SELECT stock FROM products WHERE id = :p', ['p' => $panjabiId]) === 5);

echo "\n== Inbox denormalisation ==\n";
$contactId = $contacts->upsertFromChannel($channelId, "psid_{$suffix}", ['name' => 'রহিম']);
check('contact created', $contactId > 0);
check('upsert is idempotent',
      $contacts->upsertFromChannel($channelId, "psid_{$suffix}", ['name' => 'রহিম']) === $contactId);

$convId = $convos->openFor($channelId, $contactId);
check('conversation opened', $convId > 0);
check('openFor reuses the same conversation', $convos->openFor($channelId, $contactId) === $convId);

$messages->append([
    'conversation_id' => $convId, 'direction' => 'in', 'sender' => 'customer',
    'type' => 'text', 'body' => 'শাড়ির দাম কত?', 'external_message_id' => "mid_{$suffix}_1",
]);

$conv = $convos->find($convId);
check('last_message_text denormalised onto the conversation',
      $conv['last_message_text'] === 'শাড়ির দাম কত?', (string) $conv['last_message_text']);
check('last_message_from recorded', $conv['last_message_from'] === 'customer');
check('message_count incremented', (int) $conv['message_count'] === 1);
check('unread_count incremented for inbound', (int) $conv['unread_count'] === 1);

$dupe = $messages->append([
    'conversation_id' => $convId, 'direction' => 'in', 'sender' => 'customer',
    'type' => 'text', 'body' => 'শাড়ির দাম কত?', 'external_message_id' => "mid_{$suffix}_1",
]);
check('a redelivered webhook is a no-op, not a second message', $dupe === 0);
check('message_count did NOT double-count',
      (int) $convos->find($convId)['message_count'] === 1);

$messages->append([
    'conversation_id' => $convId, 'direction' => 'out', 'sender' => 'ai',
    'source' => 'ai', 'type' => 'text', 'body' => 'জামদানি শাড়ি ৩৫০০ টাকা।',
]);
check('outbound does NOT increase unread', (int) $convos->find($convId)['unread_count'] === 1);

$turns = $messages->lastNTurns($convId, 10);
check('lastNTurns returns oldest-first', count($turns) === 2 && $turns[0]['role'] === 'user');
check('roles mapped for the prompt', $turns[1]['role'] === 'assistant');

$page = $convos->inboxPage([], null, 30);
check('inbox page returns the conversation', count($page['items']) === 1);
check('inbox row carries contact + channel without N+1',
      isset($page['items'][0]['contact_name'], $page['items'][0]['channel_type']));

$counts = $convos->inboxCounts();
check('inbox counts aggregate correctly', $counts['total'] === 1 && $counts['unread'] === 1);

echo "\n== AI pause / human takeover ==\n";
check('AI is active by default', !$convos->isAiPaused($convId));
$convos->pauseAi($convId, 30);
check('AI is paused after takeover', $convos->isAiPaused($convId));

echo "\n== Loop breaker ==\n";
for ($i = 0; $i < 3; $i++) {
    $messages->append([
        'conversation_id' => $convId, 'direction' => 'out', 'sender' => 'ai',
        'source' => 'ai', 'type' => 'text', 'body' => "ফলো-আপ {$i}",
    ]);
}
check('consecutive outbound counted', $messages->consecutiveOutbound($convId) === 4,
      (string) $messages->consecutiveOutbound($convId));

echo "\n== Orders ==\n";
$orderId = $orders->createWithItems(
    [
        'conversation_id' => $convId, 'contact_id' => $contactId,
        'channel_type' => 'messenger', 'customer_name' => 'রহিম',
        'phone' => '01712345678', 'address' => 'ঢাকা', 'district' => 'Dhaka',
        'delivery_charge' => 60, 'status' => 'new', 'created_by' => 'ai',
    ],
    [['product_id' => $shariId, 'qty' => 2]]
);
check('order created', $orderId > 0);

$detail = $orders->detail($orderId);
check('total computed server-side, not trusted from input',
      $detail['total'] === '7060.00', (string) $detail['total']);
check('items_total excludes delivery', $detail['items_total'] === '7000.00');
check('item name snapshotted', $detail['items'][0]['name_snapshot'] === 'জামদানি শাড়ি');
check('stock decremented by the order',
      (int) Db::scalar('SELECT stock FROM products WHERE id = :p', ['p' => $shariId]) === 8);
check('contact lifetime stats updated',
      (int) Db::scalar('SELECT lifetime_orders FROM contacts WHERE id = :c', ['c' => $contactId]) === 1);
check('initial history row written', count($detail['history']) === 1);

$orders->changeStatus($orderId, 'confirmed', 'user', null, 'phone verified');
check('legal transition succeeds', $orders->find($orderId)['status'] === 'confirmed');
check('confirmed_at stamped', $orders->find($orderId)['confirmed_at'] !== null);

try {
    $orders->changeStatus($orderId, 'completed');
    check('illegal transition is refused', false, 'confirmed -> completed was allowed');
} catch (\App\Core\ApiException $e) {
    check('illegal transition is refused', $e->errorCode === 'INVALID_TRANSITION');
    check('and reports what IS allowed', !empty($e->details['allowed']));
}

$orders->changeStatus($orderId, 'cancelled', 'user', null, 'customer changed mind');
check('cancelling restores stock',
      (int) Db::scalar('SELECT stock FROM products WHERE id = :p', ['p' => $shariId]) === 10);

$counts = $orders->statusCounts();
check('status counts cover all 8 columns', count($counts) === 8);
check('cancelled counted', $counts['cancelled']['count'] === 1);

echo "\n== Insufficient stock blocks the order ==\n";
try {
    $orders->createWithItems(
        ['channel_type' => 'messenger', 'phone' => '01799999999', 'status' => 'new'],
        [['product_id' => $panjabiId, 'qty' => 999]]
    );
    check('overselling is refused', false);
} catch (\App\Core\ApiException $e) {
    check('overselling is refused', $e->errorCode === 'INSUFFICIENT_STOCK');
    check('and names the available quantity', isset($e->details['available']));
}
check('failed order left no partial row',
      (int) Db::scalar('SELECT COUNT(*) FROM orders WHERE tenant_id = :t', ['t' => $tenantId]) === 1);

echo "\n== Duplicate-order guard ==\n";
$guards   = new OrderGuardRepository($tenantId);
$settings = ['enabled' => true, 'same_conv_min' => 10, 'same_phone_min' => 30,
             'daily_limit' => 2, 'require_phone' => true];

check('first order passes', !$guards->wouldBeDuplicate('01712345678', $convId, $settings)['duplicate']);
$guards->record('01712345678', $convId);

$second = $guards->wouldBeDuplicate('01712345678', $convId, $settings);
check('immediate repeat is blocked', $second['duplicate']);
check('and gives a reason the AI can say out loud',
      $second['reason'] === 'same_conversation_cooldown' && str_contains((string) $second['message'], 'অর্ডার'));

$noPhone = $guards->wouldBeDuplicate(null, null, $settings);
check('missing phone is blocked when required', $noPhone['duplicate'] && $noPhone['reason'] === 'phone_required');

check('a different customer is unaffected',
      !$guards->wouldBeDuplicate('01799999999', null, $settings)['duplicate']);

echo "\n== Instant replies (zero-token path) ==\n";
$ir = new InstantReplyRepository($tenantId);
$ir->create([
    'match_type' => 'contains',
    'keywords'   => json_encode(['ডেলিভারি চার্জ', 'delivery charge'], JSON_UNESCAPED_UNICODE),
    'reply_text' => 'ঢাকার ভিতরে ৬০ টাকা, বাইরে ১২০ টাকা।',
    'priority'   => 10, 'is_active' => 1,
]);

check('Bangla keyword matches', $ir->findMatch('ডেলিভারি চার্জ কত?') !== null);
check('English keyword matches', $ir->findMatch('what is the delivery charge?') !== null);
check('unrelated message does not match', $ir->findMatch('আপনাদের দোকান কোথায়?') === null);

echo "\n== Webhook idempotency ==\n";
$wh      = new WebhookEventRepository();
$payload = ['entry' => [['id' => 'page1', 'messaging' => [['text' => 'হ্যালো']]]]];
$first   = $wh->recordOnce('messenger', $payload, true);
$replay  = $wh->recordOnce('messenger', $payload, true);
check('first delivery is recorded', $first > 0);
check('Meta redelivery is deduplicated', $replay === 0);
check('a different payload is NOT deduplicated',
      $wh->recordOnce('messenger', ['entry' => [['id' => 'page2']]], true) > 0);

echo "\n== Comment idempotency ==\n";
$cl = new CommentLogRepository($tenantId);
check('first claim on a comment wins', $cl->claim("cmt_{$suffix}", ['commenter_id' => 'u1']));
check('second claim on the same comment is refused', !$cl->claim("cmt_{$suffix}", ['commenter_id' => 'u1']));

echo "\n== Channel resolution (the one cross-tenant read) ==\n";
$resolved = ChannelRepository::resolveByExternalId('messenger', "page_{$suffix}");
check('webhook resolves page id to channel + tenant',
      $resolved !== null && $resolved['tenant_id'] === $tenantId);
check('unknown page id resolves to null',
      ChannelRepository::resolveByExternalId('messenger', 'no_such_page') === null);

echo "\n== Model routing ==\n";
$mp      = new ModelProfileRepository();
$routing = $mp->resolve('chat');
check('chat purpose resolves to a model', $routing !== null);
check('a fallback model is configured', $routing['fallback'] !== null);
check('primary model is active and priced',
      (float) $routing['primary']['input_price_per_1m'] > 0);

$cost = $mp->computeCost((int) $routing['primary']['id'], 10000, 2000);
check('cost computed from stored rates', (float) $cost > 0, $cost);

$cached = $mp->computeCost((int) $routing['primary']['id'], 10000, 2000, 8000);
check('cached tokens cost less than fresh ones', (float) $cached < (float) $cost,
      "{$cached} vs {$cost}");

$stale = ModelProfileRepository::stalePricing();
check('unpriced placeholder models are surfaced', count($stale) > 0);
check('each is labelled with WHY it needs attention',
      $stale !== [] && in_array($stale[0]['reason'], ['unpriced', 'stale'], true));
$urgent = array_filter($stale, static fn (array $m) => (int) $m['is_urgent'] === 1);
check('no ACTIVE model is billing at an unverified rate', $urgent === [],
      count($urgent) . ' active model(s) have no verified price');

echo "\n== Retention safety ==\n";
$retention = new RetentionService();
$before = (int) Db::scalar('SELECT COUNT(*) FROM messages WHERE tenant_id = :t', ['t' => $tenantId]);
$retention->prune();
$after = (int) Db::scalar('SELECT COUNT(*) FROM messages WHERE tenant_id = :t', ['t' => $tenantId]);
check('recent messages are NOT pruned', $after === $before, "{$before} -> {$after}");
check('preview reports without deleting', is_array($retention->preview()));

// --- cleanup -----------------------------------------------------------------
Db::execute('DELETE FROM tenants WHERE id = :t', ['t' => $tenantId]);
Db::execute('DELETE FROM webhook_events WHERE source = :s', ['s' => 'messenger']);

echo "\n" . str_repeat('-', 60) . "\n";
printf("  %d passed, %d failed\n\n", $pass, $fail);
exit($fail === 0 ? 0 : 1);
