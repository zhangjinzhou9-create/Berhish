USE user_db2;

ALTER TABLE personal_info
ADD COLUMN country VARCHAR(100) DEFAULT 'Japan';

ALTER TABLE personal_info
ADD COLUMN city VARCHAR(100) DEFAULT 'Kyoto';

UPDATE personal_info
SET country = COALESCE(country, 'Japan'),
    city = COALESCE(city, 'Kyoto')
WHERE id = 1;

SELECT id, name, student_id, country, city FROM personal_info;
