-- 001_platform_bootstrap
-- The infrastructure tables the framework itself needs. Product tables arrive
-- in Phase 2 (002_identity onwards) from schema.sql.
-- Every statement is written to be re-runnable.

CREATE TABLE IF NOT EXISTS migrations (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  filename    VARCHAR(190) NOT NULL UNIQUE,
  checksum    CHAR(64)     NOT NULL,
  batch       INT UNSIGNED NOT NULL,
  duration_ms INT UNSIGNED NOT NULL DEFAULT 0,
  applied_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Cron-driven queue. Claimed with SELECT ... FOR UPDATE SKIP LOCKED so two
-- overlapping cron runs never process the same job.
CREATE TABLE IF NOT EXISTS jobs (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id    BIGINT UNSIGNED NULL,
  type         VARCHAR(60)  NOT NULL,
  payload      JSON         NOT NULL,
  priority     TINYINT UNSIGNED NOT NULL DEFAULT 5,
  available_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  reserved_at  TIMESTAMP(3) NULL,
  reserved_by  VARCHAR(40)  NULL,
  attempts     TINYINT UNSIGNED NOT NULL DEFAULT 0,
  max_attempts TINYINT UNSIGNED NOT NULL DEFAULT 3,
  status       ENUM('pending','reserved','done','failed') NOT NULL DEFAULT 'pending',
  last_error   TEXT NULL,
  dedupe_key   VARCHAR(190) NULL,
  created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP(3) NULL,
  UNIQUE KEY uq_job_dedupe (dedupe_key),
  KEY idx_job_claim (status, priority, available_at),
  KEY idx_job_tenant (tenant_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rate_limits (
  bucket_key   VARCHAR(190) NOT NULL PRIMARY KEY,
  hits         INT UNSIGNED NOT NULL DEFAULT 0,
  window_start TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at   TIMESTAMP    NOT NULL,
  KEY idx_rl_exp (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Cron heartbeat. On shared hosting crons die silently; this is how the health
-- endpoint and the admin panel notice.
CREATE TABLE IF NOT EXISTS cron_heartbeats (
  job_name     VARCHAR(60) NOT NULL PRIMARY KEY,
  last_run_at  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  duration_ms  INT UNSIGNED NOT NULL DEFAULT 0,
  processed    INT UNSIGNED NOT NULL DEFAULT 0,
  last_status  ENUM('ok','error') NOT NULL DEFAULT 'ok',
  last_error   TEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS settings (
  setting_key   VARCHAR(100) NOT NULL PRIMARY KEY,
  setting_value TEXT NULL,
  value_type    ENUM('string','int','bool','json','secret') NOT NULL DEFAULT 'string',
  group_name    VARCHAR(50) NULL,
  is_public     TINYINT(1) NOT NULL DEFAULT 0,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO settings (setting_key, setting_value, value_type, group_name, is_public)
VALUES ('schema_version', '1', 'int', 'system', 0)
ON DUPLICATE KEY UPDATE setting_value = setting_value;
