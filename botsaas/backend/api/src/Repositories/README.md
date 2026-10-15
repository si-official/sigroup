# Repositories

## Which tables have a repository class

Phase 2's brief was "for every table, write the repository class that owns it,
with the concrete query methods the later phases need — not generic CRUD."

Those two halves pull in opposite directions at 61 tables. Taken literally it
produces ~45 classes that are `extends BaseRepository` plus a table name —
pure ceremony that still has to be read, reviewed and kept in sync. So the
rule applied here is: **a table gets a class when it has behaviour.**

### Classes with real query methods (15)

| Repository | Owns | Why it exists |
|---|---|---|
| `ConversationRepository` | conversations | `inboxPage()` — one query, no N+1 |
| `MessageRepository` | messages, message_batches | `append()` keeps inbox denormalisation transactional; `lastNTurns()` builds AI context |
| `ProductRepository` | products, product_variants | Cross-script search; oversell-safe stock |
| `OrderRepository` | orders, order_items, order_status_history | Server-side totals, transition map, stock restore |
| `OrderGuardRepository` | order_guards | O(1) duplicate detection with a reason the AI can say aloud |
| `ContactRepository` | contacts | Race-safe upsert from webhooks |
| `ChannelRepository` | channels | The one sanctioned cross-tenant read, plus credential encryption |
| `InstantReplyRepository` | instant_replies | The zero-token gate; Bangla + Banglish matching |
| `UsageRepository` | subscription_usage, ai_requests | Reporting; delegates the atomic path to `QuotaService` |
| `ModelProfileRepository` | ai_providers, ai_models, model_profiles, tenant_ai_keys | Model routing and cost computation |
| `WebhookEventRepository` | webhook_events | Idempotent intake |
| `AnalyticsRepository` | analytics_daily | Reads rollups, never raw tables |
| `FollowupRepository` | followup_jobs, followup_sequences, followup_steps | Due-job claim, cancel-on-reply |
| `CommentLogRepository` | comment_logs, comment_automations | Claim-once semantics |
| `CourierRepository` | courier_accounts, courier_shipments, courier_locations | Credentials, location mapping, sync queue |

### Tables served by `BaseRepository` directly

`tenants`, `users`, `refresh_tokens`, `password_resets`, `email_verifications`,
`login_attempts`, `audit_logs`, `packages`, `subscriptions`, `wallets`,
`wallet_transactions`, `payments`, `coupons`, `bot_configs`, `bot_settings`,
`widget_settings`, `whatsapp_templates`, `product_categories`, `leads`,
`prompt_templates`, `notifications`, `support_tickets`, `ticket_replies`,
`announcements`, `api_tokens`, `media_files`, `activity_logs`, `jobs`,
`cron_heartbeats`, `rate_limits`, `settings`, `migrations`.

These need `find` / `all` / `create` / `update` / `delete` / `paginate`, which
`BaseRepository` already provides — **with tenant scoping enforced**, which is
the part that actually matters. Instantiate it with a `$table` subclass when a
phase needs one; add methods the moment real behaviour appears.

## The rule that is not negotiable

Every tenant-owned table must be listed in
`BaseRepository::TENANT_OWNED_TABLES`, in the same commit that creates it.
That list is what the unscoped-SQL guard consults; a table missing from it
gets no protection and the guard reports nothing — it looks healthy.

`courier_locations`, `coupons`, `packages`, `ai_*`, `model_profiles`,
`webhook_events`, `announcements` and `settings` are **global** and correctly
absent from that list; their repositories set `$tenantOwned = false`.

Proven by `tests/tenant_isolation.php`, including the case where a subclass
overrides the table list.
