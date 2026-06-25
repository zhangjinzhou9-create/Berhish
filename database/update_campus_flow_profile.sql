USE user_db2;

UPDATE personal_info
SET
    name = 'シュフシン',
    student_id = 'M25W7195',
    email = 'st232527@kcg.edu',
    phone = '123-4567-8901',
    location = 'Kyoto, Japan',
    title = 'Information Technology / Network Management Student',
    summary = 'I am studying information technology and network management. Campus Flow is my integrated web project for profile management, weather and country information, JWT authorization, OAuth API verification, Docker, and cloud deployment.',
    country = 'Japan',
    city = 'Kyoto'
WHERE id = 1;

DELETE FROM education;
INSERT INTO education (id, school, degree, major, period, description)
VALUES
    (1, 'The Kyoto College of Graduate Studies for Informatics',
     'Master Program', 'Network Management', '2025 - Present',
     'Main study areas include network management, cloud systems, database basics, web APIs, and software development.');

DELETE FROM skills;
INSERT INTO skills (id, skill_name)
VALUES
    (1, 'Java and Spring Boot API development'),
    (2, 'HTML, CSS and JavaScript frontend development'),
    (3, 'MySQL database design and SQL operations'),
    (4, 'JWT authentication and role-based authorization'),
    (5, 'OAuth 2.0 integration with Google and GitHub'),
    (6, 'Docker, Docker Compose and Azure container deployment');

DELETE FROM projects;
INSERT INTO projects (id, project_name, project_description)
VALUES
    (1, 'Campus Flow',
     'A Spring Boot web application that combines a student profile, weather and country APIs, JWT login, OAuth verification, MySQL persistence, Docker sidecar deployment, and Azure App Service deployment.');

DELETE FROM languages;
INSERT INTO languages (id, language_name, language_level)
VALUES
    (1, 'Chinese', 'Native'),
    (2, 'Japanese', 'Daily communication / learning toward JLPT N2'),
    (3, 'English', 'Basic reading and presentation');
