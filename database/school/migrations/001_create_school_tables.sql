-- SI School — core tables
CREATE TABLE IF NOT EXISTS students (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id   VARCHAR(50) UNIQUE NOT NULL,
  name         VARCHAR(255) NOT NULL,
  email        VARCHAR(255) UNIQUE,
  phone        VARCHAR(50),
  class_id     BIGINT UNSIGNED,
  status       ENUM('active','inactive','graduated') DEFAULT 'active',
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS classes (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(100) NOT NULL,
  teacher_id   BIGINT UNSIGNED,
  academic_year VARCHAR(10),
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS results (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id   BIGINT UNSIGNED NOT NULL,
  class_id     BIGINT UNSIGNED NOT NULL,
  subject      VARCHAR(100) NOT NULL,
  marks        DECIMAL(5,2),
  grade        VARCHAR(5),
  exam_type    ENUM('midterm','final','assignment') DEFAULT 'final',
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
