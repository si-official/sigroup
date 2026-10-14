# AI Chat-Commerce SaaS — Architecture (Phase 1)

Multi-tenant platform where Bangladeshi businesses connect Facebook Page,
WhatsApp, Instagram and their website, and an AI agent answers customers in
Bangla, shows products and takes orders automatically.

**Stack:** PHP 8.1 (vanilla, PSR-4) · MySQL 8 / MariaDB 10.4+ · Next.js 14
static export · Hostinger shared hosting · cron-driven queue.

---

## 1. Module map

Dependency rule: a module may call only what its **Calls** column lists.
`core` and `jobs` are infrastructure and callable from anywhere. Nothing calls
`admin`. No cycles — if two modules need each other, the shared part belongs in
`core` or a new module.

| Module | Owns (tables) | Route prefix | Calls |
|---|---|---|---|
| **core** | — (Db, Env, Crypto, Router, Validator, Logger, Context, Money) | — | — |
| **auth** | `users`, `refresh_tokens`, `password_resets`, `audit_logs` | `/api/auth` | core, tenancy, media |
| **tenancy** | `tenants` | — (middleware) | core, billing *(read-only: limits)* |
| **billing** | `packages`, `subscriptions`, `subscription_usage`, `wallets`, `wallet_transactions`, `payments`, `coupons` | `/api/subscription`, `/api/wallet` | core, tenancy, jobs |
| **channels** | `channels`, `bot_configs`, `bot_settings`, `widget_settings` | `/api/facebook`, `/api/whatsapp`, `/api/instagram`, `/api/widget`, `/api/webhook` | core, tenancy, jobs, integrations |
| **ai-engine** | `ai_providers`, `ai_models`, `model_profiles`, `tenant_ai_keys`, `ai_requests`, `prompt_templates` | `/api/ai` | core, billing *(quota)*, catalog *(product search)*, orders *(tools)*, channels *(config)* |
| **inbox** | `contacts`, `conversations`, `messages`, `message_batches`, `voice_messages` | `/api/inbox`, `/api/conversations` | core, tenancy, channels, ai-engine, jobs |
| **catalog** | `products`, `product_variants`, `product_categories` | `/api/products` | core, tenancy, media, billing *(product limit)* |
| **orders** | `orders`, `order_items`, `order_status_history`, `order_guards`, `leads` | `/api/orders`, `/api/leads` | core, tenancy, catalog, courier, inbox |
| **courier** | `courier_accounts`, `courier_shipments` | `/api/courier` | core, tenancy, orders, integrations |
| **automation** | `instant_replies`, `comment_automations`, `comment_logs`, `followup_sequences`, `followup_steps`, `followup_jobs` | `/api/automation` | core, tenancy, inbox, ai-engine, jobs |
| **analytics** | `analytics_daily`, `activity_logs` | `/api/analytics` | core, tenancy *(reads everything, writes nothing)* |
| **media** | `media_files` | `/api/media` | core, tenancy |
| **jobs** | `jobs`, `cron_heartbeats` | — (CLI) | core, **and any module's handlers** |
| **admin** | `announcements`, `support_tickets`, `ticket_replies`, `settings`, `api_tokens` | `/api/admin` | **all** (platform-wide, never tenant-scoped) |

### Flow of one customer message

```
Meta webhook
  └─ channels: verify HMAC over raw body, insert webhook_events (dedupe), enqueue, 200
       ... returns in <200ms, zero LLM calls              [constraint 3]
cron worker (≤50s budget)                                 [constraint 2]
  └─ inbox: resolve channel→tenant, upsert contact + conversation, insert message
       └─ automation: gates 1-6 — blocked / schedule / paused / keyword / instant reply
            ... 30-50% of real traffic exits here at zero token cost
       └─ billing: quota check                            [constraint 5]
       └─ ai-engine: assemble prompt → LLM → tool calls → reply
            └─ catalog: search_products       (read)
            └─ orders:  create_order          (write, tenant-scoped server-side)
       └─ billing: record tokens + cost
       └─ channels: send reply
       └─ analytics: activity log
```

The ordering is the business model: every cheap gate runs before the expensive one.

---

## 2. Directory tree

