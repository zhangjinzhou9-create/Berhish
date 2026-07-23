INSERT INTO personal_info
    (id, name, student_id, email, phone, location, title, summary, country, city)
SELECT
    1, 'シュフシン', 'M25W7195', 'st232527@kcg.edu', '123-4567-8901',
    'Kyoto, Japan', 'Information Technology / Network Management Student',
    'I am studying information technology and network management. Campus Flow is my integrated web project for profile management, weather and country information, JWT authorization, OAuth API verification, Docker, and cloud deployment.',
    'Japan', 'Kyoto'
WHERE NOT EXISTS (SELECT 1 FROM personal_info WHERE id = 1);

INSERT INTO education (id, school, degree, major, period, description)
SELECT
    1, 'The Kyoto College of Graduate Studies for Informatics',
    'Master Program', 'Network Management', '2025 - Present',
    'Main study areas include network management, cloud systems, database basics, web APIs, and software development.'
WHERE NOT EXISTS (SELECT 1 FROM education WHERE id = 1);

INSERT INTO skills (id, skill_name)
SELECT 1, 'Java and Spring Boot API development'
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE id = 1);
INSERT INTO skills (id, skill_name)
SELECT 2, 'HTML, CSS and JavaScript frontend development'
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE id = 2);
INSERT INTO skills (id, skill_name)
SELECT 3, 'MySQL database design and SQL operations'
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE id = 3);
INSERT INTO skills (id, skill_name)
SELECT 4, 'JWT authentication and role-based authorization'
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE id = 4);
INSERT INTO skills (id, skill_name)
SELECT 5, 'OAuth 2.0 integration with Google and GitHub'
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE id = 5);
INSERT INTO skills (id, skill_name)
SELECT 6, 'Docker, Docker Compose and Azure container deployment'
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE id = 6);

INSERT INTO projects (id, project_name, project_description)
SELECT
    1, 'Campus Flow',
    'A Spring Boot web application that combines a student profile, weather and country APIs, JWT login, OAuth verification, database persistence, Docker deployment, and Azure App Service deployment.'
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE id = 1);

INSERT INTO languages (id, language_name, language_level)
SELECT 1, 'Chinese', 'Native'
WHERE NOT EXISTS (SELECT 1 FROM languages WHERE id = 1);
INSERT INTO languages (id, language_name, language_level)
SELECT 2, 'Japanese', 'Daily communication / learning toward JLPT N2'
WHERE NOT EXISTS (SELECT 1 FROM languages WHERE id = 2);
INSERT INTO languages (id, language_name, language_level)
SELECT 3, 'English', 'Basic reading and presentation'
WHERE NOT EXISTS (SELECT 1 FROM languages WHERE id = 3);

-- Remove the single production persistence-probe account after verification.
DELETE FROM auth_users WHERE username = 'cloud-admin-probe';
