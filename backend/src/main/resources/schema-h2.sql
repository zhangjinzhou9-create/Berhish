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

CREATE TABLE IF NOT EXISTS education (
    id INT AUTO_INCREMENT PRIMARY KEY,
    school VARCHAR(180) NOT NULL,
    degree VARCHAR(120) NOT NULL,
    major VARCHAR(120) NOT NULL,
    period VARCHAR(80) NOT NULL,
    description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    skill_name VARCHAR(160) NOT NULL
);

CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_name VARCHAR(140) NOT NULL,
    project_description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS languages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    language_name VARCHAR(80) NOT NULL,
    language_level VARCHAR(120) NOT NULL
);

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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
    media_kind VARCHAR(20),
    media_content_type VARCHAR(120),
    media_original_name VARCHAR(255),
    media_stored_name VARCHAR(300),
    media_size BIGINT,
    layout_size VARCHAR(20) DEFAULT 'STANDARD',
    media_fit VARCHAR(20) DEFAULT 'COVER',
    display_order INT DEFAULT 0,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
