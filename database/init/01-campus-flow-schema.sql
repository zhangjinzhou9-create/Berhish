CREATE DATABASE IF NOT EXISTS user_db2
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE user_db2;

CREATE TABLE IF NOT EXISTS personal_info (
    id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    student_id VARCHAR(50) NOT NULL,
    email VARCHAR(120) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    location VARCHAR(120) NOT NULL,
    title VARCHAR(120) NOT NULL,
    summary TEXT NOT NULL,
    country VARCHAR(100) DEFAULT 'Japan',
    city VARCHAR(100) DEFAULT 'Kyoto'
);

INSERT INTO personal_info
    (id, name, student_id, email, phone, location, title, summary, country, city)
VALUES
    (1, 'シュフシン', 'M25W7195', 'st232527@kcg.edu', '',
     'Kyoto, Japan', 'Visual diary / web design student',
     'Photography, sketches, and small web experiments collected between classes and walks through Kyoto.',
     'Japan', 'Kyoto')
ON DUPLICATE KEY UPDATE id = id;

CREATE TABLE IF NOT EXISTS education (
    id INT AUTO_INCREMENT PRIMARY KEY,
    school VARCHAR(180) NOT NULL,
    degree VARCHAR(120) NOT NULL,
    major VARCHAR(120) NOT NULL,
    period VARCHAR(80) NOT NULL,
    description TEXT NOT NULL
);

INSERT INTO education (id, school, degree, major, period, description)
VALUES
    (1, 'The Kyoto College of Graduate Studies for Informatics',
     'Master Program', 'Network Management', '2025 - Present',
     'Web services, database systems, cloud deployment, and visual interface design.')
ON DUPLICATE KEY UPDATE id = id;

CREATE TABLE IF NOT EXISTS skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    skill_name VARCHAR(160) NOT NULL
);

INSERT INTO skills (id, skill_name) VALUES
    (1, 'Java and Spring Boot web services'),
    (2, 'HTML, CSS, and JavaScript interface design'),
    (3, 'MySQL data persistence'),
    (4, 'OAuth 2.0 and secure account sessions'),
    (5, 'Docker and Azure container deployment')
ON DUPLICATE KEY UPDATE skill_name = VALUES(skill_name);

CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_name VARCHAR(140) NOT NULL,
    project_description TEXT NOT NULL
);

INSERT INTO projects (id, project_name, project_description)
VALUES
    (1, 'CampusFlow',
     'A three-page web service client combining live daily information, a personal portfolio, secure accounts, and cloud deployment.')
ON DUPLICATE KEY UPDATE
    project_name = VALUES(project_name),
    project_description = VALUES(project_description);

CREATE TABLE IF NOT EXISTS languages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    language_name VARCHAR(80) NOT NULL,
    language_level VARCHAR(120) NOT NULL
);

INSERT INTO languages (id, language_name, language_level) VALUES
    (1, 'Chinese', 'Native'),
    (2, 'Japanese', 'Daily communication'),
    (3, 'English', 'Reading and presentation')
ON DUPLICATE KEY UPDATE language_level = VALUES(language_level);

CREATE TABLE IF NOT EXISTS auth_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    user_type VARCHAR(20) NOT NULL,
    display_name VARCHAR(120),
    avatar_url VARCHAR(600),
    provider VARCHAR(30),
    provider_subject VARCHAR(190),
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_auth_provider_subject (provider, provider_subject)
);

CREATE TABLE IF NOT EXISTS user_profiles (
    user_id INT PRIMARY KEY,
    email VARCHAR(160),
    phone VARCHAR(60),
    title VARCHAR(180),
    summary TEXT,
    country VARCHAR(100) DEFAULT 'Japan',
    city VARCHAR(100) DEFAULT 'Kyoto',
    visibility VARCHAR(20) DEFAULT 'PUBLIC',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS portfolio_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    item_type VARCHAR(30) NOT NULL,
    title VARCHAR(160) NOT NULL,
    description TEXT,
    image_url VARCHAR(600),
    external_url VARCHAR(600),
    display_order INT DEFAULT 0,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_portfolio_owner_order (user_id, display_order)
);

-- No default account or plaintext password is created. Public users register
-- through the application; the administrator is provisioned from environment
-- variables.
