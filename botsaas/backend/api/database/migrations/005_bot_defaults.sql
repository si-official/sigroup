-- 005_bot_defaults
-- Registration provisions a default bot_config + bot_settings, so these two
-- tables are needed here. The rest of the channels module ships in Phase 2/6.

CREATE TABLE IF NOT EXISTS bot_configs (
  id                    BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id             BIGINT UNSIGNED NOT NULL,
  channel_id            BIGINT UNSIGNED NULL,     -- NULL = tenant-wide default
  system_prompt         MEDIUMTEXT NULL,
  language              ENUM('auto','bn','en','banglish') NOT NULL DEFAULT 'auto',
  memory_turns          TINYINT UNSIGNED NOT NULL DEFAULT 10,
  model_profile_id      BIGINT UNSIGNED NULL,
  reply_delay_enabled   TINYINT(1) NOT NULL DEFAULT 1,
  reply_delay_sec       TINYINT UNSIGNED NOT NULL DEFAULT 3,
  batching_enabled      TINYINT(1) NOT NULL DEFAULT 1,
  batching_window_sec   TINYINT UNSIGNED NOT NULL DEFAULT 8,
  daily_max_messages    INT UNSIGNED NULL,
  ai_enabled            TINYINT(1) NOT NULL DEFAULT 1,
  send_typing_indicator TINYINT(1) NOT NULL DEFAULT 1,
  created_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_botcfg (tenant_id, channel_id),
  CONSTRAINT fk_botcfg_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS bot_settings (
  id               BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id        BIGINT UNSIGNED NOT NULL,
  channel_scope    ENUM('all','messenger','whatsapp','instagram','website') NOT NULL DEFAULT 'all',
  human_takeover   JSON NULL,
  schedule         JSON NULL,
  keyword_filter   JSON NULL,
  order_protection JSON NULL,
  delivery_pricing JSON NULL,
  escalation       JSON NULL,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_botset (tenant_id, channel_scope),
  CONSTRAINT fk_botset_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
