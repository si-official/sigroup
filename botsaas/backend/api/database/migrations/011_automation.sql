-- 011_automation

CREATE TABLE IF NOT EXISTS instant_replies (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id     BIGINT UNSIGNED NOT NULL,
  channel_scope ENUM('all','messenger','whatsapp','instagram','website') NOT NULL DEFAULT 'all',
  title         VARCHAR(150) NULL,
  match_type    ENUM('exact','contains','starts_with','regex') NOT NULL DEFAULT 'contains',
  keywords      JSON NOT NULL,
  reply_text    TEXT NOT NULL,
  attachments   JSON NULL,
  stop_ai       TINYINT(1) NOT NULL DEFAULT 1,  -- true = zero token cost
  priority      SMALLINT NOT NULL DEFAULT 0,
  hit_count     INT UNSIGNED NOT NULL DEFAULT 0,
  is_active     TINYINT(1) NOT NULL DEFAULT 1,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  -- Loaded in full on every inbound message, so the index must cover the
  -- filter AND the ordering: highest priority wins.
  KEY idx_ir_match (tenant_id, is_active, priority),
  CONSTRAINT fk_ir_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS comment_automations (
  id                    BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id             BIGINT UNSIGNED NOT NULL,
  channel_id            BIGINT UNSIGNED NOT NULL,
  name                  VARCHAR(150) NULL,
  post_id               VARCHAR(120) NULL,      -- NULL = all posts
  trigger_type          ENUM('any','keywords') NOT NULL DEFAULT 'any',
  trigger_keywords      JSON NULL,
  reply_mode            ENUM('static','ai','none') NOT NULL DEFAULT 'static',
  public_reply          TEXT NULL,
  -- Identical replies on every comment are what gets a Page flagged by Meta,
  -- so variants are rotated.
  public_reply_variants JSON NULL,
  send_dm               TINYINT(1) NOT NULL DEFAULT 1,
  dm_mode               ENUM('static','ai') NOT NULL DEFAULT 'static',
  dm_text               TEXT NULL,
  hide_comment          TINYINT(1) NOT NULL DEFAULT 0,
  like_comment          TINYINT(1) NOT NULL DEFAULT 0,
  reply_once_per_user   TINYINT(1) NOT NULL DEFAULT 1,
  daily_limit           INT UNSIGNED NULL,
  is_active             TINYINT(1) NOT NULL DEFAULT 1,
  created_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_ca_tenant (tenant_id, is_active),
  KEY idx_ca_post (channel_id, post_id, is_active),
  CONSTRAINT fk_ca_tenant  FOREIGN KEY (tenant_id)  REFERENCES tenants(id) ON DELETE CASCADE,
  CONSTRAINT fk_ca_channel FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS comment_logs (
  id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id      BIGINT UNSIGNED NOT NULL,
  automation_id  BIGINT UNSIGNED NULL,
  post_id        VARCHAR(120) NULL,
  comment_id     VARCHAR(120) NOT NULL,
  commenter_id   VARCHAR(120) NULL,
  commenter_name VARCHAR(150) NULL,
  comment_text   TEXT NULL,
  replied        TINYINT(1) NOT NULL DEFAULT 0,
  reply_text     TEXT NULL,
  dm_sent        TINYINT(1) NOT NULL DEFAULT 0,
  hidden         TINYINT(1) NOT NULL DEFAULT 0,
  status         ENUM('ok','skipped','error','limit_reached') NOT NULL DEFAULT 'ok',
  error_message  VARCHAR(500) NULL,
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  -- Idempotency: Meta redelivers comment webhooks.
  UNIQUE KEY uq_comment (tenant_id, comment_id),
  KEY idx_cl_tenant (tenant_id, created_at),
  -- reply_once_per_user lookup.
  KEY idx_cl_commenter (tenant_id, commenter_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS followup_sequences (
  id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id           BIGINT UNSIGNED NOT NULL,
  name                VARCHAR(150) NOT NULL,
  channel_scope       ENUM('all','messenger','whatsapp','instagram','website') NOT NULL DEFAULT 'all',
  trigger_on          ENUM('no_reply','abandoned_order','post_delivery') NOT NULL DEFAULT 'no_reply',
  default_delay_min   INT UNSIGNED NOT NULL DEFAULT 60,
  default_instruction TEXT NULL,
  stop_on_reply       TINYINT(1) NOT NULL DEFAULT 1,
  max_per_week        TINYINT UNSIGNED NOT NULL DEFAULT 3,
  is_active           TINYINT(1) NOT NULL DEFAULT 1,
  created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_fs_tenant (tenant_id, is_active, trigger_on),
  CONSTRAINT fk_fs_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS followup_steps (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id   BIGINT UNSIGNED NOT NULL,
  sequence_id BIGINT UNSIGNED NOT NULL,
  step_no     TINYINT UNSIGNED NOT NULL,
  delay_min   INT UNSIGNED NOT NULL,
  mode        ENUM('static','ai') NOT NULL DEFAULT 'static',
  message     TEXT NULL,
  instruction TEXT NULL,
  attachments JSON NULL,
  UNIQUE KEY uq_step (sequence_id, step_no),
  CONSTRAINT fk_fstep_seq FOREIGN KEY (sequence_id) REFERENCES followup_sequences(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS followup_jobs (
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
  -- The per-minute scheduler claims due rows through this index.
  KEY idx_fj_due (status, run_at),
  CONSTRAINT fk_fj_conv FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  CONSTRAINT fk_fj_seq  FOREIGN KEY (sequence_id)     REFERENCES followup_sequences(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
