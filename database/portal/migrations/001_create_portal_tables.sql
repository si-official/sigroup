-- SI Portal — users & access tables
CREATE TABLE IF NOT EXISTS users (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(255) NOT NULL,
  email        VARCHAR(255) UNIQUE NOT NULL,
  password     VARCHAR(255) NOT NULL,
  role         ENUM('admin','employee','client','partner') DEFAULT 'client',
  status       ENUM('active','inactive','suspended') DEFAULT 'active',
  last_login   TIMESTAMP NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
  id           VARCHAR(255) PRIMARY KEY,
  user_id      BIGINT UNSIGNED NOT NULL,
  ip_address   VARCHAR(45),
  user_agent   TEXT,
  payload      LONGTEXT NOT NULL,
  last_activity INT NOT NULL,
  INDEX sessions_user_id_index (user_id)
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id      BIGINT UNSIGNED NOT NULL,
  action       VARCHAR(255) NOT NULL,
  description  TEXT,
  ip_address   VARCHAR(45),
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
