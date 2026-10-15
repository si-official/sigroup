-- 012_platform
-- Billing extras (payments, coupons — not in 004), webhook intake, logs,
-- analytics rollups, notifications, support, API tokens, media.

CREATE TABLE IF NOT EXISTS payments (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id       BIGINT UNSIGNED NOT NULL,
  gateway         ENUM('bkash','nagad','sslcommerz','stripe','manual') NOT NULL,
  purpose         ENUM('subscription','wallet_topup') NOT NULL,
  package_id      BIGINT UNSIGNED NULL,
  amount          DECIMAL(12,2) NOT NULL,
  currency        CHAR(3) NOT NULL DEFAULT 'BDT',
  invoice_no      VARCHAR(40) NOT NULL UNIQUE,
  gateway_txn_id  VARCHAR(120) NULL,
  payer_account   VARCHAR(40) NULL,
  status          ENUM('pending','success','failed','refunded','manual_review') NOT NULL DEFAULT 'pending',
  proof_url       VARCHAR(500) NULL,
  gateway_payload JSON NULL,
  verified_by     BIGINT UNSIGNED NULL,
  verified_at     TIMESTAMP NULL,
  coupon_code     VARCHAR(40) NULL,
  discount        DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_pay_tenant (tenant_id, status),
  -- Gateway callbacks MUST be idempotent. A unique txn id per gateway makes a
  -- replayed callback a no-op instead of a double activation.
  UNIQUE KEY uq_pay_txn (gateway, gateway_txn_id),
  KEY idx_pay_review (status, created_at),
  CONSTRAINT fk_pay_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS coupons (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code            VARCHAR(40) NOT NULL UNIQUE,
  type            ENUM('percent','fixed') NOT NULL,
  value           DECIMAL(10,2) NOT NULL,
  max_redemptions INT UNSIGNED NULL,
  used_count      INT UNSIGNED NOT NULL DEFAULT 0,
  applies_to      JSON NULL,
  starts_at       TIMESTAMP NULL,
  expires_at      TIMESTAMP NULL,
  is_active       TINYINT(1) NOT NULL DEFAULT 1,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS webhook_events (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  source          ENUM('messenger','whatsapp','instagram','widget','bkash','nagad','sslcommerz','steadfast','pathao') NOT NULL,
  external_id     VARCHAR(190) NULL,
  dedupe_hash     CHAR(64) NOT NULL,
  signature_valid TINYINT(1) NOT NULL DEFAULT 0,
  raw_payload     JSON NOT NULL,
  status          ENUM('received','processed','ignored','error') NOT NULL DEFAULT 'received',
  error_message   VARCHAR(500) NULL,
  received_at     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  processed_at    TIMESTAMP(3) NULL,
  -- The whole point: a Meta retry collides here and costs one failed insert
  -- instead of a duplicate reply to the customer.
  UNIQUE KEY uq_wh_dedupe (dedupe_hash),
  KEY idx_wh_status (status, received_at),
  KEY idx_wh_prune (received_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS activity_logs (
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
  KEY idx_al_tenant (tenant_id, scope, created_at),
  KEY idx_al_prune (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Every chart reads THIS, never the raw messages table.
CREATE TABLE IF NOT EXISTS analytics_daily (
  id               BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id        BIGINT UNSIGNED NOT NULL,
  stat_date        DATE NOT NULL,
  messages_in      INT UNSIGNED NOT NULL DEFAULT 0,
  messages_out     INT UNSIGNED NOT NULL DEFAULT 0,
  ai_replies       INT UNSIGNED NOT NULL DEFAULT 0,
  human_replies    INT UNSIGNED NOT NULL DEFAULT 0,
  instant_replies  INT UNSIGNED NOT NULL DEFAULT 0,
  new_contacts     INT UNSIGNED NOT NULL DEFAULT 0,
  conversations    INT UNSIGNED NOT NULL DEFAULT 0,
  orders_created   INT UNSIGNED NOT NULL DEFAULT 0,
  orders_completed INT UNSIGNED NOT NULL DEFAULT 0,
  revenue          DECIMAL(14,2) NOT NULL DEFAULT 0,
  ai_cost          DECIMAL(12,6) NOT NULL DEFAULT 0,
  hourly_messages  JSON NULL,                  -- 24-slot array for the heatmap
  updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_ad (tenant_id, stat_date),
  KEY idx_ad_date (stat_date),
  CONSTRAINT fk_ad_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notifications (
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
  KEY idx_notif_user (user_id, read_at, created_at),
  KEY idx_notif_tenant (tenant_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS support_tickets (
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
  KEY idx_st_tenant (tenant_id, status),
  KEY idx_st_queue (status, priority, created_at),
  CONSTRAINT fk_st_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ticket_replies (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id   BIGINT UNSIGNED NOT NULL,
  ticket_id   BIGINT UNSIGNED NOT NULL,
  user_id     BIGINT UNSIGNED NOT NULL,
  is_staff    TINYINT(1) NOT NULL DEFAULT 0,
  body        TEXT NOT NULL,
  attachments JSON NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_tr_ticket (ticket_id, created_at),
  CONSTRAINT fk_tr_ticket FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS announcements (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title        VARCHAR(190) NOT NULL,
  body         TEXT NOT NULL,
  severity     ENUM('info','success','warning','critical') NOT NULL DEFAULT 'info',
  audience     ENUM('all','package','tenant') NOT NULL DEFAULT 'all',
  audience_ref JSON NULL,
  starts_at    TIMESTAMP NULL,
  ends_at      TIMESTAMP NULL,
  is_active    TINYINT(1) NOT NULL DEFAULT 1,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_ann_live (is_active, starts_at, ends_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS api_tokens (
  id                 BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id          BIGINT UNSIGNED NOT NULL,
  name               VARCHAR(100) NOT NULL,
  token_hash         CHAR(64) NOT NULL UNIQUE,
  token_hint         VARCHAR(20) NULL,
  scopes             JSON NULL,
  rate_limit_per_min SMALLINT UNSIGNED NOT NULL DEFAULT 60,
  last_used_at       TIMESTAMP NULL,
  revoked_at         TIMESTAMP NULL,
  created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_at_tenant (tenant_id, revoked_at),
  CONSTRAINT fk_at_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS media_files (
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
  KEY idx_media_tenant (tenant_id, purpose)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