```
botsaas/
├── ARCHITECTURE.md
├── backend/api/
│   ├── composer.json              config.platform.php pinned to the DEPLOY target
│   ├── .env.example               every key the system will need, grouped
│   ├── public/
│   │   ├── index.php              front controller — the only web entry point
│   │   └── .htaccess              rewrite + deny dotfiles/vendor/storage + headers
│   ├── routes/
│   │   └── api.php                one route table; phases 3-13 shape pre-agreed
│   ├── src/
│   │   ├── Core/
│   │   │   ├── Bootstrap.php      one boot path for web, cron and CLI
│   │   │   ├── Db.php             PDO singleton, utf8mb4, savepoint transactions
│   │   │   ├── Env.php            typed access; missing required key = boot failure
│   │   │   ├── Crypto.php         AES-256-GCM, versioned envelope, AAD binding
│   │   │   ├── Request.php        raw body captured ONCE (webhook HMAC depends on it)
│   │   │   ├── Response.php       the {ok,data,error} envelope
│   │   │   ├── Router.php         regex table, typed path params, groups
│   │   │   ├── Validator.php      mb_strlen + NFC + bd_phone
│   │   │   ├── Logger.php         JSON lines, daily rotation, secret redaction
│   │   │   ├── Context.php        the ONLY sanctioned source of tenant_id
│   │   │   └── *Exception.php     one class per file (PSR-4)
│   │   ├── Http/Kernel.php        cors → rate limit → route → auth → tenant → quota
│   │   ├── Middleware/            Cors, RateLimit, Auth, TenantScope,
│   │   │                          RequirePackageFeature, RequireRole
│   │   ├── Repositories/
│   │   │   └── BaseRepository.php tenant scoping + the unscoped-SQL guard
│   │   ├── Database/Migrator.php  filename-ordered, checksummed, forward-only
│   │   ├── Jobs/
│   │   │   ├── Queue.php          enqueue + dedupe_key
│   │   │   ├── JobRunner.php      claim/execute/retry inside a 50s budget
│   │   │   ├── JobHandlerInterface.php
│   │   │   └── Handlers/          one class per job type (phases 6-12)
│   │   ├── Services/              business logic (phases 3-12)
│   │   ├── Integrations/          Meta, WhatsApp, AI providers, gateways, couriers
│   │   ├── Controllers/           HTTP only: validate → service → Response
│   │   └── Support/Money.php      integer paisa, never float
│   ├── database/migrations/       001_platform_bootstrap, 002_widen_job_reserved_by
│   ├── cron/
│   │   ├── worker.php             * * * * *   queue worker
│   │   └── scheduler.php          * * * * *   time-based dispatch + retention
│   ├── cli/migrate.php            --status | --dry-run | apply
│   ├── tests/
│   │   ├── smoke.php              45 assertions, no DB required
│   │   ├── queue_probe.php        17 assertions, live DB
│   │   └── tenant_isolation.php   31 assertions, the one that matters most
│   └── storage/logs/
├── apps/panel/                    tenant panel (static export, :3000)
│   ├── next.config.mjs            output:'export', trailingSlash, images unoptimized
│   ├── tailwind.config.ts         semantic tokens, Bangla font stack, xs:360px
│   ├── app/{layout,page}.tsx, globals.css
│   └── lib/api.ts                 envelope client, token lifecycle, single-flight refresh
└── apps/admin/                    SaaS admin panel (separate build, :3001)
```

### Layering

```
Controller   HTTP only — validate, call a service, return a Response. No SQL.
Service      business rules, transactions, cross-module orchestration.
Repository   all SQL. Tenant scoping is enforced here, not remembered here.
Integration  one class per third party. No business logic.
```

A controller that touches SQL, or a repository that calls an integration, is a
layering break — both make the tenant-isolation tests unable to prove anything.

---

## 3. The six constraints, and where each is actually enforced

| # | Constraint | Enforced in |
|---|---|---|
| 1 | Static frontend | `apps/*/next.config.mjs` (`output:'export'`), `lib/api.ts` |
| 2 | No background workers | `Jobs/JobRunner.php` (50s budget), `cron/*.php` |
| 3 | Webhooks under 2s | `channels` webhook handlers: verify → insert → enqueue → 200 |
| 4 | Tenancy is a security boundary | `Repositories/BaseRepository.php` + `Core/Context.php` |
| 5 | Money and tokens are the product | `QuotaService` (Phase 3), `ai_requests`, `Support/Money.php` |
| 6 | Bangla is primary | `Core/Validator.php` (mb_strlen/NFC), `Response` (UNESCAPED_UNICODE), `utf8mb4`, `line-height 1.7` |

