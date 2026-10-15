-- 008_conversations
-- The highest-volume tables in the system. Index choices here decide whether
-- the inbox stays usable at 100k messages.

CREATE TABLE IF NOT EXISTS contacts (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id       BIGINT UNSIGNED NOT NULL,
  channel_id      BIGINT UNSIGNED NOT NULL,
  external_id     VARCHAR(120) NOT NULL,       -- PSID / wa_id / ig_id / visitor uuid
  name            VARCHAR(150) NULL,
  phone           VARCHAR(30)  NULL,
  email           VARCHAR(190) NULL,
  address         TEXT NULL,
  district        VARCHAR(60) NULL,
  thana           VARCHAR(60) NULL,
  avatar_url      VARCHAR(500) NULL,
  locale          VARCHAR(10) NULL,
  tags            JSON NULL,
  notes           TEXT NULL,
  lifetime_orders INT UNSIGNED NOT NULL DEFAULT 0,
  lifetime_value  DECIMAL(12,2) NOT NULL DEFAULT 0,
  is_blocked      TINYINT(1) NOT NULL DEFAULT 0,
  first_seen_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen_at    TIMESTAMP NULL,
  UNIQUE KEY uq_contact (channel_id, external_id),
  KEY idx_contact_tenant (tenant_id),
  -- Order creation looks a customer up by phone on every confirm.
  KEY idx_contact_phone (tenant_id, phone),
  -- "Recent customers" panel and the analytics new-vs-returning split.
  KEY idx_contact_seen (tenant_id, last_seen_at),
  CONSTRAINT fk_contact_tenant  FOREIGN KEY (tenant_id)  REFERENCES tenants(id) ON DELETE CASCADE,
  CONSTRAINT fk_contact_channel FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS conversations (
  id               BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id        BIGINT UNSIGNED NOT NULL,
  channel_id       BIGINT UNSIGNED NOT NULL,
  contact_id       BIGINT UNSIGNED NOT NULL,
  status           ENUM('open','active','resolved','spam') NOT NULL DEFAULT 'open',
  is_starred       TINYINT(1) NOT NULL DEFAULT 0,
  ai_enabled       TINYINT(1) NOT NULL DEFAULT 1,
  ai_paused_until  TIMESTAMP NULL,
  assigned_user_id BIGINT UNSIGNED NULL,
  unread_count     SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  message_count    INT UNSIGNED NOT NULL DEFAULT 0,
  -- Denormalised so the inbox list never joins to messages. Kept current by
  -- MessageRepository::append() inside the same transaction as the insert.
  last_message_at   TIMESTAMP NULL,
  last_message_text VARCHAR(255) NULL,
  last_message_from ENUM('customer','ai','human','system') NULL,
  summary          TEXT NULL,                  -- rolling summary for long chats
  summary_upto_id  BIGINT UNSIGNED NULL,
  last_intent      VARCHAR(40) NULL,
  meta             JSON NULL,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  -- THE inbox query. Covers filter + sort in one index.
  KEY idx_conv_inbox (tenant_id, status, last_message_at),
  KEY idx_conv_channel (tenant_id, channel_id, last_message_at),
  KEY idx_conv_assigned (tenant_id, assigned_user_id, last_message_at),
  KEY idx_conv_contact (contact_id),
  -- Follow-up scheduler scans for conversations gone quiet.
  KEY idx_conv_followup (tenant_id, ai_enabled, last_message_at),
  CONSTRAINT fk_conv_tenant  FOREIGN KEY (tenant_id)  REFERENCES tenants(id) ON DELETE CASCADE,
  CONSTRAINT fk_conv_contact FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS messages (
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
  -- Thread view pages backwards by id; covers ORDER BY id DESC.
  KEY idx_msg_conv (conversation_id, id),
  KEY idx_msg_tenant_time (tenant_id, created_at),
  -- Analytics rollup counts by sender per day.
  KEY idx_msg_rollup (tenant_id, created_at, sender),
  -- Meta redelivers webhooks; this makes a duplicate insert a no-op rather
  -- than a second reply to the customer.
  UNIQUE KEY uq_msg_external (conversation_id, external_message_id),
  CONSTRAINT fk_msg_conv FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS message_batches (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id       BIGINT UNSIGNED NOT NULL,
  conversation_id BIGINT UNSIGNED NOT NULL UNIQUE,
  message_ids     JSON NOT NULL,
  flush_at        TIMESTAMP(3) NOT NULL,
  status          ENUM('pending','processing','done') NOT NULL DEFAULT 'pending',
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_batch_flush (status, flush_at),
  CONSTRAINT fk_batch_conv FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS voice_messages (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id    BIGINT UNSIGNED NOT NULL,
  message_id   BIGINT UNSIGNED NOT NULL,
  direction    ENUM('in','out') NOT NULL,
  audio_url    VARCHAR(500) NOT NULL,
  duration_sec SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  transcript   TEXT NULL,
  -- Low STT confidence on Bangla must make the bot CONFIRM rather than guess
  -- at an order; the engine reads this.
  confidence   DECIMAL(4,3) NULL,
  stt_model_id BIGINT UNSIGNED NULL,
  tts_model_id BIGINT UNSIGNED NULL,
  cost         DECIMAL(10,6) NOT NULL DEFAULT 0,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_voice_tenant (tenant_id, created_at),
  KEY idx_voice_message (message_id),
  CONSTRAINT fk_voice_msg FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
