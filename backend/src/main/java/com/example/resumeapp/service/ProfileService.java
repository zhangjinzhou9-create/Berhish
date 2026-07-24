package com.example.resumeapp.service;

import com.example.resumeapp.service.AccountService.UserAccount;
import jakarta.annotation.PostConstruct;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ProfileService {

    private final JdbcTemplate jdbcTemplate;
    private final AccountService accountService;

    public ProfileService(JdbcTemplate jdbcTemplate, AccountService accountService) {
        this.jdbcTemplate = jdbcTemplate;
        this.accountService = accountService;
    }

    public Map<String, Object> getProfileFor(Optional<UserAccount> currentAccount) {
        if (currentAccount.isPresent()) {
            return readUserProfile(currentAccount.get(), true);
        }
        Optional<UserAccount> featured = accountService.featuredUser();
        if (featured.isPresent()) {
            return readUserProfile(featured.get(), false);
        }
        Map<String, Object> fallback = getProfile();
        fallback.remove("studentId");
        fallback.remove("phone");
        fallback.put("editable", false);
        fallback.put("guestView", true);
        return fallback;
    }

    public Map<String, Object> updateProfile(long userId, Map<String, Object> body) {
        UserAccount account = accountService.requireById(userId);
        accountService.ensureProfile(userId, value(body, "name", account.displayName()), value(body, "email", ""));

        Map<String, Object> current = readUserProfile(account, true);
        String name = value(body, "name", current.get("name"));
        String email = value(body, "email", current.get("email"));
        String phone = value(body, "phone", current.get("phone"));
        String title = value(body, "title", current.get("title"));
        String summary = value(body, "summary", current.get("summary"));
        String country = value(body, "country", current.get("country"));
        String city = value(body, "city", current.get("city"));
        String visibility = value(body, "visibility", current.get("visibility")).toUpperCase();
        if (!"PUBLIC".equals(visibility) && !"PRIVATE".equals(visibility)) {
            visibility = "PUBLIC";
        }

        jdbcTemplate.update(
                "UPDATE auth_users SET display_name = ? WHERE id = ?",
                name,
                userId
        );
        jdbcTemplate.update(
                """
                UPDATE user_profiles
                SET email = ?, phone = ?, title = ?, summary = ?, country = ?, city = ?,
                    visibility = ?, updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ?
                """,
                email,
                phone,
                title,
                summary,
                country,
                city,
                visibility,
                userId
        );

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("saved", true);
        result.put("message", "Profile updated successfully.");
        result.put("profile", readUserProfile(accountService.requireById(userId), true));
        return result;
    }

    private Map<String, Object> readUserProfile(UserAccount account, boolean owner) {
        accountService.ensureProfile(account.id(), account.displayName(), "");
        Map<String, Object> personal = jdbcTemplate.queryForMap(
                """
                SELECT p.email, p.phone, p.title, p.summary, p.country, p.city, p.visibility,
                       a.display_name, a.avatar_url, a.username, a.user_type
                FROM user_profiles p
                JOIN auth_users a ON a.id = p.user_id
                WHERE p.user_id = ?
                """,
                account.id()
        );

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("userId", account.id());
        result.put("username", personal.get("username"));
        result.put("name", personal.get("display_name"));
        result.put("avatarUrl", personal.get("avatar_url"));
        result.put("role", personal.get("user_type"));
        result.put("email", personal.get("email"));
        if (owner) {
            result.put("phone", personal.get("phone"));
        }
        result.put("title", personal.get("title"));
        result.put("summary", personal.get("summary"));
        result.put("country", personal.get("country"));
        result.put("city", personal.get("city"));
        result.put("location", personal.get("city") + ", " + personal.get("country"));
        result.put("visibility", personal.get("visibility"));
        result.put("editable", owner);
        result.put("guestView", !owner);
        result.put("education", safeLegacyList("education"));
        result.put("skills", safeLegacyList("skills"));
        result.put("projects", safeLegacyList("projects"));
        result.put("languages", safeLegacyList("languages"));
        result.put("databaseAvailable", true);
        return result;
    }

    @SuppressWarnings("unchecked")
    private Object safeLegacyList(String key) {
        try {
            return readProfileFromDatabase().getOrDefault(key, List.of());
        } catch (DataAccessException e) {
            return defaultProfile().getOrDefault(key, List.of());
        }
    }

    @PostConstruct
    public void prepareProfileTable() {
        addColumnIfMissing("country", "VARCHAR(100) DEFAULT 'Japan'");
        addColumnIfMissing("city", "VARCHAR(100) DEFAULT 'Kyoto'");
        try {
            jdbcTemplate.update("UPDATE personal_info SET country = COALESCE(country, 'Japan'), city = COALESCE(city, 'Kyoto') WHERE id = 1");
        } catch (DataAccessException ignored) {
            // Classroom-friendly startup: API responses still show database problems clearly.
        }
    }

    public Map<String, Object> getProfile() {
        try {
            return readProfileFromDatabase();
        } catch (DataAccessException e) {
            Map<String, Object> fallback = defaultProfile();
            fallback.put("databaseAvailable", false);
            fallback.put("message", "Profile database could not be read. Default profile data was returned.");
            return fallback;
        }
    }

    public Map<String, Object> updateProfile(Map<String, Object> body) {
        Map<String, Object> current = getProfile();

        String name = value(body, "name", current.get("name"));
        String studentId = value(body, "studentId", current.get("studentId"));
        String email = value(body, "email", current.get("email"));
        String phone = value(body, "phone", current.get("phone"));
        String country = value(body, "country", current.get("country"));
        String city = value(body, "city", current.get("city"));
        String location = value(body, "location", city + ", " + country);
        String title = value(body, "title", current.get("title"));
        String summary = value(body, "summary", current.get("summary"));

        Map<String, Object> result = new LinkedHashMap<>();
        try {
            int updated = jdbcTemplate.update(
                    "UPDATE personal_info SET name = ?, student_id = ?, email = ?, phone = ?, location = ?, title = ?, summary = ?, country = ?, city = ? WHERE id = 1",
                    name, studentId, email, phone, location, title, summary, country, city
            );

            if (updated == 0) {
                jdbcTemplate.update(
                        "INSERT INTO personal_info (id, name, student_id, email, phone, location, title, summary, country, city) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                        name, studentId, email, phone, location, title, summary, country, city
                );
            }

            result.put("saved", true);
            result.put("message", "Profile updated successfully.");
            result.put("profile", getProfile());
        } catch (DataAccessException e) {
            Map<String, Object> fallback = defaultProfile();
            fallback.put("name", name);
            fallback.put("studentId", studentId);
            fallback.put("email", email);
            fallback.put("phone", phone);
            fallback.put("location", location);
            fallback.put("title", title);
            fallback.put("summary", summary);
            fallback.put("country", country);
            fallback.put("city", city);
            fallback.put("databaseAvailable", false);

            result.put("saved", false);
            result.put("message", "Profile was not saved. Please check MySQL and the personal_info table.");
            result.put("profile", fallback);
        }
        return result;
    }

    public Map<String, Object> readBasicProfileSafely() {
        Map<String, Object> result = new LinkedHashMap<>();
        try {
            Map<String, Object> personal = jdbcTemplate.queryForMap(
                    "SELECT name, country, city FROM personal_info WHERE id = 1"
            );
            result.put("name", personal.get("name"));
            result.put("country", personal.get("country"));
            result.put("city", personal.get("city"));
        } catch (Exception e) {
            Map<String, Object> fallback = defaultProfile();
            result.put("name", fallback.get("name"));
            result.put("country", fallback.get("country"));
            result.put("city", fallback.get("city"));
        }
        return result;
    }

    private Map<String, Object> readProfileFromDatabase() {
        Map<String, Object> result = new LinkedHashMap<>();

        Map<String, Object> personal = jdbcTemplate.queryForMap(
                "SELECT name, student_id, email, phone, location, title, summary, country, city " +
                        "FROM personal_info WHERE id = 1"
        );

        result.put("name", personal.get("name"));
        result.put("studentId", personal.get("student_id"));
        result.put("email", personal.get("email"));
        result.put("phone", personal.get("phone"));
        result.put("location", personal.get("location"));
        result.put("title", personal.get("title"));
        result.put("summary", personal.get("summary"));
        result.put("country", personal.get("country"));
        result.put("city", personal.get("city"));

        result.put("education", jdbcTemplate.query(
                "SELECT school, degree, major, period, description FROM education ORDER BY id",
                (rs, rowNum) -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("school", rs.getString("school"));
                    row.put("degree", rs.getString("degree"));
                    row.put("major", rs.getString("major"));
                    row.put("period", rs.getString("period"));
                    row.put("description", rs.getString("description"));
                    return row;
                }
        ));

        result.put("skills", jdbcTemplate.query(
                "SELECT skill_name FROM skills ORDER BY id",
                (rs, rowNum) -> rs.getString("skill_name")
        ));

        result.put("projects", jdbcTemplate.query(
                "SELECT project_name, project_description FROM projects ORDER BY id",
                (rs, rowNum) -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("name", rs.getString("project_name"));
                    row.put("description", rs.getString("project_description"));
                    return row;
                }
        ));

        result.put("languages", jdbcTemplate.query(
                "SELECT language_name, language_level FROM languages ORDER BY id",
                (rs, rowNum) -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("name", rs.getString("language_name"));
                    row.put("level", rs.getString("language_level"));
                    return row;
                }
        ));
        result.put("databaseAvailable", true);

        return result;
    }

    private void addColumnIfMissing(String columnName, String columnType) {
        try {
            Integer count = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM information_schema.COLUMNS " +
                            "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'personal_info' AND COLUMN_NAME = ?",
                    Integer.class,
                    columnName
            );
            if (count != null && count == 0) {
                jdbcTemplate.execute("ALTER TABLE personal_info ADD COLUMN " + columnName + " " + columnType);
            }
        } catch (DataAccessException ignored) {
            // Existing DB errors can still be checked from the API response or MySQL client.
        }
    }

    private String value(Map<String, Object> body, String key, Object fallback) {
        Object raw = body.get(key);
        if (raw == null) {
            return fallback == null ? "" : fallback.toString();
        }
        return raw.toString();
    }

    private Map<String, Object> defaultProfile() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("name", "シュフシン");
        result.put("studentId", "M25W7195");
        result.put("email", "st232527@kcg.edu");
        result.put("phone", "");
        result.put("location", "Kyoto, Japan");
        result.put("title", "Visual diary / web design student");
        result.put("summary", "Photography, sketches, and small web experiments collected between classes and walks through Kyoto.");
        result.put("country", "Japan");
        result.put("city", "Kyoto");

        List<Map<String, Object>> education = new ArrayList<>();
        Map<String, Object> school = new LinkedHashMap<>();
        school.put("school", "The Kyoto College of Graduate Studies for Informatics");
        school.put("degree", "Master Program");
        school.put("major", "Network Management");
        school.put("period", "2025 - Present");
        school.put("description", "Web services, database systems, cloud deployment, and visual interface design.");
        education.add(school);
        result.put("education", education);

        result.put("skills", List.of(
                "Java and Spring Boot web services",
                "HTML, CSS, and JavaScript interface design",
                "MySQL data persistence",
                "OAuth 2.0 and secure account sessions",
                "Docker and Azure container deployment"
        ));

        List<Map<String, Object>> projects = new ArrayList<>();
        Map<String, Object> campusFlow = new LinkedHashMap<>();
        campusFlow.put("name", "CampusFlow");
        campusFlow.put("description", "A three-page web service client combining live daily information, a personal portfolio, secure accounts, and cloud deployment.");
        projects.add(campusFlow);
        result.put("projects", projects);

        List<Map<String, Object>> languages = new ArrayList<>();
        languages.add(language("Chinese", "Native"));
        languages.add(language("Japanese", "Daily communication"));
        languages.add(language("English", "Reading and presentation"));
        result.put("languages", languages);
        return result;
    }

    private Map<String, Object> language(String name, String level) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("name", name);
        item.put("level", level);
        return item;
    }
}
