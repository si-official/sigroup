# Schema review — Phase 2

What I changed in `docs/bot-saas/schema.sql` rather than implementing it as
given, and why. Ordered by how expensive the problem would have been to find
in production.

---

## 1. Wrong — would have failed silently

### FULLTEXT cannot serve a Bangla/Banglish catalogue

**As specified:** `FULLTEXT KEY ft_prod (name, description, ai_keywords)`, with
`ProductRepository::searchForAi()` described as "FULLTEXT + fallback LIKE".

**The problem:** MySQL and MariaDB FULLTEXT cannot match across scripts. A
customer typing `shari` or `saree` will never match a product named `শাড়ি`,
and Banglish is how a large share of Bangladeshi customers actually type.
Worse, InnoDB FULLTEXT discards tokens below `innodb_ft_min_token_size` (3 by
default), so short Bangla product names are invisible to it entirely.

This fails *invisibly*: a developer testing in one script sees it work, and
the AI simply answers "we don't have that" to real customers.

**Fixed:** added a `search_blob` column holding a normalised, transliterated
form of name + keywords + SKU, plus `ft_prod_blob`. `searchForAi()` now runs
three tiers — FULLTEXT for relevance, `search_blob LIKE` for cross-script,
per-token LIKE as a bounded last resort. `ProductRepository::transliterate()`
maps Bangla to approximate Latin so `শাড়ি` indexes as `shari`.

Proven by `tests/repositories.php`: *"BANGLISH query finds the Bangla product"*.

### Two cron queries could never use an index

**`channels`:** the index was `(status, token_expires_at)`, but the
token-health cron filters on `is_active` + `token_expires_at`. The index was
unusable, so the daily cron full-scanned every channel on the platform.

**`courier_shipments`:** the index was `(status, status_updated_at)`, but the
sync query asks for `status IS NULL OR status NOT IN (...)` — a negative
condition no B-tree can serve.

Both found by `tests/explain_check.php`, both fixed in `013_explain_indexes.sql`.
At 500 tenants these are exactly the kind of thing that makes a nightly cron
overrun its window on shared hosting, with no error anyone sees.

---

## 2. Missing — needed by code the schema implies

| Added | Why |
|---|---|
| `conversations.last_message_text/_from` | The inbox list otherwise needs a correlated subquery or a join to `messages` per row. Denormalised and maintained transactionally in `MessageRepository::append()`. This is the single biggest factor in whether the inbox stays usable at 50k messages. |
| `whatsapp_templates` | Outside WhatsApp's 24-hour window only an approved template may be sent. Without this table the service layer cannot check that before calling Meta, so the failure surfaces as a provider error instead of a blocked send. |
| `courier_locations` | Each courier has its own ids for district/zone/area. Mapping a free-text Bangladeshi address onto them is the #1 cause of failed dispatch; doing it per request against a live API is both slow and fragile. |
| `ai_models.price_verified_at` / `price_source` | Pricing drives every cost figure and every credit-mode charge. Without a provenance stamp a stale rate corrupts margins silently. `stalePricing()` surfaces both unpriced and expired rows. |
| `ai_models.cached_price_per_1m` | Prompt caching is the largest cost lever in the AI path. Billing cache reads at the full input rate would overstate cost by multiples. |
| `voice_messages.confidence` | Bangla STT accuracy is the whole game for voice orders. Without a confidence signal the bot cannot know to *confirm* rather than guess at an order. |
| `products.low_stock_at` | Low-stock alerts need a per-product threshold; a global constant is wrong for a shop selling both earrings and sofas. |
| `followup_sequences.max_per_week` | A cap per contact, so a quiet customer is not pestered into blocking the page. |
| `payments`, `coupons` | Present in the source schema's billing section but absent from what Phase 3 had applied; added in `012_platform.sql`. |
| `login_attempts`, `email_verifications`, `refresh_tokens.family_id` | Added in Phase 3 — the source schema had a single flat `refresh_tokens` table with no family, so token-reuse detection was impossible. |

---

## 3. Will not scale — changed shape

### `subscription_usage` counters

The source schema had the columns but no statement about how they are written.
A read-then-write increment loses money under concurrent webhooks. The
conditional-UPDATE pattern in `QuotaService` is the fix, proven by
`tests/quota_race.php` (100 processes, limit 50, exactly 50 succeed).

### Analytics computed from raw tables

Any dashboard that computes "messages today" by scanning `messages` is a full
table scan per tenant per page load. `analytics_daily` existed in the source
schema but nothing enforced its use; `AnalyticsRepository` now reads *only*
the rollup, and `rollupDay()` is idempotent so the hourly partial can re-run
"today" 24 times without double-counting.

### Indexes added after reading actual query plans

`013_explain_indexes.sql` — covering indexes for the inbox count chips and the
top-products aggregate, plus the two cron fixes above. Every index in that
migration exists because a specific query was reaching `type=ALL`, not because
it looked sensible.

---

## 4. Deliberately NOT changed

**`messages` is not partitioned.** Partitioning by month would help at tens of
millions of rows, but MariaDB on shared hosting handles partition pruning
poorly and it complicates every migration. The retention job plus
`idx_msg_conv` carries this to a scale well past where the whole product
should have moved to a VPS.

**`analytics_daily` keeps `hourly_messages` as JSON** rather than 24 columns.
It is only ever read whole, for the heatmap.

**`order_guards` is a separate table**, not a query over `orders`. It is read
on every AI order confirm; an O(1) counter beats scanning an order history.

**Tenant data is never hard-deleted on expiry.** `tenants.deleted_at` is a
soft delete and retention leaves tenant rows alone. A lapsed customer who
returns must find their orders intact.

---

## 5. Open items for later phases

- **`messages` archive-to-cold-storage** must land before retention ever
  deletes anything. Today `RETAIN_MESSAGES` defaults to 365 days and the
  service refuses any window under 30 days, but that is a guard rail, not an
  archive.
- **OpenAI and Google model pricing is unverified.** Those rows are seeded as
  inactive placeholders with `price_verified_at = NULL`. They must be priced
  in the admin panel before being enabled — `stalePricing()` flags any active
  model with no verified rate as urgent.
- **`courier_locations` is empty.** Phase 9 must sync it from each provider
  before dispatch can resolve an address.
