INSERT INTO personal_info
    (id, name, student_id, email, phone, location, title, summary, country, city)
SELECT
    1, 'シュフシン', 'M25W7195', 'st232527@kcg.edu', '',
    'Kyoto, Japan', 'Visual diary / web design student',
    'Photography, sketches, and small web experiments collected between classes and walks through Kyoto.',
    'Japan', 'Kyoto'
WHERE NOT EXISTS (SELECT 1 FROM personal_info WHERE id = 1);

INSERT INTO education (id, school, degree, major, period, description)
SELECT
    1, 'The Kyoto College of Graduate Studies for Informatics',
    'Master Program', 'Network Management', '2025 - Present',
    'Web services, database systems, cloud deployment, and visual interface design.'
WHERE NOT EXISTS (SELECT 1 FROM education WHERE id = 1);

INSERT INTO skills (id, skill_name)
SELECT 1, 'Java and Spring Boot web services'
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE id = 1);
INSERT INTO skills (id, skill_name)
SELECT 2, 'HTML, CSS, and JavaScript interface design'
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE id = 2);
INSERT INTO skills (id, skill_name)
SELECT 3, 'MySQL data persistence'
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE id = 3);
INSERT INTO skills (id, skill_name)
SELECT 4, 'OAuth 2.0 and secure account sessions'
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE id = 4);
INSERT INTO skills (id, skill_name)
SELECT 5, 'Docker and Azure container deployment'
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE id = 5);

INSERT INTO projects (id, project_name, project_description)
SELECT
    1, 'CampusFlow',
    'A three-page web service client combining live daily information, a personal portfolio, secure accounts, and cloud deployment.'
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE id = 1);

INSERT INTO languages (id, language_name, language_level)
SELECT 1, 'Chinese', 'Native'
WHERE NOT EXISTS (SELECT 1 FROM languages WHERE id = 1);
INSERT INTO languages (id, language_name, language_level)
SELECT 2, 'Japanese', 'Daily communication'
WHERE NOT EXISTS (SELECT 1 FROM languages WHERE id = 2);
INSERT INTO languages (id, language_name, language_level)
SELECT 3, 'English', 'Reading and presentation'
WHERE NOT EXISTS (SELECT 1 FROM languages WHERE id = 3);

DELETE FROM auth_users WHERE username = 'cloud-admin-probe';
