-- =====================================================================
-- BOT SaaS — Full MySQL 8 Schema (multi-tenant AI chat commerce platform)
-- Target: Hostinger MySQL 8 / MariaDB 10.6+, InnoDB, utf8mb4
-- Convention: every tenant-owned row carries tenant_id. NEVER query
--             without a tenant_id filter in application code.
-- =====================================================================
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================ 1. IDENTITY & TENANCY ==================

CREATE TABLE tenants (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(150) NOT NULL,
  slug            VARCHAR(80)  NOT NULL UNIQUE,
  owner_user_id   BIGINT UNSIGNED NULL,
  business_type   VARCHAR(60)  NULL,
  phone           VARCHAR(30)  NULL,
  address         TEXT NULL,
  timezone        VARCHAR(64)  NOT NULL DEFAULT 'Asia/Dhaka',
  currency        CHAR(3)      NOT NULL DEFAULT 'BDT',
  status          ENUM('active','suspended','deleted') NOT NULL DEFAULT 'active',
  suspended_reason VARCHAR(255) NULL,
  onboarding_step  TINYINT UNSIGNED NOT NULL DEFAULT 0,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at      TIMESTAMP NULL,
  INDEX idx_tenants_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE users (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id       BIGINT UNSIGNED NULL,          -- NULL = platform staff
  name            VARCHAR(120) NOT NULL,
  email           VARCHAR(190) NOT NULL UNIQUE,
  phone           VARCHAR(30)  NULL,
  password_hash   VARCHAR(255) NOT NULL,
  role            ENUM('super_admin','platform_support','tenant_owner','tenant_manager','tenant_agent') NOT NULL,
  status          ENUM('active','invited','disabled') NOT NULL DEFAULT 'active',
  avatar_url      VARCHAR(500) NULL,
  locale          ENUM('bn','en') NOT NULL DEFAULT 'bn',
  two_fa_secret   VARCHAR(64) NULL,
  email_verified_at TIMESTAMP NULL,
  last_login_at   TIMESTAMP NULL,
  last_login_ip   VARCHAR(45) NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_tenant (tenant_id, status),
  CONSTRAINT fk_users_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE refresh_tokens (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id       BIGINT UNSIGNED NOT NULL,
  token_hash    CHAR(64) NOT NULL UNIQUE,
  device_label  VARCHAR(120) NULL,
  ip            VARCHAR(45) NULL,
  expires_at    TIMESTAMP NOT NULL,
  revoked_at    TIMESTAMP NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_rt_user (user_id, revoked_at),
  CONSTRAINT fk_rt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE password_resets (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email       VARCHAR(190) NOT NULL,
  token_hash  CHAR(64) NOT NULL,
  expires_at  TIMESTAMP NOT NULL,
  used_at     TIMESTAMP NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_pr_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE audit_logs (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id     BIGINT UNSIGNED NULL,
  actor_user_id BIGINT UNSIGNED NULL,
  actor_type    ENUM('user','system','ai','webhook') NOT NULL DEFAULT 'user',
  action        VARCHAR(80) NOT NULL,
  entity_type   VARCHAR(60) NULL,
  entity_id     BIGINT UNSIGNED NULL,
  before_json   JSON NULL,
  after_json    JSON NULL,
  ip            VARCHAR(45) NULL,
  user_agent    VARCHAR(255) NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_tenant (tenant_id, created_at),
  INDEX idx_audit_entity (entity_type, entity_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================ 2. BILLING & PACKAGES ==================

CREATE TABLE packages (
  id                   BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name                 VARCHAR(80) NOT NULL,
  slug                 VARCHAR(80) NOT NULL UNIQUE,
  description          TEXT NULL,
  price                DECIMAL(10,2) NOT NULL DEFAULT 0,
  duration_days        SMALLINT UNSIGNED NOT NULL DEFAULT 30,
  is_trial             TINYINT(1) NOT NULL DEFAULT 0,
  is_public            TINYINT(1) NOT NULL DEFAULT 1,
  is_active            TINYINT(1) NOT NULL DEFAULT 1,
  badge                VARCHAR(40) NULL,            -- 'Most Popular'
  sort_order           SMALLINT NOT NULL DEFAULT 0,
  -- hard numeric limits (0 = disabled, NULL = unlimited)
  msg_limit            INT UNSIGNED NULL,
  comment_reply_limit  INT UNSIGNED NULL,
  faq_rule_limit       INT UNSIGNED NULL,
  product_limit        INT UNSIGNED NULL,
  staff_seat_limit     SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  voice_msg_limit      INT UNSIGNED NOT NULL DEFAULT 0,
  voice_duration_sec   SMALLINT UNSIGNED NOT NULL DEFAULT 300,
  -- channel + feature gates
  fb_enabled           TINYINT(1) NOT NULL DEFAULT 1,
  wa_enabled           TINYINT(1) NOT NULL DEFAULT 0,
  ig_enabled           TINYINT(1) NOT NULL DEFAULT 0,
  widget_enabled       TINYINT(1) NOT NULL DEFAULT 0,
  voice_mode           ENUM('none','stt','both') NOT NULL DEFAULT 'none',
  courier_enabled      TINYINT(1) NOT NULL DEFAULT 1,
  shop_assistant_enabled TINYINT(1) NOT NULL DEFAULT 1,
  api_access_enabled   TINYINT(1) NOT NULL DEFAULT 0,
  ai_credit_type       ENUM('system','own_key') NOT NULL DEFAULT 'system',
  model_profile_id     BIGINT UNSIGNED NULL,        -- which model tier this plan gets
  extra_features       JSON NULL,
  created_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE subscriptions (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id     BIGINT UNSIGNED NOT NULL,
  package_id    BIGINT UNSIGNED NOT NULL,
  status        ENUM('trialing','active','expired','cancelled') NOT NULL DEFAULT 'active',
  price_paid    DECIMAL(10,2) NOT NULL DEFAULT 0,
  started_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at    TIMESTAMP NOT NULL,
  auto_renew    TINYINT(1) NOT NULL DEFAULT 0,
  cancelled_at  TIMESTAMP NULL,
  -- snapshot of limits at purchase time, so later package edits don't
  -- retroactively change what a paying tenant bought
  limits_snapshot JSON NOT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_subs_tenant (tenant_id, status),
  INDEX idx_subs_expiry (status, expires_at),
  CONSTRAINT fk_subs_tenant  FOREIGN KEY (tenant_id)  REFERENCES tenants(id)  ON DELETE CASCADE,
  CONSTRAINT fk_subs_package FOREIGN KEY (package_id) REFERENCES packages(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE subscription_usage (
  id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id         BIGINT UNSIGNED NOT NULL,
  subscription_id   BIGINT UNSIGNED NOT NULL,
  cycle_start       DATE NOT NULL,
  cycle_end         DATE NOT NULL,
  fb_messages       INT UNSIGNED NOT NULL DEFAULT 0,
  wa_messages       INT UNSIGNED NOT NULL DEFAULT 0,
  ig_messages       INT UNSIGNED NOT NULL DEFAULT 0,
  web_messages      INT UNSIGNED NOT NULL DEFAULT 0,
  comment_replies   INT UNSIGNED NOT NULL DEFAULT 0,
  faq_hits          INT UNSIGNED NOT NULL DEFAULT 0,
  voice_messages    INT UNSIGNED NOT NULL DEFAULT 0,
  ai_tokens_in      BIGINT UNSIGNED NOT NULL DEFAULT 0,
  ai_tokens_out     BIGINT UNSIGNED NOT NULL DEFAULT 0,
  ai_cost           DECIMAL(12,6) NOT NULL DEFAULT 0,
  updated_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_usage_cycle (subscription_id, cycle_start),
  INDEX idx_usage_tenant (tenant_id),
  CONSTRAINT fk_usage_sub FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE wallets (
  tenant_id           BIGINT UNSIGNED PRIMARY KEY,
  balance             DECIMAL(12,2) NOT NULL DEFAULT 0,
  lifetime_deposited  DECIMAL(12,2) NOT NULL DEFAULT 0,
  lifetime_spent      DECIMAL(12,2) NOT NULL DEFAULT 0,
  billing_mode        ENUM('subscription','credit') NOT NULL DEFAULT 'subscription',
  low_balance_alert_at DECIMAL(10,2) NOT NULL DEFAULT 100,
  updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_wallet_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE wallet_transactions (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id     BIGINT UNSIGNED NOT NULL,
  type          ENUM('deposit','spend','refund','bonus','adjustment') NOT NULL,
  amount        DECIMAL(12,4) NOT NULL,       -- signed
  balance_after DECIMAL(12,2) NOT NULL,
  ref_type      VARCHAR(40) NULL,             -- 'ai_request','payment','order'
  ref_id        BIGINT UNSIGNED NULL,
  description   VARCHAR(255) NULL,
  created_by    BIGINT UNSIGNED NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_wtx_tenant (tenant_id, created_at),
  CONSTRAINT fk_wtx_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE payments (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id       BIGINT UNSIGNED NOT NULL,
  gateway         ENUM('bkash','nagad','sslcommerz','stripe','manual') NOT NULL,
  purpose         ENUM('subscription','wallet_topup') NOT NULL,
  package_id      BIGINT UNSIGNED NULL,
  amount          DECIMAL(12,2) NOT NULL,
  currency        CHAR(3) NOT NULL DEFAULT 'BDT',
  invoice_no      VARCHAR(40) NOT NULL UNIQUE,
  gateway_txn_id  VARCHAR(120) NULL,
  payer_account   VARCHAR(40) NULL,            -- bKash/Nagad sender number
  status          ENUM('pending','success','failed','refunded','manual_review') NOT NULL DEFAULT 'pending',
  proof_url       VARCHAR(500) NULL,           -- manual deposit screenshot
  gateway_payload JSON NULL,
  verified_by     BIGINT UNSIGNED NULL,
  verified_at     TIMESTAMP NULL,
  coupon_code     VARCHAR(40) NULL,
  discount        DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_pay_tenant (tenant_id, status),
  INDEX idx_pay_txn (gateway, gateway_txn_id),
  CONSTRAINT fk_pay_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE coupons (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code            VARCHAR(40) NOT NULL UNIQUE,
  type            ENUM('percent','fixed') NOT NULL,
  value           DECIMAL(10,2) NOT NULL,
  max_redemptions INT UNSIGNED NULL,
  used_count      INT UNSIGNED NOT NULL DEFAULT 0,
  applies_to      JSON NULL,                   -- package ids
  starts_at       TIMESTAMP NULL,
  expires_at      TIMESTAMP NULL,
  is_active       TINYINT(1) NOT NULL DEFAULT 1,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================ 3. AI LAYER ============================

CREATE TABLE ai_providers (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug            VARCHAR(40) NOT NULL UNIQUE, -- anthropic, openai, google, groq, openrouter
  label           VARCHAR(80) NOT NULL,
  base_url        VARCHAR(255) NULL,
  api_key_enc     TEXT NULL,                   -- AES-256-GCM, platform key
  is_active       TINYINT(1) NOT NULL DEFAULT 1,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE ai_models (
  id                   BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  provider_id          BIGINT UNSIGNED NOT NULL,
  model_id             VARCHAR(120) NOT NULL,  -- exact API string
  label                VARCHAR(80) NOT NULL,
  kind                 ENUM('chat','stt','tts','embedding','vision') NOT NULL DEFAULT 'chat',
  input_price_per_1m   DECIMAL(10,4) NOT NULL DEFAULT 0,
  output_price_per_1m  DECIMAL(10,4) NOT NULL DEFAULT 0,
  context_window       INT UNSIGNED NULL,
  supports_tools       TINYINT(1) NOT NULL DEFAULT 0,
  supports_vision      TINYINT(1) NOT NULL DEFAULT 0,
  is_active            TINYINT(1) NOT NULL DEFAULT 1,
  UNIQUE KEY uq_model (provider_id, model_id),
  CONSTRAINT fk_model_provider FOREIGN KEY (provider_id) REFERENCES ai_providers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- A profile = a named routing rule. Admin changes models here with zero
-- code deploy. This is what lets you honestly advertise "choose your model".
CREATE TABLE model_profiles (
  id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name              VARCHAR(80) NOT NULL,
  purpose           ENUM('chat','comment','shop_assistant','prompt_gen','classify','stt','tts') NOT NULL,
  primary_model_id  BIGINT UNSIGNED NOT NULL,
  fallback_model_id BIGINT UNSIGNED NULL,
  temperature       DECIMAL(3,2) NOT NULL DEFAULT 0.40,
  max_output_tokens SMALLINT UNSIGNED NOT NULL DEFAULT 600,
  is_default        TINYINT(1) NOT NULL DEFAULT 0,
  is_tenant_selectable TINYINT(1) NOT NULL DEFAULT 0,
  created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_mp_primary  FOREIGN KEY (primary_model_id)  REFERENCES ai_models(id),
  CONSTRAINT fk_mp_fallback FOREIGN KEY (fallback_model_id) REFERENCES ai_models(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE tenant_ai_keys (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id   BIGINT UNSIGNED NOT NULL,
  provider_id BIGINT UNSIGNED NOT NULL,
  api_key_enc TEXT NOT NULL,
  key_hint    VARCHAR(20) NULL,                -- 'sk-...4f2a' for display
  is_active   TINYINT(1) NOT NULL DEFAULT 1,
  last_ok_at  TIMESTAMP NULL,
  last_error  VARCHAR(255) NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_tak (tenant_id, provider_id),
  CONSTRAINT fk_tak_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE ai_requests (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id       BIGINT UNSIGNED NOT NULL,
  conversation_id BIGINT UNSIGNED NULL,
  model_id        BIGINT UNSIGNED NOT NULL,
  purpose         VARCHAR(30) NOT NULL,
  tokens_in       INT UNSIGNED NOT NULL DEFAULT 0,
  tokens_out      INT UNSIGNED NOT NULL DEFAULT 0,
  cached_tokens   INT UNSIGNED NOT NULL DEFAULT 0,
  cost            DECIMAL(12,6) NOT NULL DEFAULT 0,
  latency_ms      INT UNSIGNED NULL,
  tool_calls      SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  status          ENUM('ok','error','timeout','refused','fallback_used') NOT NULL DEFAULT 'ok',
  error_message   VARCHAR(500) NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_air_tenant (tenant_id, created_at),
  INDEX idx_air_conv (conversation_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE prompt_templates (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id    BIGINT UNSIGNED NULL,           -- NULL = system library
  category     VARCHAR(50) NOT NULL,           -- ecommerce, food, education...
  language     ENUM('bn','en') NOT NULL DEFAULT 'bn',
  title        VARCHAR(150) NOT NULL,
  body         MEDIUMTEXT NOT NULL,
  is_featured  TINYINT(1) NOT NULL DEFAULT 0,
  is_generator TINYINT(1) NOT NULL DEFAULT 0,  -- interview-style prompt builder
  use_count    INT UNSIGNED NOT NULL DEFAULT 0,
  sort_order   SMALLINT NOT NULL DEFAULT 0,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_pt_lookup (tenant_id, category, language)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================ 4. CHANNELS & BOT CONFIG ===============

CREATE TABLE channels (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id       BIGINT UNSIGNED NOT NULL,
  type            ENUM('messenger','whatsapp','instagram','website') NOT NULL,
  display_name    VARCHAR(150) NULL,
  external_id     VARCHAR(120) NULL,           -- page_id / phone_number_id / ig_id / widget_key
  credentials_enc TEXT NULL,                   -- AES-GCM {page_access_token, app_secret, ...}
  verify_token    VARCHAR(64) NULL,
  status          ENUM('connected','disconnected','error','token_expired') NOT NULL DEFAULT 'disconnected',
  last_error      VARCHAR(500) NULL,
  token_expires_at TIMESTAMP NULL,
  is_active       TINYINT(1) NOT NULL DEFAULT 1,
  connected_at    TIMESTAMP NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_channel_ext (type, external_id),
  INDEX idx_channel_tenant (tenant_id, type),
  CONSTRAINT fk_channel_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE bot_configs (
  id                   BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id            BIGINT UNSIGNED NOT NULL,
  channel_id           BIGINT UNSIGNED NULL,    -- NULL = tenant-wide default
  system_prompt        MEDIUMTEXT NULL,
  language             ENUM('auto','bn','en','banglish') NOT NULL DEFAULT 'auto',
  memory_turns         TINYINT UNSIGNED NOT NULL DEFAULT 10,
  model_profile_id     BIGINT UNSIGNED NULL,
  reply_delay_enabled  TINYINT(1) NOT NULL DEFAULT 1,
  reply_delay_sec      TINYINT UNSIGNED NOT NULL DEFAULT 3,
  batching_enabled     TINYINT(1) NOT NULL DEFAULT 1,
  batching_window_sec  TINYINT UNSIGNED NOT NULL DEFAULT 8,
  daily_max_messages   INT UNSIGNED NULL,
  ai_enabled           TINYINT(1) NOT NULL DEFAULT 1,
  send_typing_indicator TINYINT(1) NOT NULL DEFAULT 1,
  updated_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_botcfg (tenant_id, channel_id),
  CONSTRAINT fk_botcfg_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- All the small on/off settings in one row per tenant+scope, as JSON groups.
CREATE TABLE bot_settings (
  id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id         BIGINT UNSIGNED NOT NULL,
  channel_scope     ENUM('all','messenger','whatsapp','instagram','website') NOT NULL DEFAULT 'all',
  human_takeover    JSON NULL,  -- {enabled, pause_minutes}
  schedule          JSON NULL,  -- {enabled, timezone, days:{mon:{open,close}}, off_hours_message}
  keyword_filter    JSON NULL,  -- {enabled, blocked:[], autoreply:[{keywords,text}]}
  order_protection  JSON NULL,  -- {enabled, same_conv_min, same_phone_min, daily_limit, require_phone, keep_ai_active}
  delivery_pricing  JSON NULL,  -- {inside_dhaka, outside_dhaka, free_above, eta_days}
  escalation        JSON NULL,  -- {enabled, triggers:[], notify_user_ids:[]}
  updated_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_botset (tenant_id, channel_scope),
  CONSTRAINT fk_botset_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE widget_settings (
  tenant_id       BIGINT UNSIGNED PRIMARY KEY,
  widget_key      CHAR(32) NOT NULL UNIQUE,
  allowed_domains JSON NULL,
  theme           JSON NULL,   -- {primary, position, radius, avatar_url, launcher_text}
  greeting        VARCHAR(500) NULL,
  pre_chat_fields JSON NULL,   -- [{key,label,required,type}]
  offline_message VARCHAR(500) NULL,
  is_active       TINYINT(1) NOT NULL DEFAULT 1,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_widget_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================ 5. CONVERSATIONS =======================

CREATE TABLE contacts (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id     BIGINT UNSIGNED NOT NULL,
  channel_id    BIGINT UNSIGNED NOT NULL,
  external_id   VARCHAR(120) NOT NULL,         -- PSID / wa_id / ig_id / visitor_uuid
  name          VARCHAR(150) NULL,
  phone         VARCHAR(30) NULL,
  email         VARCHAR(190) NULL,
  address       TEXT NULL,
  district      VARCHAR(60) NULL,
  avatar_url    VARCHAR(500) NULL,
  locale        VARCHAR(10) NULL,
  tags          JSON NULL,
  notes         TEXT NULL,
  lifetime_orders   INT UNSIGNED NOT NULL DEFAULT 0,
  lifetime_value    DECIMAL(12,2) NOT NULL DEFAULT 0,
  is_blocked    TINYINT(1) NOT NULL DEFAULT 0,
  first_seen_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen_at  TIMESTAMP NULL,
  UNIQUE KEY uq_contact (channel_id, external_id),
  INDEX idx_contact_tenant (tenant_id),
  INDEX idx_contact_phone (tenant_id, phone),
  CONSTRAINT fk_contact_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE conversations (
  id               BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id        BIGINT UNSIGNED NOT NULL,
  channel_id       BIGINT UNSIGNED NOT NULL,
  contact_id       BIGINT UNSIGNED NOT NULL,
  status           ENUM('open','active','resolved','spam') NOT NULL DEFAULT 'open',
  is_starred       TINYINT(1) NOT NULL DEFAULT 0,
  ai_enabled       TINYINT(1) NOT NULL DEFAULT 1,
  ai_paused_until  TIMESTAMP NULL,              -- human takeover
  assigned_user_id BIGINT UNSIGNED NULL,
  unread_count     SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  message_count    INT UNSIGNED NOT NULL DEFAULT 0,
  summary          TEXT NULL,                   -- rolling summary for long chats
  summary_upto_id  BIGINT UNSIGNED NULL,
  last_message_at  TIMESTAMP NULL,
  last_intent      VARCHAR(40) NULL,
  meta             JSON NULL,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_conv_inbox (tenant_id, status, last_message_at),
  INDEX idx_conv_contact (contact_id),
  CONSTRAINT fk_conv_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE messages (
  id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id           BIGINT UNSIGNED NOT NULL,
  conversation_id     BIGINT UNSIGNED NOT NULL,
  direction           ENUM('in','out') NOT NULL,
  sender              ENUM('customer','ai','human','system') NOT NULL,
  sender_user_id      BIGINT UNSIGNED NULL,
  type                ENUM('text','image','audio','video','file','sticker','template','order_card','product_card') NOT NULL DEFAULT 'text',
  body                MEDIUMTEXT NULL,
  attachments         JSON NULL,
  external_message_id VARCHAR(190) NULL,
  reply_to_id         BIGINT UNSIGNED NULL,
  ai_request_id       BIGINT UNSIGNED NULL,
  source              ENUM('ai','instant_reply','followup','human','comment_dm','system') NULL,
  status              ENUM('queued','sent','delivered','read','failed') NOT NULL DEFAULT 'sent',
  error_message       VARCHAR(500) NULL,
  billed              TINYINT(1) NOT NULL DEFAULT 0,
  created_at          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX idx_msg_conv (conversation_id, id),
  INDEX idx_msg_tenant_time (tenant_id, created_at),
  UNIQUE KEY uq_msg_external (conversation_id, external_message_id),
  CONSTRAINT fk_msg_conv FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Holds inbound messages inside the batching window before one AI call.
CREATE TABLE message_batches (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  conversation_id BIGINT UNSIGNED NOT NULL UNIQUE,
  message_ids     JSON NOT NULL,
  flush_at        TIMESTAMP(3) NOT NULL,
  status          ENUM('pending','processing','done') NOT NULL DEFAULT 'pending',
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_batch_flush (status, flush_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE voice_messages (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id    BIGINT UNSIGNED NOT NULL,
  message_id   BIGINT UNSIGNED NOT NULL,
  direction    ENUM('in','out') NOT NULL,
  audio_url    VARCHAR(500) NOT NULL,
  duration_sec SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  transcript   TEXT NULL,
  stt_model_id BIGINT UNSIGNED NULL,
  tts_model_id BIGINT UNSIGNED NULL,
  cost         DECIMAL(10,6) NOT NULL DEFAULT 0,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_voice_tenant (tenant_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================ 6. CATALOG & ORDERS ====================

CREATE TABLE product_categories (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id  BIGINT UNSIGNED NOT NULL,
  name       VARCHAR(120) NOT NULL,
  slug       VARCHAR(120) NOT NULL,
  sort_order SMALLINT NOT NULL DEFAULT 0,
  UNIQUE KEY uq_cat (tenant_id, slug),
  CONSTRAINT fk_cat_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE products (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id    BIGINT UNSIGNED NOT NULL,
  category_id  BIGINT UNSIGNED NULL,
  sku          VARCHAR(60) NULL,
  name         VARCHAR(200) NOT NULL,
  description  TEXT NULL,
  price        DECIMAL(12,2) NOT NULL DEFAULT 0,
  sale_price   DECIMAL(12,2) NULL,
  cost_price   DECIMAL(12,2) NULL,
  stock        INT NOT NULL DEFAULT 0,
  track_stock  TINYINT(1) NOT NULL DEFAULT 1,
  images       JSON NULL,
  attributes   JSON NULL,
  ai_keywords  TEXT NULL,                   -- extra synonyms to help retrieval
  ai_note      TEXT NULL,                   -- "never discount this", etc.
  status       ENUM('active','draft','out_of_stock','archived') NOT NULL DEFAULT 'active',
  sort_order   SMALLINT NOT NULL DEFAULT 0,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_prod_tenant (tenant_id, status),
  FULLTEXT KEY ft_prod (name, description, ai_keywords),
  CONSTRAINT fk_prod_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE product_variants (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id  BIGINT UNSIGNED NOT NULL,
  option_name VARCHAR(60) NOT NULL,          -- 'Size'
  option_value VARCHAR(60) NOT NULL,         -- 'XL'
  sku         VARCHAR(60) NULL,
  price_delta DECIMAL(10,2) NOT NULL DEFAULT 0,
  stock       INT NOT NULL DEFAULT 0,
  INDEX idx_var_product (product_id),
  CONSTRAINT fk_var_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE orders (
  id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id         BIGINT UNSIGNED NOT NULL,
  order_no          VARCHAR(30) NOT NULL,
  conversation_id   BIGINT UNSIGNED NULL,
  contact_id        BIGINT UNSIGNED NULL,
  channel_type      ENUM('messenger','whatsapp','instagram','website','manual') NOT NULL,
  customer_name     VARCHAR(150) NULL,
  phone             VARCHAR(30) NULL,
  alt_phone         VARCHAR(30) NULL,
  address           TEXT NULL,
  district          VARCHAR(60) NULL,
  thana             VARCHAR(60) NULL,
  items_total       DECIMAL(12,2) NOT NULL DEFAULT 0,
  delivery_charge   DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount          DECIMAL(10,2) NOT NULL DEFAULT 0,
  advance_paid      DECIMAL(10,2) NOT NULL DEFAULT 0,
  total             DECIMAL(12,2) NOT NULL DEFAULT 0,
  payment_method    ENUM('cod','bkash','nagad','rocket','bank','prepaid') NOT NULL DEFAULT 'cod',
  payment_status    ENUM('unpaid','partial','paid','refunded') NOT NULL DEFAULT 'unpaid',
  status            ENUM('new','confirmed','processing','hold','courier','completed','cancelled','returned') NOT NULL DEFAULT 'new',
  cancel_reason     VARCHAR(255) NULL,
  note              TEXT NULL,
  internal_note     TEXT NULL,
  created_by        ENUM('ai','human','api') NOT NULL DEFAULT 'ai',
  created_by_user_id BIGINT UNSIGNED NULL,
  confirmed_at      TIMESTAMP NULL,
  shipped_at        TIMESTAMP NULL,
  completed_at      TIMESTAMP NULL,
  created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_order_no (tenant_id, order_no),
  INDEX idx_order_board (tenant_id, status, created_at),
  INDEX idx_order_phone (tenant_id, phone),
  CONSTRAINT fk_order_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE order_items (
  id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id       BIGINT UNSIGNED NOT NULL,
  product_id     BIGINT UNSIGNED NULL,
  variant_id     BIGINT UNSIGNED NULL,
  name_snapshot  VARCHAR(200) NOT NULL,
  variant_label  VARCHAR(120) NULL,
  unit_price     DECIMAL(12,2) NOT NULL,
  qty            SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  subtotal       DECIMAL(12,2) NOT NULL,
  INDEX idx_oi_order (order_id),
  CONSTRAINT fk_oi_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE order_status_history (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id     BIGINT UNSIGNED NOT NULL,
  from_status  VARCHAR(20) NULL,
  to_status    VARCHAR(20) NOT NULL,
  actor_type   ENUM('user','ai','courier','system') NOT NULL DEFAULT 'user',
  actor_user_id BIGINT UNSIGNED NULL,
  note         VARCHAR(255) NULL,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_osh_order (order_id, created_at),
  CONSTRAINT fk_osh_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Dedupe ledger for order protection (cheap lookups, no table scan)
CREATE TABLE order_guards (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id     BIGINT UNSIGNED NOT NULL,
  guard_key     VARCHAR(120) NOT NULL,        -- 'phone:0171...' or 'conv:1234'
  order_count   SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  window_date   DATE NOT NULL,
  last_order_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_guard (tenant_id, guard_key, window_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE leads (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id       BIGINT UNSIGNED NOT NULL,
  conversation_id BIGINT UNSIGNED NULL,
  contact_id      BIGINT UNSIGNED NULL,
  name            VARCHAR(150) NULL,
  phone           VARCHAR(30) NULL,
  address         TEXT NULL,
  interest        VARCHAR(255) NULL,
  source_channel  ENUM('messenger','whatsapp','instagram','website','comment') NULL,
  status          ENUM('pending','processing','responded','completed','cancelled') NOT NULL DEFAULT 'pending',
  score           TINYINT UNSIGNED NULL,
  assigned_to     BIGINT UNSIGNED NULL,
  note            TEXT NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_lead_tenant (tenant_id, status, created_at),
  CONSTRAINT fk_lead_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================ 7. COURIER =============================

CREATE TABLE courier_accounts (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id       BIGINT UNSIGNED NOT NULL,
  provider        ENUM('steadfast','pathao','redx','paperfly','ecourier') NOT NULL,
  env             ENUM('sandbox','production') NOT NULL DEFAULT 'production',
  credentials_enc TEXT NOT NULL,
  store_id        VARCHAR(60) NULL,
  access_token    TEXT NULL,
  token_expires_at TIMESTAMP NULL,
  is_active       TINYINT(1) NOT NULL DEFAULT 0,
  is_default      TINYINT(1) NOT NULL DEFAULT 0,
  last_error      VARCHAR(500) NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_courier (tenant_id, provider),
  CONSTRAINT fk_courier_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE courier_shipments (
  id                 BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id          BIGINT UNSIGNED NOT NULL,
  order_id           BIGINT UNSIGNED NOT NULL,
  courier_account_id BIGINT UNSIGNED NOT NULL,
  consignment_id     VARCHAR(80) NULL,
  tracking_code      VARCHAR(80) NULL,
  cod_amount         DECIMAL(12,2) NOT NULL DEFAULT 0,
  status             VARCHAR(40) NULL,
  status_updated_at  TIMESTAMP NULL,
  raw_response       JSON NULL,
  created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ship_order (order_id),
  INDEX idx_ship_track (tenant_id, tracking_code),
  CONSTRAINT fk_ship_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================ 8. AUTOMATION ==========================

CREATE TABLE instant_replies (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id     BIGINT UNSIGNED NOT NULL,
  channel_scope ENUM('all','messenger','whatsapp','instagram','website') NOT NULL DEFAULT 'all',
  title         VARCHAR(150) NULL,
  match_type    ENUM('exact','contains','starts_with','regex') NOT NULL DEFAULT 'contains',
  keywords      JSON NOT NULL,
  reply_text    TEXT NOT NULL,
  attachments   JSON NULL,
  stop_ai       TINYINT(1) NOT NULL DEFAULT 1,  -- true = zero AI cost
  priority      SMALLINT NOT NULL DEFAULT 0,
  hit_count     INT UNSIGNED NOT NULL DEFAULT 0,
  is_active     TINYINT(1) NOT NULL DEFAULT 1,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ir_tenant (tenant_id, is_active, priority),
  CONSTRAINT fk_ir_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE comment_automations (
  id               BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id        BIGINT UNSIGNED NOT NULL,
  channel_id       BIGINT UNSIGNED NOT NULL,
  name             VARCHAR(150) NULL,
  post_id          VARCHAR(120) NULL,            -- NULL = all posts
  trigger_type     ENUM('any','keywords') NOT NULL DEFAULT 'any',
  trigger_keywords JSON NULL,
  reply_mode       ENUM('static','ai','none') NOT NULL DEFAULT 'static',
  public_reply     TEXT NULL,
  public_reply_variants JSON NULL,               -- rotate to avoid Meta spam flags
  send_dm          TINYINT(1) NOT NULL DEFAULT 1,
  dm_mode          ENUM('static','ai') NOT NULL DEFAULT 'static',
  dm_text          TEXT NULL,
  hide_comment     TINYINT(1) NOT NULL DEFAULT 0,
  like_comment     TINYINT(1) NOT NULL DEFAULT 0,
  reply_once_per_user TINYINT(1) NOT NULL DEFAULT 1,
  daily_limit      INT UNSIGNED NULL,
  is_active        TINYINT(1) NOT NULL DEFAULT 1,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ca_tenant (tenant_id, is_active),
  CONSTRAINT fk_ca_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE comment_logs (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id     BIGINT UNSIGNED NOT NULL,
  automation_id BIGINT UNSIGNED NULL,
  post_id       VARCHAR(120) NULL,
  comment_id    VARCHAR(120) NOT NULL,
  commenter_id  VARCHAR(120) NULL,
  commenter_name VARCHAR(150) NULL,
  comment_text  TEXT NULL,
  replied       TINYINT(1) NOT NULL DEFAULT 0,
  reply_text    TEXT NULL,
  dm_sent       TINYINT(1) NOT NULL DEFAULT 0,
  hidden        TINYINT(1) NOT NULL DEFAULT 0,
  status        ENUM('ok','skipped','error','limit_reached') NOT NULL DEFAULT 'ok',
  error_message VARCHAR(500) NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_comment (tenant_id, comment_id),
  INDEX idx_cl_tenant (tenant_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE followup_sequences (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id     BIGINT UNSIGNED NOT NULL,
  name          VARCHAR(150) NOT NULL,
  channel_scope ENUM('all','messenger','whatsapp','instagram','website') NOT NULL DEFAULT 'all',
  trigger_on    ENUM('no_reply','abandoned_order','post_delivery') NOT NULL DEFAULT 'no_reply',
  default_delay_min INT UNSIGNED NOT NULL DEFAULT 60,
  default_instruction TEXT NULL,
  stop_on_reply TINYINT(1) NOT NULL DEFAULT 1,
  is_active     TINYINT(1) NOT NULL DEFAULT 1,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_fs_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE followup_steps (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  sequence_id BIGINT UNSIGNED NOT NULL,
  step_no     TINYINT UNSIGNED NOT NULL,
  delay_min   INT UNSIGNED NOT NULL,
  mode        ENUM('static','ai') NOT NULL DEFAULT 'static',
  message     TEXT NULL,
  instruction TEXT NULL,
  attachments JSON NULL,
  UNIQUE KEY uq_step (sequence_id, step_no),
  CONSTRAINT fk_fstep_seq FOREIGN KEY (sequence_id) REFERENCES followup_sequences(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE followup_jobs (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id       BIGINT UNSIGNED NOT NULL,
  conversation_id BIGINT UNSIGNED NOT NULL,
  sequence_id     BIGINT UNSIGNED NOT NULL,
  next_step       TINYINT UNSIGNED NOT NULL DEFAULT 1,
  run_at          TIMESTAMP NOT NULL,
  status          ENUM('pending','sent','cancelled','failed') NOT NULL DEFAULT 'pending',
  attempts        TINYINT UNSIGNED NOT NULL DEFAULT 0,
  last_error      VARCHAR(500) NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_fj_conv (conversation_id, sequence_id),
  INDEX idx_fj_due (status, run_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================ 9. PLATFORM / SYSTEM ===================

-- Cron-driven queue (works on shared hosting: 1-minute cron pulls batches)
CREATE TABLE jobs (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id     BIGINT UNSIGNED NULL,
  type          VARCHAR(60) NOT NULL,          -- ai.reply, send.message, courier.push
  payload       JSON NOT NULL,
  priority      TINYINT UNSIGNED NOT NULL DEFAULT 5,
  available_at  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  reserved_at   TIMESTAMP(3) NULL,
  reserved_by   VARCHAR(40) NULL,
  attempts      TINYINT UNSIGNED NOT NULL DEFAULT 0,
  max_attempts  TINYINT UNSIGNED NOT NULL DEFAULT 3,
  status        ENUM('pending','reserved','done','failed') NOT NULL DEFAULT 'pending',
  last_error    TEXT NULL,
  dedupe_key    VARCHAR(190) NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at  TIMESTAMP(3) NULL,
  UNIQUE KEY uq_job_dedupe (dedupe_key),
  INDEX idx_job_claim (status, priority, available_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE webhook_events (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  source        ENUM('messenger','whatsapp','instagram','widget','bkash','nagad','sslcommerz','steadfast','pathao') NOT NULL,
  external_id   VARCHAR(190) NULL,
  dedupe_hash   CHAR(64) NOT NULL,
  signature_valid TINYINT(1) NOT NULL DEFAULT 0,
  raw_payload   JSON NOT NULL,
  status        ENUM('received','processed','ignored','error') NOT NULL DEFAULT 'received',
  error_message VARCHAR(500) NULL,
  received_at   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  processed_at  TIMESTAMP(3) NULL,
  UNIQUE KEY uq_wh_dedupe (dedupe_hash),
  INDEX idx_wh_status (status, received_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE activity_logs (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id  BIGINT UNSIGNED NOT NULL,
  scope      ENUM('messenger','whatsapp','instagram','website','comment','courier','billing','system') NOT NULL,
  action     VARCHAR(80) NOT NULL,
  ref_type   VARCHAR(40) NULL,
  ref_id     BIGINT UNSIGNED NULL,
  status     ENUM('ok','warn','error') NOT NULL DEFAULT 'ok',
  message    VARCHAR(500) NULL,
  detail     JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_al_tenant (tenant_id, scope, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE analytics_daily (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id       BIGINT UNSIGNED NOT NULL,
  stat_date       DATE NOT NULL,
  messages_in     INT UNSIGNED NOT NULL DEFAULT 0,
  messages_out    INT UNSIGNED NOT NULL DEFAULT 0,
  ai_replies      INT UNSIGNED NOT NULL DEFAULT 0,
  human_replies   INT UNSIGNED NOT NULL DEFAULT 0,
  instant_replies INT UNSIGNED NOT NULL DEFAULT 0,
  new_contacts    INT UNSIGNED NOT NULL DEFAULT 0,
  conversations   INT UNSIGNED NOT NULL DEFAULT 0,
  orders_created  INT UNSIGNED NOT NULL DEFAULT 0,
  orders_completed INT UNSIGNED NOT NULL DEFAULT 0,
  revenue         DECIMAL(14,2) NOT NULL DEFAULT 0,
  ai_cost         DECIMAL(12,6) NOT NULL DEFAULT 0,
  hourly_messages JSON NULL,                   -- 24-slot array for peak-hours chart
  UNIQUE KEY uq_ad (tenant_id, stat_date),
  INDEX idx_ad_date (stat_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE notifications (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id  BIGINT UNSIGNED NULL,
  user_id    BIGINT UNSIGNED NULL,
  type       VARCHAR(50) NOT NULL,
  title      VARCHAR(190) NOT NULL,
  body       TEXT NULL,
  data       JSON NULL,
  severity   ENUM('info','success','warning','critical') NOT NULL DEFAULT 'info',
  read_at    TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_notif_user (user_id, read_at, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE support_tickets (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id   BIGINT UNSIGNED NOT NULL,
  user_id     BIGINT UNSIGNED NOT NULL,
  subject     VARCHAR(255) NOT NULL,
  category    VARCHAR(50) NULL,
  priority    ENUM('low','normal','high','urgent') NOT NULL DEFAULT 'normal',
  status      ENUM('open','pending','answered','closed') NOT NULL DEFAULT 'open',
  assigned_to BIGINT UNSIGNED NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_st_tenant (tenant_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE ticket_replies (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ticket_id  BIGINT UNSIGNED NOT NULL,
  user_id    BIGINT UNSIGNED NOT NULL,
  is_staff   TINYINT(1) NOT NULL DEFAULT 0,
  body       TEXT NOT NULL,
  attachments JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_tr_ticket (ticket_id),
  CONSTRAINT fk_tr_ticket FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE announcements (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(190) NOT NULL,
  body        TEXT NOT NULL,
  severity    ENUM('info','success','warning','critical') NOT NULL DEFAULT 'info',
  audience    ENUM('all','package','tenant') NOT NULL DEFAULT 'all',
  audience_ref JSON NULL,
  starts_at   TIMESTAMP NULL,
  ends_at     TIMESTAMP NULL,
  is_active   TINYINT(1) NOT NULL DEFAULT 1,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE api_tokens (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id    BIGINT UNSIGNED NOT NULL,
  name         VARCHAR(100) NOT NULL,
  token_hash   CHAR(64) NOT NULL UNIQUE,
  token_hint   VARCHAR(20) NULL,
  scopes       JSON NULL,
  rate_limit_per_min SMALLINT UNSIGNED NOT NULL DEFAULT 60,
  last_used_at TIMESTAMP NULL,
  revoked_at   TIMESTAMP NULL,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_at_tenant (tenant_id, revoked_at),
  CONSTRAINT fk_at_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE rate_limits (
  bucket_key   VARCHAR(190) NOT NULL PRIMARY KEY,
  hits         INT UNSIGNED NOT NULL DEFAULT 0,
  window_start TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at   TIMESTAMP NOT NULL,
  INDEX idx_rl_exp (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE settings (
  setting_key   VARCHAR(100) NOT NULL PRIMARY KEY,
  setting_value TEXT NULL,
  value_type    ENUM('string','int','bool','json','secret') NOT NULL DEFAULT 'string',
  group_name    VARCHAR(50) NULL,
  is_public     TINYINT(1) NOT NULL DEFAULT 0,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE media_files (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id  BIGINT UNSIGNED NULL,
  disk       ENUM('local','s3','r2') NOT NULL DEFAULT 'local',
  path       VARCHAR(500) NOT NULL,
  url        VARCHAR(500) NOT NULL,
  mime       VARCHAR(100) NULL,
  size_bytes INT UNSIGNED NULL,
  width      SMALLINT UNSIGNED NULL,
  height     SMALLINT UNSIGNED NULL,
  purpose    VARCHAR(40) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_media_tenant (tenant_id, purpose)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
-- RETENTION (run from cron, keeps shared-hosting DB small)
--   messages        : keep 12 months, then archive to cold table / S3
--   webhook_events  : keep 14 days
--   ai_requests     : keep 6 months (analytics_daily holds the rollup)
--   jobs (done)     : keep 7 days
--   activity_logs   : keep 90 days
--   rate_limits     : delete where expires_at < NOW()
-- =====================================================================
