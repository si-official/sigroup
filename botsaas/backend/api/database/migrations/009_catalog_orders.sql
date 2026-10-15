-- 009_catalog_orders

CREATE TABLE IF NOT EXISTS product_categories (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id  BIGINT UNSIGNED NOT NULL,
  name       VARCHAR(120) NOT NULL,
  slug       VARCHAR(120) NOT NULL,
  sort_order SMALLINT NOT NULL DEFAULT 0,
  UNIQUE KEY uq_cat (tenant_id, slug),
  CONSTRAINT fk_cat_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS products (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id   BIGINT UNSIGNED NOT NULL,
  category_id BIGINT UNSIGNED NULL,
  sku         VARCHAR(60) NULL,
  name        VARCHAR(200) NOT NULL,
  description TEXT NULL,
  price       DECIMAL(12,2) NOT NULL DEFAULT 0,
  sale_price  DECIMAL(12,2) NULL,
  cost_price  DECIMAL(12,2) NULL,
  stock       INT NOT NULL DEFAULT 0,
  track_stock TINYINT(1) NOT NULL DEFAULT 1,
  low_stock_at INT NOT NULL DEFAULT 3,
  images      JSON NULL,
  attributes  JSON NULL,
  ai_keywords TEXT NULL,
  ai_note     TEXT NULL,
  -- Lowercased, punctuation-stripped concatenation of name + keywords +
  -- Banglish transliteration, maintained by ProductRepository.
  --
  -- WHY THIS EXISTS: MySQL/MariaDB FULLTEXT cannot match across scripts. A
  -- customer typing "shari" or "saree" will never hit the FULLTEXT index on
  -- "শাড়ি", and Banglish is how a large share of Bangladeshi customers
  -- actually type. FULLTEXT stays for long-description relevance ranking;
  -- this column is what makes cross-script lookup work at all.
  search_blob TEXT NULL,
  status      ENUM('active','draft','out_of_stock','archived') NOT NULL DEFAULT 'active',
  sort_order  SMALLINT NOT NULL DEFAULT 0,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_prod_tenant (tenant_id, status, sort_order),
  KEY idx_prod_stock (tenant_id, status, stock),
  KEY idx_prod_sku (tenant_id, sku),
  FULLTEXT KEY ft_prod (name, description, ai_keywords),
  FULLTEXT KEY ft_prod_blob (search_blob),
  CONSTRAINT fk_prod_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS product_variants (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id    BIGINT UNSIGNED NOT NULL,
  product_id   BIGINT UNSIGNED NOT NULL,
  option_name  VARCHAR(60) NOT NULL,
  option_value VARCHAR(60) NOT NULL,
  sku          VARCHAR(60) NULL,
  price_delta  DECIMAL(10,2) NOT NULL DEFAULT 0,
  stock        INT NOT NULL DEFAULT 0,
  KEY idx_var_product (product_id),
  KEY idx_var_tenant (tenant_id),
  CONSTRAINT fk_var_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS orders (
  id                 BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id          BIGINT UNSIGNED NOT NULL,
  order_no           VARCHAR(30) NOT NULL,
  conversation_id    BIGINT UNSIGNED NULL,
  contact_id         BIGINT UNSIGNED NULL,
  channel_type       ENUM('messenger','whatsapp','instagram','website','manual') NOT NULL,
  customer_name      VARCHAR(150) NULL,
  phone              VARCHAR(30) NULL,
  alt_phone          VARCHAR(30) NULL,
  address            TEXT NULL,
  district           VARCHAR(60) NULL,
  thana              VARCHAR(60) NULL,
  items_total        DECIMAL(12,2) NOT NULL DEFAULT 0,
  delivery_charge    DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount           DECIMAL(10,2) NOT NULL DEFAULT 0,
  advance_paid       DECIMAL(10,2) NOT NULL DEFAULT 0,
  total              DECIMAL(12,2) NOT NULL DEFAULT 0,
  payment_method     ENUM('cod','bkash','nagad','rocket','bank','prepaid') NOT NULL DEFAULT 'cod',
  payment_status     ENUM('unpaid','partial','paid','refunded') NOT NULL DEFAULT 'unpaid',
  status             ENUM('new','confirmed','processing','hold','courier','completed','cancelled','returned') NOT NULL DEFAULT 'new',
  cancel_reason      VARCHAR(255) NULL,
  note               TEXT NULL,
  internal_note      TEXT NULL,
  created_by         ENUM('ai','human','api') NOT NULL DEFAULT 'ai',
  created_by_user_id BIGINT UNSIGNED NULL,
  confirmed_at       TIMESTAMP NULL,
  shipped_at         TIMESTAMP NULL,
  completed_at       TIMESTAMP NULL,
  created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_order_no (tenant_id, order_no),
  KEY idx_order_board (tenant_id, status, created_at),
  KEY idx_order_phone (tenant_id, phone),
  KEY idx_order_conv (conversation_id),
  -- Revenue charts sum completed orders by day.
  KEY idx_order_revenue (tenant_id, status, completed_at),
  CONSTRAINT fk_order_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_items (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id     BIGINT UNSIGNED NOT NULL,
  order_id      BIGINT UNSIGNED NOT NULL,
  product_id    BIGINT UNSIGNED NULL,
  variant_id    BIGINT UNSIGNED NULL,
  -- Snapshot: the invoice must show what was sold at the price agreed, even
  -- after the product is renamed, repriced, or deleted.
  name_snapshot VARCHAR(200) NOT NULL,
  variant_label VARCHAR(120) NULL,
  unit_price    DECIMAL(12,2) NOT NULL,
  qty           SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  subtotal      DECIMAL(12,2) NOT NULL,
  KEY idx_oi_order (order_id),
  -- "Top products by revenue" aggregates here.
  KEY idx_oi_product (tenant_id, product_id),
  CONSTRAINT fk_oi_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_status_history (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id     BIGINT UNSIGNED NOT NULL,
  order_id      BIGINT UNSIGNED NOT NULL,
  from_status   VARCHAR(20) NULL,
  to_status     VARCHAR(20) NOT NULL,
  actor_type    ENUM('user','ai','courier','system') NOT NULL DEFAULT 'user',
  actor_user_id BIGINT UNSIGNED NULL,
  note          VARCHAR(255) NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_osh_order (order_id, created_at),
  CONSTRAINT fk_osh_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- O(1) duplicate-order lookup. Without it, order protection would scan the
-- orders table on every AI confirm.
CREATE TABLE IF NOT EXISTS order_guards (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id     BIGINT UNSIGNED NOT NULL,
  guard_key     VARCHAR(120) NOT NULL,         -- 'phone:01…' or 'conv:1234'
  order_count   SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  window_date   DATE NOT NULL,
  last_order_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_guard (tenant_id, guard_key, window_date),
  KEY idx_guard_prune (window_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS leads (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id       BIGINT UNSIGNED NOT NULL,
  conversation_id BIGINT UNSIGNED NULL,
  contact_id      BIGINT UNSIGNED NULL,
  name            VARCHAR(150) NULL,
  phone           VARCHAR(30) NULL,
  address         TEXT NULL,
  interest        VARCHAR(255) NULL,
  source_channel  ENUM('messenger','whatsapp','instagram','website','comment') NULL,
  status          ENUM('pending','processing','responded','completed','cancelled') NOT NULL DEFAULT 'pending',
  score           TINYINT UNSIGNED NULL,
  assigned_to     BIGINT UNSIGNED NULL,
  note            TEXT NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_lead_tenant (tenant_id, status, created_at),
  KEY idx_lead_phone (tenant_id, phone),
  CONSTRAINT fk_lead_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
