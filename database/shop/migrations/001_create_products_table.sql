-- SI Shop — products table
CREATE TABLE IF NOT EXISTS products (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(255) NOT NULL,
  slug         VARCHAR(255) UNIQUE NOT NULL,
  description  TEXT,
  price        DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  stock        INT UNSIGNED DEFAULT 0,
  category_id  BIGINT UNSIGNED,
  image        VARCHAR(500),
  status       ENUM('active','inactive','draft') DEFAULT 'draft',
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id  BIGINT UNSIGNED NOT NULL,
  total        DECIMAL(10,2) NOT NULL,
  status       ENUM('pending','processing','shipped','delivered','cancelled') DEFAULT 'pending',
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
