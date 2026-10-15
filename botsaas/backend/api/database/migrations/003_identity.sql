-- 003_identity
-- Tenants, users, and the credential/audit tables auth depends on.
-- Subset of docs/bot-saas/schema.sql; Phase 2 delivers the remainder.

CREATE TABLE IF NOT EXISTS tenants (
  id               BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name             VARCHAR(150) NOT NULL,
  slug             VARCHAR(80)  NOT NULL UNIQUE,
  owner_user_id    BIGINT UNSIGNED NULL,
  business_type    VARCHAR(60)  NULL,
  phone            VARCHAR(30)  NULL,
  address          TEXT NULL,
  timezone         VARCHAR(64)  NOT NULL DEFAULT 'Asia/Dhaka',
  currency         CHAR(3)      NOT NULL DEFAULT 'BDT',
  status           ENUM('active','suspended','deleted') NOT NULL DEFAULT 'active',
  suspended_reason VARCHAR(255) NULL,
  onboarding_step  TINYINT UNSIGNED NOT NULL DEFAULT 0,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at       TIMESTAMP NULL,
  KEY idx_tenants_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
  id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id         BIGINT UNSIGNED NULL,          -- NULL = platform staff
  name              VARCHAR(120) NOT NULL,
  email             VARCHAR(190) NOT NULL UNIQUE,
  phone             VARCHAR(30)  NULL,
  password_hash     VARCHAR(255) NOT NULL,
  role              ENUM('super_admin','platform_support','tenant_owner','tenant_manager','tenant_agent') NOT NULL,
  status            ENUM('active','invited','disabled') NOT NULL DEFAULT 'active',
  avatar_url        VARCHAR(500) NULL,
  locale            ENUM('bn','en') NOT NULL DEFAULT 'bn',
  two_fa_secret     VARCHAR(64) NULL,
  email_verified_at TIMESTAMP NULL,
  last_login_at     TIMESTAMP NULL,
  last_login_ip     VARCHAR(45) NULL,
  created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_users_tenant (tenant_id, status),
  CONSTRAINT fk_users_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Refresh tokens carry a FAMILY id. Rotation issues a new token in the same
-- family; presenting an already-rotated token means the token leaked, so the
-- whole family is revoked at once.
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id       BIGINT UNSIGNED NOT NULL,
  family_id     CHAR(32)     NOT NULL,
  token_hash    CHAR(64)     NOT NULL UNIQUE,
  device_label  VARCHAR(120) NULL,
  ip            VARCHAR(45)  NULL,
  expires_at    TIMESTAMP    NOT NULL,
  rotated_at    TIMESTAMP    NULL,
  revoked_at    TIMESTAMP    NULL,
  revoked_reason VARCHAR(60) NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_rt_user (user_id, revoked_at),
  KEY idx_rt_family (family_id),
  CONSTRAINT fk_rt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS password_resets (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email      VARCHAR(190) NOT NULL,
  token_hash CHAR(64)     NOT NULL,
  expires_at TIMESTAMP    NOT NULL,
  used_at    TIMESTAMP    NULL,
  ip         VARCHAR(45)  NULL,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_pr_email (email),
  KEY idx_pr_token (token_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS email_verifications (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    BIGINT UNSIGNED NOT NULL,
  token_hash CHAR(64)  NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at    TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_ev_token (token_hash),
  CONSTRAINT fk_ev_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Login throttle. Keyed on email AND ip separately so one attacker cannot
-- lock out a real user by hammering their address, and a distributed attack
-- on one account still trips the email counter.
CREATE TABLE IF NOT EXISTS login_attempts (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  attempt_key  VARCHAR(190) NOT NULL,
  failures     SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  locked_until TIMESTAMP NULL,
  first_fail_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_fail_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_attempt (attempt_key),
  KEY idx_la_locked (locked_until)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS audit_logs (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id       BIGINT UNSIGNED NULL,
  actor_user_id   BIGINT UNSIGNED NULL,
  actor_type      ENUM('user','system','ai','webhook') NOT NULL DEFAULT 'user',
  impersonated    TINYINT(1) NOT NULL DEFAULT 0,
  real_actor_id   BIGINT UNSIGNED NULL,
  action          VARCHAR(80) NOT NULL,
  entity_type     VARCHAR(60) NULL,
  entity_id       BIGINT UNSIGNED NULL,
  before_json     JSON NULL,
  after_json      JSON NULL,
  ip              VARCHAR(45) NULL,
  user_agent      VARCHAR(255) NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_audit_tenant (tenant_id, created_at),
  KEY idx_audit_entity (entity_type, entity_id),
  KEY idx_audit_actor (actor_user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
