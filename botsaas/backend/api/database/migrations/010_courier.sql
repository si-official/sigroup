-- 010_courier

CREATE TABLE IF NOT EXISTS courier_accounts (
  id               BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id        BIGINT UNSIGNED NOT NULL,
  provider         ENUM('steadfast','pathao','redx','paperfly','ecourier') NOT NULL,
  env              ENUM('sandbox','production') NOT NULL DEFAULT 'production',
  credentials_enc  TEXT NOT NULL,
  store_id         VARCHAR(60) NULL,
  access_token     TEXT NULL,
  token_expires_at TIMESTAMP NULL,
  is_active        TINYINT(1) NOT NULL DEFAULT 0,
  is_default       TINYINT(1) NOT NULL DEFAULT 0,
  last_error       VARCHAR(500) NULL,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_courier (tenant_id, provider),
  CONSTRAINT fk_courier_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS courier_shipments (
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
  KEY idx_ship_order (order_id),
  KEY idx_ship_track (tenant_id, tracking_code),
  -- The 15-minute sync cron pulls only shipments still in flight.
  KEY idx_ship_sync (status, status_updated_at),
  CONSTRAINT fk_ship_order   FOREIGN KEY (order_id)           REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_ship_account FOREIGN KEY (courier_account_id) REFERENCES courier_accounts(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Each courier has its own ids for district/zone/area. Mapping an order's
-- free-text address onto them is the #1 cause of failed dispatch, so the
-- mapping is cached rather than looked up per request.
CREATE TABLE IF NOT EXISTS courier_locations (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  provider    ENUM('steadfast','pathao','redx','paperfly','ecourier') NOT NULL,
  level       ENUM('city','zone','area') NOT NULL,
  external_id VARCHAR(40) NOT NULL,
  parent_external_id VARCHAR(40) NULL,
  name        VARCHAR(120) NOT NULL,
  name_norm   VARCHAR(120) NOT NULL,           -- lowercased, for fuzzy match
  synced_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_cloc (provider, level, external_id),
  KEY idx_cloc_name (provider, level, name_norm)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
