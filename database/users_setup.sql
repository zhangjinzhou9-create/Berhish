USE user_db2;

CREATE TABLE IF NOT EXISTS auth_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(50) NOT NULL,
    user_type VARCHAR(20) NOT NULL
);

INSERT IGNORE INTO auth_users (username, password, user_type)
VALUES
    ('student', 'pass', 'STUDENT'),
    ('teacher', 'pass', 'TEACHER'),
    ('admin', 'pass', 'ADMIN');

SELECT id, username, password, user_type
FROM auth_users
ORDER BY id;
