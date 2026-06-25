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
    (1, 'シュフシン', 'M25W7195', 'st232527@kcg.edu', '123-4567-8901',
     'Kyoto, Japan', 'Information Technology / Network Management Student',
     'I am studying information technology and network management. Campus Flow is my integrated web project for profile management, weather and country information, JWT authorization, OAuth API verification, Docker, and cloud deployment.',
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
     'Main study areas include network management, cloud systems, database basics, web APIs, and software development.')
ON DUPLICATE KEY UPDATE id = id;

CREATE TABLE IF NOT EXISTS skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    skill_name VARCHAR(160) NOT NULL
);

INSERT INTO skills (id, skill_name)
VALUES
    (1, 'Java and Spring Boot API development'),
    (2, 'HTML, CSS and JavaScript frontend development'),
    (3, 'MySQL database design and SQL operations'),
    (4, 'JWT authentication and role-based authorization'),
    (5, 'OAuth 2.0 integration with Google and GitHub'),
    (6, 'Docker, Docker Compose and Azure container deployment')
ON DUPLICATE KEY UPDATE id = id;

CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_name VARCHAR(140) NOT NULL,
    project_description TEXT NOT NULL
);

INSERT INTO projects (id, project_name, project_description)
VALUES
    (1, 'Campus Flow',
     'A Spring Boot web application that combines a student profile, weather and country APIs, JWT login, OAuth verification, MySQL persistence, Docker sidecar deployment, and Azure App Service deployment.')
ON DUPLICATE KEY UPDATE id = id;

CREATE TABLE IF NOT EXISTS languages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    language_name VARCHAR(80) NOT NULL,
    language_level VARCHAR(120) NOT NULL
);

INSERT INTO languages (id, language_name, language_level)
VALUES
    (1, 'Chinese', 'Native'),
    (2, 'Japanese', 'Daily communication / learning toward JLPT N2'),
    (3, 'English', 'Basic reading and presentation')
ON DUPLICATE KEY UPDATE id = id;

CREATE TABLE IF NOT EXISTS auth_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(50) NOT NULL,
    user_type VARCHAR(20) NOT NULL
);

INSERT INTO auth_users (username, password, user_type)
VALUES
    ('student', 'pass', 'STUDENT'),
    ('teacher', 'pass', 'TEACHER'),
    ('admin', 'pass', 'ADMIN')
ON DUPLICATE KEY UPDATE
    password = VALUES(password),
    user_type = VALUES(user_type);
