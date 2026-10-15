-- 006_ai
-- Model routing, token accounting, prompt library.
-- Continues from 005; 001-005 are already applied.

CREATE TABLE IF NOT EXISTS ai_providers (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug        VARCHAR(40) NOT NULL UNIQUE,
  label       VARCHAR(80) NOT NULL,
  base_url    VARCHAR(255) NULL,
  api_key_enc TEXT NULL,                       -- AES-256-GCM, platform key
  key_hint    VARCHAR(24) NULL,
  is_active   TINYINT(1) NOT NULL DEFAULT 1,
  last_ok_at  TIMESTAMP NULL,
  last_error  VARCHAR(500) NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ai_models (
  id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  provider_id         BIGINT UNSIGNED NOT NULL,
  model_id            VARCHAR(120) NOT NULL,   -- exact API string
  label               VARCHAR(80)  NOT NULL,
  kind                ENUM('chat','stt','tts','embedding','vision') NOT NULL DEFAULT 'chat',
  input_price_per_1m  DECIMAL(10,4) NOT NULL DEFAULT 0,
  output_price_per_1m DECIMAL(10,4) NOT NULL DEFAULT 0,
  cached_price_per_1m DECIMAL(10,4) NULL,      -- prompt-cache read rate
  context_window      INT UNSIGNED NULL,
  max_output_tokens   INT UNSIGNED NULL,
  supports_tools      TINYINT(1) NOT NULL DEFAULT 0,
  supports_vision     TINYINT(1) NOT NULL DEFAULT 0,
  supports_caching    TINYINT(1) NOT NULL DEFAULT 0,
  -- Pricing must be auditable: a stale rate silently corrupts every margin
  -- report. Admin edits stamp this; the panel flags anything older than 90d.
  price_verified_at   DATE NULL,
  price_source        VARCHAR(190) NULL,
  is_active           TINYINT(1) NOT NULL DEFAULT 1,
  created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_model (provider_id, model_id),
  KEY idx_model_kind (kind, is_active),
  CONSTRAINT fk_model_provider FOREIGN KEY (provider_id) REFERENCES ai_providers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- A profile = a named routing rule. Changing which model serves "customer
-- chat" is a DB edit, not a deploy. This is the feature competitors advertise
-- and do not actually have.
CREATE TABLE IF NOT EXISTS model_profiles (
  id                   BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name                 VARCHAR(80) NOT NULL,
  slug                 VARCHAR(80) NOT NULL UNIQUE,
  purpose              ENUM('chat','comment','shop_assistant','prompt_gen','classify','stt','tts') NOT NULL,
  primary_model_id     BIGINT UNSIGNED NOT NULL,
  fallback_model_id    BIGINT UNSIGNED NULL,
  temperature          DECIMAL(3,2) NOT NULL DEFAULT 0.40,
  max_output_tokens    SMALLINT UNSIGNED NOT NULL DEFAULT 600,
  effort               ENUM('low','medium','high','xhigh','max') NULL,
  is_default           TINYINT(1) NOT NULL DEFAULT 0,
  is_tenant_selectable TINYINT(1) NOT NULL DEFAULT 0,
  min_package_price    DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_mp_purpose (purpose, is_default),
  CONSTRAINT fk_mp_primary  FOREIGN KEY (primary_model_id)  REFERENCES ai_models(id),
  CONSTRAINT fk_mp_fallback FOREIGN KEY (fallback_model_id) REFERENCES ai_models(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tenant_ai_keys (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id   BIGINT UNSIGNED NOT NULL,
  provider_id BIGINT UNSIGNED NOT NULL,
  api_key_enc TEXT NOT NULL,
  key_hint    VARCHAR(24) NULL,
  is_active   TINYINT(1) NOT NULL DEFAULT 1,
  last_ok_at  TIMESTAMP NULL,
  last_error  VARCHAR(255) NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_tak (tenant_id, provider_id),
  CONSTRAINT fk_tak_tenant   FOREIGN KEY (tenant_id)   REFERENCES tenants(id) ON DELETE CASCADE,
  CONSTRAINT fk_tak_provider FOREIGN KEY (provider_id) REFERENCES ai_providers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ai_requests (
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
  KEY idx_air_tenant (tenant_id, created_at),
  KEY idx_air_conv (conversation_id),
  -- Admin cost dashboard groups by model and day across ALL tenants.
  KEY idx_air_model_day (model_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS prompt_templates (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id    BIGINT UNSIGNED NULL,           -- NULL = system library
  category     VARCHAR(50) NOT NULL,
  language     ENUM('bn','en') NOT NULL DEFAULT 'bn',
  title        VARCHAR(150) NOT NULL,
  body         MEDIUMTEXT NOT NULL,
  is_featured  TINYINT(1) NOT NULL DEFAULT 0,
  is_generator TINYINT(1) NOT NULL DEFAULT 0,
  use_count    INT UNSIGNED NOT NULL DEFAULT 0,
  sort_order   SMALLINT NOT NULL DEFAULT 0,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_pt_lookup (tenant_id, category, language),
  KEY idx_pt_featured (language, is_featured, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
