-- 007_channels
-- Channel connections and the website widget. bot_configs/bot_settings
-- already shipped in 005 (registration provisions them).

CREATE TABLE IF NOT EXISTS channels (
  id               BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id        BIGINT UNSIGNED NOT NULL,
  type             ENUM('messenger','whatsapp','instagram','website') NOT NULL,
  display_name     VARCHAR(150) NULL,
  external_id      VARCHAR(120) NULL,          -- page_id / phone_number_id / ig_id / widget_key
  credentials_enc  TEXT NULL,                  -- AES-GCM bundle
  verify_token     VARCHAR(64) NULL,
  status           ENUM('connected','disconnected','error','token_expired') NOT NULL DEFAULT 'disconnected',
  last_error       VARCHAR(500) NULL,
  token_expires_at TIMESTAMP NULL,
  last_checked_at  TIMESTAMP NULL,
  is_active        TINYINT(1) NOT NULL DEFAULT 1,
  connected_at     TIMESTAMP NULL,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  -- One webhook URL serves every tenant, so the inbound page/phone id must
  -- resolve to exactly one channel. This unique index IS that guarantee.
  UNIQUE KEY uq_channel_ext (type, external_id),
  KEY idx_channel_tenant (tenant_id, type),
  -- Token-health cron scans by expiry across all tenants.
  KEY idx_channel_expiry (status, token_expires_at),
  CONSTRAINT fk_channel_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS widget_settings (
  tenant_id       BIGINT UNSIGNED PRIMARY KEY,
  widget_key      CHAR(32) NOT NULL UNIQUE,
  allowed_domains JSON NULL,
  theme           JSON NULL,
  greeting        VARCHAR(500) NULL,
  pre_chat_fields JSON NULL,
  offline_message VARCHAR(500) NULL,
  is_active       TINYINT(1) NOT NULL DEFAULT 1,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_widget_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- WhatsApp template registry. Outside the 24h customer-service window only an
-- APPROVED template may be sent; without this table the service layer cannot
-- check that before calling Meta, and the send fails at the provider instead.
CREATE TABLE IF NOT EXISTS whatsapp_templates (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id     BIGINT UNSIGNED NOT NULL,
  channel_id    BIGINT UNSIGNED NOT NULL,
  name          VARCHAR(120) NOT NULL,
  language      VARCHAR(10) NOT NULL DEFAULT 'bn',
  category      VARCHAR(40) NULL,
  body          TEXT NULL,
  variables     JSON NULL,
  status        ENUM('pending','approved','rejected','paused','disabled') NOT NULL DEFAULT 'pending',
  rejected_reason VARCHAR(255) NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_watpl (channel_id, name, language),
  KEY idx_watpl_tenant (tenant_id, status),
  CONSTRAINT fk_watpl_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