---

## 4. Decisions worth not relitigating

**Cursor pagination, not offset.** The inbox and order board are append-heavy;
`OFFSET` skips and repeats rows while someone is reading, and degrades as you
page deeper. Cursors are HMAC-signed so a tampered one is ignored rather than
obeyed.

**`tenant_id` inlined as an integer in `BaseRepository`**, not bound as a
parameter — a caller's `$bindings` array can never accidentally rebind it.

**404, not 403, for another tenant's row.** A 403 would confirm the row exists,
letting anyone enumerate other tenants by walking sequential ids.

**Access token in memory, refresh token in `localStorage`.** An access token in
`localStorage` is readable by any XSS. Refresh is single-flight: six concurrent
dashboard calls must trigger one rotation, not six racing ones.

**No down migrations.** Rollback against a live multi-tenant database is a trap.
The rule is additive-only changes (Phase 14), so there is nothing to undo.

**Rate limiting fails open.** A limiter outage must not take the API down; it
logs `critical` so it is never silent.

**Portable queue claim instead of `SKIP LOCKED`.** See §5.

---

## 5. Two findings from Phase 1 that change the plan

**`SKIP LOCKED` is unusable here.** The PROMPT 0 constraint specified
`SELECT … FOR UPDATE SKIP LOCKED`. That syntax arrived in **MariaDB 10.6**, and
Hostinger shared hosting commonly runs 10.4/10.5. On those it is a hard syntax
error, so the queue — and therefore every AI reply — silently never runs.
Verified against MariaDB 10.4.28. `JobRunner::claim()` now stamps a batch with a
unique claim token in a single atomic `UPDATE … ORDER BY … LIMIT`, then reads
back its own rows. Works on MySQL 5.7+ and MariaDB 10.3+. The tradeoff is brief
row-lock contention between concurrent workers instead of stepping over locked
rows; at this scale that is milliseconds.

**Decide the production PHP version before Phase 3.** `composer.json` pins
`config.platform.php` to the deploy target so dependencies resolve for
production rather than for whatever is on the dev box. The dev box here is
XAMPP PHP **8.0.28**, which is end-of-life. Select 8.2 or 8.3 in hPanel, match
`config.platform.php` to it, and upgrade local PHP — then re-enable
`config.platform-check`.

---

## 6. Verification status

| Check | Result |
|---|---|
| `php cron/worker.php`, empty jobs table | `processed=0 failed=0 reclaimed=0`, **exit 0** |
| `GET /api/health` | `200 {"ok":true,"data":{"db":"up","version":"0.1.0",…}}` |
| `tests/smoke.php` | **45/45** — Crypto, Money, Validator, Router, Response, Request |
| `tests/queue_probe.php` | **17/17** — dedupe, priority, retry/backoff, stale reclaim, heartbeat |
| `tests/tenant_isolation.php` | **31/31** — cross-tenant read/write/update/delete, raw-SQL guard, identifier injection, pagination |
| `GET /api/health/deep` | reports queue depth, cron staleness, migration drift |
| CORS preflight | 204 + ACAO for allowed origin; no ACAO for unknown origin |
| Routing | 404 for unknown path, **405** (not 404) for wrong method |
| Migrations | status → dry-run → apply → idempotent re-run → drift detection |
| Rate limiter with DB down | fails open, logs `critical` |

**Not yet verified:** nothing in this phase. Phase 3 adds the concurrency test
for quota races, which needs the `QuotaService` that phase introduces.

---

## 7. Local setup

```bash
cd backend/api
composer install
cp .env.example .env          # fill DB_*, then:
openssl rand -base64 48       # -> JWT_SECRET
openssl rand -base64 32       # -> CRYPTO_KEY
php cli/migrate.php
php tests/smoke.php && php tests/queue_probe.php && php tests/tenant_isolation.php
php -S localhost:8080 -t public

cd ../../apps/panel && npm install && npm run dev
```

Cron on Hostinger (hPanel → Advanced → Cron Jobs):

```
* * * * * /usr/bin/php /home/USER/api/cron/worker.php    >> /home/USER/api/storage/logs/cron.log 2>&1
* * * * * /usr/bin/php /home/USER/api/cron/scheduler.php >> /home/USER/api/storage/logs/cron.log 2>&1
```

Then point a monitor at `/api/health/deep?secret=…`. On shared hosting crons
die silently; that endpoint is how you find out before your customers do.
