-- 004_billing
-- Packages, subscriptions, metered usage, wallet. Subset of schema.sql.

CREATE TABLE IF NOT EXISTS packages (
  id                     BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name                   VARCHAR(80) NOT NULL,
  slug                   VARCHAR(80) NOT NULL UNIQUE,
  description            TEXT NULL,
  price                  DECIMAL(10,2) NOT NULL DEFAULT 0,
  duration_days          SMALLINT UNSIGNED NOT NULL DEFAULT 30,
  is_trial               TINYINT(1) NOT NULL DEFAULT 0,
  is_public              TINYINT(1) NOT NULL DEFAULT 1,
  is_active              TINYINT(1) NOT NULL DEFAULT 1,
  badge                  VARCHAR(40) NULL,
  sort_order             SMALLINT NOT NULL DEFAULT 0,
  msg_limit              INT UNSIGNED NULL,   -- NULL = unlimited, 0 = disabled
  comment_reply_limit    INT UNSIGNED NULL,
  faq_rule_limit         INT UNSIGNED NULL,
  product_limit          INT UNSIGNED NULL,
  staff_seat_limit       SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  voice_msg_limit        INT UNSIGNED NOT NULL DEFAULT 0,
  voice_duration_sec     SMALLINT UNSIGNED NOT NULL DEFAULT 300,
  fb_enabled             TINYINT(1) NOT NULL DEFAULT 1,
  wa_enabled             TINYINT(1) NOT NULL DEFAULT 0,
  ig_enabled             TINYINT(1) NOT NULL DEFAULT 0,
  widget_enabled         TINYINT(1) NOT NULL DEFAULT 0,
  voice_mode             ENUM('none','stt','both') NOT NULL DEFAULT 'none',
  courier_enabled        TINYINT(1) NOT NULL DEFAULT 1,
  shop_assistant_enabled TINYINT(1) NOT NULL DEFAULT 1,
  api_access_enabled     TINYINT(1) NOT NULL DEFAULT 0,
  ai_credit_type         ENUM('system','own_key') NOT NULL DEFAULT 'system',
  model_profile_id       BIGINT UNSIGNED NULL,
  extra_features         JSON NULL,
  created_at             TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at             TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS subscriptions (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id       BIGINT UNSIGNED NOT NULL,
  package_id      BIGINT UNSIGNED NOT NULL,
  status          ENUM('trialing','active','expired','cancelled') NOT NULL DEFAULT 'active',
  price_paid      DECIMAL(10,2) NOT NULL DEFAULT 0,
  started_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at      TIMESTAMP NOT NULL,
  auto_renew      TINYINT(1) NOT NULL DEFAULT 0,
  cancelled_at    TIMESTAMP NULL,
  -- Frozen copy of the package limits at purchase time, so a later admin edit
  -- to the package cannot retroactively change what a paying tenant bought.
  limits_snapshot JSON NOT NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_subs_tenant (tenant_id, status),
  KEY idx_subs_expiry (status, expires_at),
  CONSTRAINT fk_subs_tenant  FOREIGN KEY (tenant_id)  REFERENCES tenants(id) ON DELETE CASCADE,
  CONSTRAINT fk_subs_package FOREIGN KEY (package_id) REFERENCES packages(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- One row per subscription per billing cycle. Counters are incremented with a
-- single conditional UPDATE (see QuotaService) so concurrent webhooks cannot
-- both pass the last unit.
CREATE TABLE IF NOT EXISTS subscription_usage (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id       BIGINT UNSIGNED NOT NULL,
  subscription_id BIGINT UNSIGNED NOT NULL,
  cycle_start     DATE NOT NULL,
  cycle_end       DATE NOT NULL,
  fb_messages     INT UNSIGNED NOT NULL DEFAULT 0,
  wa_messages     INT UNSIGNED NOT NULL DEFAULT 0,
  ig_messages     INT UNSIGNED NOT NULL DEFAULT 0,
  web_messages    INT UNSIGNED NOT NULL DEFAULT 0,
  comment_replies INT UNSIGNED NOT NULL DEFAULT 0,
  faq_hits        INT UNSIGNED NOT NULL DEFAULT 0,
  voice_messages  INT UNSIGNED NOT NULL DEFAULT 0,
  ai_tokens_in    BIGINT UNSIGNED NOT NULL DEFAULT 0,
  ai_tokens_out   BIGINT UNSIGNED NOT NULL DEFAULT 0,
  ai_cost         DECIMAL(12,6) NOT NULL DEFAULT 0,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_usage_cycle (subscription_id, cycle_start),
  KEY idx_usage_tenant (tenant_id),
  CONSTRAINT fk_usage_sub FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS wallets (
  tenant_id            BIGINT UNSIGNED PRIMARY KEY,
  balance              DECIMAL(12,2) NOT NULL DEFAULT 0,
  lifetime_deposited   DECIMAL(12,2) NOT NULL DEFAULT 0,
  lifetime_spent       DECIMAL(12,2) NOT NULL DEFAULT 0,
  billing_mode         ENUM('subscription','credit') NOT NULL DEFAULT 'subscription',
  low_balance_alert_at DECIMAL(10,2) NOT NULL DEFAULT 100,
  updated_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_wallet_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id     BIGINT UNSIGNED NOT NULL,
  type          ENUM('deposit','spend','refund','bonus','adjustment') NOT NULL,
  amount        DECIMAL(12,4) NOT NULL,
  balance_after DECIMAL(12,2) NOT NULL,
  ref_type      VARCHAR(40) NULL,
  ref_id        BIGINT UNSIGNED NULL,
  description   VARCHAR(255) NULL,
  created_by    BIGINT UNSIGNED NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_wtx_tenant (tenant_id, created_at),
  CONSTRAINT fk_wtx_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
