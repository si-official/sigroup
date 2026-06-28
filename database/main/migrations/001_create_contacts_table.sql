-- SI Group Main Site — contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  email       VARCHAR(255) NOT NULL,
  phone       VARCHAR(50),
  subject     VARCHAR(255),
  message     TEXT,
  status      ENUM('new','read','replied') DEFAULT 'new',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
