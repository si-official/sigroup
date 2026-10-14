-- SI Group API Database Schema
-- Run on Hostinger MySQL: u494078466_sigroup

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('client','partner','admin') DEFAULT 'client',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status ENUM('planning','in_progress','review','completed') DEFAULT 'planning',
    progress INT DEFAULT 0,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS milestones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    status ENUM('pending','in_progress','completed') DEFAULT 'pending',
    due_date DATE,
    sort_order INT DEFAULT 0,
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

CREATE TABLE IF NOT EXISTS invoices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending','paid','overdue') DEFAULT 'pending',
    due_date DATE,
    paid_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    subject VARCHAR(255) NOT NULL,
    status ENUM('open','in_progress','closed') DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS ticket_replies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT NOT NULL,
    user_id INT NOT NULL,
    role ENUM('client','admin') DEFAULT 'client',
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id)
);

CREATE TABLE IF NOT EXISTS partner_stats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    total_referrals INT DEFAULT 0,
    total_commission DECIMAL(10,2) DEFAULT 0,
    tier ENUM('Silver','Gold','Platinum') DEFAULT 'Silver',
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS referrals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    referrer_id INT NOT NULL,
    referred_id INT NOT NULL,
    status ENUM('pending','active') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS commissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description VARCHAR(255),
    status ENUM('pending','paid') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── Business Platforms ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS business_platforms (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    icon        VARCHAR(10)  NOT NULL DEFAULT '🏢',
    name        VARCHAR(100) NOT NULL,
    name_local  VARCHAR(200),
    tagline     VARCHAR(255),
    tagline_bn  VARCHAR(255),
    description TEXT,
    description_bn TEXT,
    link        VARCHAR(500) NOT NULL,
    link_display VARCHAR(200),
    btn_label   VARCHAR(100) DEFAULT 'Visit Now →',
    color       VARCHAR(100) DEFAULT 'from-blue-500 to-indigo-600',
    display_order INT DEFAULT 0,
    status      ENUM('active','inactive') DEFAULT 'active',
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ─── Shop Products ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS shop_products (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(200) NOT NULL,
    category    VARCHAR(100),
    price       DECIMAL(10,2) NOT NULL,
    old_price   DECIMAL(10,2),
    stock       INT DEFAULT 0,
    sold        INT DEFAULT 0,
    icon        VARCHAR(10) DEFAULT '📦',
    badge       VARCHAR(50),
    status      ENUM('active','out_of_stock','draft') DEFAULT 'active',
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ─── Software Listings ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS software_listings (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(200) NOT NULL,
    category    VARCHAR(100),
    description TEXT,
    full_desc   TEXT,
    price       DECIMAL(10,2) NOT NULL,
    old_price   DECIMAL(10,2),
    sold        INT DEFAULT 0,
    rating      DECIMAL(2,1) DEFAULT 4.5,
    reviews     INT DEFAULT 0,
    icon        VARCHAR(10) DEFAULT '💾',
    badge       VARCHAR(50),
    tags        VARCHAR(300),
    status      ENUM('active','draft') DEFAULT 'active',
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ─── Software Reviews ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS software_reviews (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    software_id INT NOT NULL,
    reviewer_name VARCHAR(100) NOT NULL,
    rating      TINYINT NOT NULL DEFAULT 5,
    comment     TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (software_id) REFERENCES software_listings(id) ON DELETE CASCADE
);

-- ─── Courses ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS courses (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(200) NOT NULL,
    subtitle    VARCHAR(300),
    instructor  VARCHAR(100),
    instructor_title VARCHAR(150),
    price       DECIMAL(10,2) NOT NULL,
    old_price   DECIMAL(10,2),
    rating      DECIMAL(2,1) DEFAULT 4.5,
    reviews     INT DEFAULT 0,
    students    INT DEFAULT 0,
    lessons     INT DEFAULT 0,
    duration    VARCHAR(50),
    level       VARCHAR(50) DEFAULT 'Beginner',
    icon        VARCHAR(10) DEFAULT '📚',
    color       VARCHAR(100),
    badge       VARCHAR(50),
    offer_label VARCHAR(30),
    certificate TINYINT(1) DEFAULT 1,
    status      ENUM('active','draft') DEFAULT 'active',
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ─── Dev Service Packages ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dev_packages (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(200) NOT NULL,
    description TEXT,
    price       DECIMAL(10,2) DEFAULT 0,
    is_custom   TINYINT(1) DEFAULT 0,
    delivery    VARCHAR(50),
    features    TEXT,
    icon        VARCHAR(10) DEFAULT '⚙️',
    popular     TINYINT(1) DEFAULT 0,
    status      ENUM('active','draft') DEFAULT 'active',
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ─── Dev Enquiries ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dev_enquiries (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    client_name VARCHAR(100) NOT NULL,
    email       VARCHAR(150) NOT NULL,
    phone       VARCHAR(30),
    package_id  INT,
    budget      VARCHAR(100),
    message     TEXT,
    status      ENUM('new','contacted','proposal_sent','won','lost') DEFAULT 'new',
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ─── Seed: Business Platforms ─────────────────────────────────────────────────
INSERT IGNORE INTO business_platforms (id, icon, name, name_local, tagline, tagline_bn, description, description_bn, link, link_display, btn_label, color, display_order, status) VALUES
(1, '🛒', 'SI Mart', 'এস আই মার্ট', 'Online Shopping in Bangladesh', 'সারা বাংলাদেশে দ্রুত পণ্য পৌঁছে দেওয়ার প্রতিশ্রুতি', 'SI Mart is Bangladesh\'s trusted e-commerce platform — delivering quality products across all 64 districts within 24–48 hours.', 'সারা বাংলাদেশে দ্রুত পণ্য পৌঁছে দেওয়া হয়। হাজারো পণ্য পাওয়া যায়।', 'https://www.simart.com.bd', 'www.simart.com.bd', 'Let\'s Shopping & Enjoy 🛍️', 'from-orange-500 to-pink-600', 1, 'active'),
(2, '🌐', 'WC EDGE', 'World Communication – Enhanced Data for Global Evolution', 'Internet Service Provider & Technology Solutions', 'বিশ্ব যোগাযোগের মাধ্যমে উন্নত তথ্য ও বৈশ্বিক অগ্রগতির নতুন দিগন্ত', 'WC EDGE provides high-speed internet services across Bangladesh alongside technology products and solutions.', 'আমরা সারা বাংলাদেশে ইন্টারনেট সার্ভিস প্রোভাইড করি এবং বিভিন্ন প্রোডাক্ট ও সার্ভিস বিক্রয় করি।', 'https://wcedge.com.bd', 'wcedge.com.bd', 'Visit WC EDGE →', 'from-blue-500 to-cyan-600', 2, 'active'),
(3, '🎓', 'SI School', 'এস আই স্কুল', 'Online Learning Platform', 'দক্ষতা অর্জন করুন, ক্যারিয়ার গড়ুন', 'SI School offers professional development, design, and academic education courses in Bangla & English.', 'ডেভেলপমেন্ট কোর্স, ডিজাইনিং কোর্স এবং একাডেমিক শিক্ষা ক্লাস পরিচালিত হয়।', 'https://school.sigroup.com.bd', 'school.sigroup.com.bd', 'Start Learning →', 'from-indigo-500 to-violet-600', 3, 'active'),
(4, '📷', 'SI Technology', 'CCTV & Security', 'Complete Security Product Sales Organization', 'আপনার নিরাপত্তা আমাদের দায়িত্ব', 'SI Technology is your one-stop destination for CCTV cameras, IP surveillance systems, access control and all security products.', 'সিসিটিভি ক্যামেরা, আইপি সার্ভেইলেন্স সিস্টেম এবং সকল নিরাপত্তা পণ্যের বিক্রয় ও সেবা প্রদান।', 'https://sitechnology.com.bd', 'sitechnology.com.bd', 'Secure Your Home →', 'from-slate-600 to-gray-800', 4, 'active'),
(5, '💾', 'SI Software & Design', 'ডিজাইন ও সফটওয়্যার মার্কেটপ্লেস', 'Software & Design Buying-Selling Marketplace', 'সকল ধরনের ডিজাইন ও সফটওয়্যার কিনুন ও বিক্রি করুন', 'A complete marketplace where all types of business software, graphic designs, templates and digital assets are bought and sold.', 'এখানে সকল ধরনের ডিজাইন ও সফটওয়্যার বিক্রয় করা হয়।', 'https://shop.sigroup.com.bd', 'shop.sigroup.com.bd', 'Visit Marketplace →', 'from-violet-500 to-purple-700', 5, 'active');

-- ─── Default admin user (change password!) ────────────────────────────────────
INSERT IGNORE INTO users (name, email, password, role) VALUES
('Admin', 'admin@sigroup.com.bd', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');
-- Default password: 'password' — CHANGE THIS IMMEDIATELY
