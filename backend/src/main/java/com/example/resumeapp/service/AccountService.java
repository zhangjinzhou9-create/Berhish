package com.example.resumeapp.service;

import com.example.resumeapp.controller.JwtUtil;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class AccountService {

    public static final String SESSION_COOKIE = "campusflow_session";

    private final JdbcTemplate jdbcTemplate;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Value("${app.admin-username:}")
    private String adminUsername;

    @Value("${app.admin-password:}")
    private String adminPassword;

    public AccountService(JdbcTemplate jdbcTemplate, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.jdbcTemplate = jdbcTemplate;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @PostConstruct
    public void initializeSchema() {
        jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS auth_users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(50) NOT NULL UNIQUE,
                    password VARCHAR(100) NOT NULL,
                    user_type VARCHAR(20) NOT NULL
                )
                """);
        addColumnIfMissing("auth_users", "display_name", "VARCHAR(120)");
        addColumnIfMissing("auth_users", "avatar_url", "VARCHAR(600)");
        addColumnIfMissing("auth_users", "provider", "VARCHAR(30)");
        addColumnIfMissing("auth_users", "provider_subject", "VARCHAR(190)");
        addColumnIfMissing("auth_users", "enabled", "BOOLEAN DEFAULT TRUE");
        addColumnIfMissing("auth_users", "created_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
        try {
            jdbcTemplate.execute("CREATE UNIQUE INDEX uq_auth_provider_subject ON auth_users(provider, provider_subject)");
        } catch (DataAccessException ignored) {
            // The index already exists.
        }
        jdbcTemplate.update(
                """
                UPDATE auth_users
                SET display_name = COALESCE(display_name, username),
                    provider = COALESCE(provider, 'local'),
                    provider_subject = COALESCE(provider_subject, username),
                    enabled = COALESCE(enabled, TRUE)
                """
        );

        jdbcTemplate.execute("""
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
                )
                """);

        jdbcTemplate.execute("""
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
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                """);

        jdbcTemplate.update(
                """
                DELETE FROM auth_users
                WHERE username IN ('student', 'teacher', 'admin')
                  AND provider = 'local'
                  AND NOT EXISTS (SELECT 1 FROM user_profiles p WHERE p.user_id = auth_users.id)
                """
        );
        ensureConfiguredAdmin();
    }

    public UserAccount register(String username, String rawPassword) {
        validateUsername(username);
        validatePassword(rawPassword);
        try {
            long userId = insertUser(
                    username,
                    passwordEncoder.encode(rawPassword),
                    "USER",
                    username,
                    "",
                    "local",
                    username
            );
            ensureProfile(userId, username, "");
            seedPortfolio(userId);
            return requireById(userId);
        } catch (DuplicateKeyException e) {
            throw new AccountConflictException("username already exists");
        }
    }

    public UserAccount authenticate(String username, String rawPassword) {
        if (username == null || rawPassword == null) {
            throw new AccountAuthenticationException("username and password are required");
        }
        UserAccount account = findByUsername(username)
                .orElseThrow(() -> new AccountAuthenticationException("unknown username or password"));
        if (!account.enabled()) {
            throw new AccountAuthenticationException("this account is disabled");
        }
        String storedPassword = jdbcTemplate.queryForObject(
                "SELECT password FROM auth_users WHERE id = ?",
                String.class,
                account.id()
        );
        if (storedPassword == null || !storedPassword.startsWith("$2")
                || !passwordEncoder.matches(rawPassword, storedPassword)) {
            throw new AccountAuthenticationException("unknown username or password");
        }
        return account;
    }

    public Optional<UserAccount> resolve(HttpServletRequest request, Authentication authentication) {
        if (authentication instanceof OAuth2AuthenticationToken oauth
                && authentication.isAuthenticated()) {
            OAuth2User principal = oauth.getPrincipal();
            return Optional.of(upsertOAuthUser(oauth.getAuthorizedClientRegistrationId(), principal));
        }

        String token = readToken(request);
        if (token == null || !jwtUtil.validateToken(token)) {
            return Optional.empty();
        }
        return findByUsername(jwtUtil.extractUsername(token))
                .filter(UserAccount::enabled);
    }

    public String issueToken(UserAccount account) {
        return jwtUtil.generateToken(account.username(), account.role());
    }

    public Optional<UserAccount> findByUsername(String username) {
        List<UserAccount> users = jdbcTemplate.query(
                """
                SELECT id, username, user_type, COALESCE(display_name, username) AS display_name,
                       COALESCE(avatar_url, '') AS avatar_url, COALESCE(provider, 'local') AS provider,
                       COALESCE(enabled, TRUE) AS enabled
                FROM auth_users WHERE username = ?
                """,
                (rs, rowNum) -> new UserAccount(
                        rs.getLong("id"),
                        rs.getString("username"),
                        rs.getString("user_type"),
                        rs.getString("display_name"),
                        rs.getString("avatar_url"),
                        rs.getString("provider"),
                        rs.getBoolean("enabled")
                ),
                username
        );
        return users.stream().findFirst();
    }

    public UserAccount requireById(long id) {
        return jdbcTemplate.queryForObject(
                """
                SELECT id, username, user_type, COALESCE(display_name, username) AS display_name,
                       COALESCE(avatar_url, '') AS avatar_url, COALESCE(provider, 'local') AS provider,
                       COALESCE(enabled, TRUE) AS enabled
                FROM auth_users WHERE id = ?
                """,
                (rs, rowNum) -> new UserAccount(
                        rs.getLong("id"),
                        rs.getString("username"),
                        rs.getString("user_type"),
                        rs.getString("display_name"),
                        rs.getString("avatar_url"),
                        rs.getString("provider"),
                        rs.getBoolean("enabled")
                ),
                id
        );
    }

    public Optional<UserAccount> featuredUser() {
        List<UserAccount> users = jdbcTemplate.query(
                """
                SELECT a.id, a.username, a.user_type, COALESCE(a.display_name, a.username) AS display_name,
                       COALESCE(a.avatar_url, '') AS avatar_url, COALESCE(a.provider, 'local') AS provider,
                       COALESCE(a.enabled, TRUE) AS enabled
                FROM auth_users a
                JOIN user_profiles p ON p.user_id = a.id
                WHERE COALESCE(a.enabled, TRUE) = TRUE AND p.visibility = 'PUBLIC' AND a.user_type <> 'ADMIN'
                ORDER BY a.id LIMIT 1
                """,
                (rs, rowNum) -> new UserAccount(
                        rs.getLong("id"),
                        rs.getString("username"),
                        rs.getString("user_type"),
                        rs.getString("display_name"),
                        rs.getString("avatar_url"),
                        rs.getString("provider"),
                        rs.getBoolean("enabled")
                )
        );
        return users.stream().findFirst();
    }

    public List<Map<String, Object>> listUsers(UserAccount requester) {
        requireAdmin(requester);
        return jdbcTemplate.query(
                """
                SELECT id, username, user_type, COALESCE(display_name, username) AS display_name,
                       COALESCE(provider, 'local') AS provider, COALESCE(enabled, TRUE) AS enabled,
                       created_at
                FROM auth_users ORDER BY id
                """,
                (rs, rowNum) -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("id", rs.getLong("id"));
                    row.put("username", rs.getString("username"));
                    row.put("role", rs.getString("user_type"));
                    row.put("displayName", rs.getString("display_name"));
                    row.put("provider", rs.getString("provider"));
                    row.put("enabled", rs.getBoolean("enabled"));
                    row.put("createdAt", rs.getObject("created_at"));
                    return row;
                }
        );
    }

    public Map<String, Object> setUserEnabled(UserAccount requester, long userId, boolean enabled) {
        requireAdmin(requester);
        if (requester.id() == userId && !enabled) {
            throw new IllegalArgumentException("administrator cannot disable the active account");
        }
        int updated = jdbcTemplate.update("UPDATE auth_users SET enabled = ? WHERE id = ?", enabled, userId);
        if (updated == 0) {
            throw new IllegalArgumentException("user not found");
        }
        return Map.of("updated", true, "userId", userId, "enabled", enabled);
    }

    public void ensureProfile(long userId, String displayName, String email) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM user_profiles WHERE user_id = ?",
                Integer.class,
                userId
        );
        if (count != null && count == 0) {
            jdbcTemplate.update(
                    """
                    INSERT INTO user_profiles
                        (user_id, email, phone, title, summary, country, city, visibility)
                    VALUES (?, ?, '', 'Student / Creator',
                            'A personal space for daily notes, selected work, and ongoing study.',
                            'Japan', 'Kyoto', 'PUBLIC')
                    """,
                    userId,
                    email == null ? "" : email
            );
        }
        if (displayName != null && !displayName.isBlank()) {
            jdbcTemplate.update(
                    "UPDATE auth_users SET display_name = ? WHERE id = ?",
                    displayName,
                    userId
            );
        }
    }

    private UserAccount upsertOAuthUser(String provider, OAuth2User principal) {
        String subject = firstNonBlank(
                stringAttribute(principal, "sub"),
                stringAttribute(principal, "id"),
                principal.getName()
        );
        List<Long> ids = jdbcTemplate.query(
                "SELECT id FROM auth_users WHERE provider = ? AND provider_subject = ?",
                (rs, rowNum) -> rs.getLong("id"),
                provider,
                subject
        );
        String email = stringAttribute(principal, "email");
        String displayName = firstNonBlank(
                stringAttribute(principal, "name"),
                stringAttribute(principal, "login"),
                email,
                provider + " user"
        );
        String avatar = firstNonBlank(
                stringAttribute(principal, "avatar_url"),
                stringAttribute(principal, "picture"),
                ""
        );

        long userId;
        if (ids.isEmpty()) {
            String usernameBase = sanitizeUsername(firstNonBlank(
                    stringAttribute(principal, "login"),
                    email == null ? null : email.split("@")[0],
                    provider + "_" + subject
            ));
            String username = uniqueUsername(usernameBase);
            userId = insertUser(
                    username,
                    passwordEncoder.encode(UUID.randomUUID().toString()),
                    "USER",
                    displayName,
                    avatar,
                    provider,
                    subject
            );
            ensureProfile(userId, displayName, email);
            seedPortfolio(userId);
        } else {
            userId = ids.get(0);
            jdbcTemplate.update(
                    "UPDATE auth_users SET display_name = ?, avatar_url = ?, enabled = TRUE WHERE id = ?",
                    displayName,
                    avatar,
                    userId
            );
            ensureProfile(userId, displayName, email);
            if (email != null && !email.isBlank()) {
                jdbcTemplate.update("UPDATE user_profiles SET email = ? WHERE user_id = ?", email, userId);
            }
        }
        return requireById(userId);
    }

    private long insertUser(
            String username,
            String encodedPassword,
            String role,
            String displayName,
            String avatarUrl,
            String provider,
            String providerSubject
    ) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement statement = connection.prepareStatement(
                    """
                    INSERT INTO auth_users
                        (username, password, user_type, display_name, avatar_url, provider, provider_subject, enabled)
                    VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)
                    """,
                    new String[]{"id"}
            );
            statement.setString(1, username);
            statement.setString(2, encodedPassword);
            statement.setString(3, role);
            statement.setString(4, displayName);
            statement.setString(5, avatarUrl);
            statement.setString(6, provider);
            statement.setString(7, providerSubject);
            return statement;
        }, keyHolder);
        Number key = keyHolder.getKey();
        if (key == null) {
            throw new IllegalStateException("user id was not generated");
        }
        return key.longValue();
    }

    private void ensureConfiguredAdmin() {
        if (adminUsername == null || adminUsername.isBlank()
                || adminPassword == null || adminPassword.isBlank()) {
            return;
        }
        validateUsername(adminUsername);
        validatePassword(adminPassword);
        if (findByUsername(adminUsername).isEmpty()) {
            long userId = insertUser(
                    adminUsername,
                    passwordEncoder.encode(adminPassword),
                    "ADMIN",
                    "Administrator",
                    "",
                    "local",
                    adminUsername
            );
            ensureProfile(userId, "Administrator", "");
        }
    }

    private void seedPortfolio(long userId) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM portfolio_items WHERE user_id = ?",
                Integer.class,
                userId
        );
        if (count != null && count > 0) {
            return;
        }
        insertPortfolioSeed(userId, "PHOTOGRAPHY", "Temple through maple",
                "A temple framed by red maple leaves.",
                "assets/campus-extra-red-temple.jpg", 1);
        insertPortfolioSeed(userId, "PHOTOGRAPHY", "Magnolia on white",
                "Magnolia branches crossing a white facade.",
                "assets/campus-photo-07.jpg", 2);
        insertPortfolioSeed(userId, "PHOTOGRAPHY", "Black cat in the grass",
                "A black cat watching from between green leaves.",
                "assets/campus-photo-05.jpg", 3);
    }

    private void insertPortfolioSeed(long userId, String type, String title, String description, String imageUrl, int order) {
        jdbcTemplate.update(
                """
                INSERT INTO portfolio_items
                    (user_id, item_type, title, description, image_url, external_url, display_order, is_public)
                VALUES (?, ?, ?, ?, ?, '', ?, TRUE)
                """,
                userId,
                type,
                title,
                description,
                imageUrl,
                order
        );
    }

    private String readToken(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (SESSION_COOKIE.equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }

    private void addColumnIfMissing(String table, String column, String definition) {
        try {
            Integer count = jdbcTemplate.queryForObject(
                    """
                    SELECT COUNT(*) FROM information_schema.COLUMNS
                    WHERE LOWER(TABLE_NAME) = LOWER(?) AND LOWER(COLUMN_NAME) = LOWER(?)
                    """,
                    Integer.class,
                    table,
                    column
            );
            if (count != null && count == 0) {
                jdbcTemplate.execute("ALTER TABLE " + table + " ADD COLUMN " + column + " " + definition);
            }
        } catch (DataAccessException ignored) {
            // A later API response will expose database availability without losing existing data.
        }
    }

    private void validateUsername(String username) {
        if (username == null || !username.matches("[A-Za-z0-9._-]{3,50}")) {
            throw new IllegalArgumentException("username must be 3-50 letters, numbers, dots, underscores, or hyphens");
        }
    }

    private void validatePassword(String password) {
        int bytes = password == null ? 0 : password.getBytes(java.nio.charset.StandardCharsets.UTF_8).length;
        if (bytes < 12 || bytes > 72) {
            throw new IllegalArgumentException("password must contain 12-72 UTF-8 bytes");
        }
    }

    private void requireAdmin(UserAccount requester) {
        if (requester == null || !"ADMIN".equals(requester.role())) {
            throw new AccountAuthorizationException("administrator account required");
        }
    }

    private String stringAttribute(OAuth2User principal, String name) {
        Object value = principal.getAttribute(name);
        return value == null ? null : String.valueOf(value);
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return "";
    }

    private String sanitizeUsername(String value) {
        String sanitized = value == null ? "user" : value
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9._-]", "_")
                .replaceAll("_+", "_");
        if (sanitized.length() < 3) {
            sanitized = "user_" + sanitized;
        }
        return sanitized.substring(0, Math.min(42, sanitized.length()));
    }

    private String uniqueUsername(String base) {
        String candidate = base;
        int suffix = 2;
        while (findByUsername(candidate).isPresent()) {
            candidate = base.substring(0, Math.min(base.length(), 42)) + "_" + suffix++;
        }
        return candidate;
    }

    public record UserAccount(
            long id,
            String username,
            String role,
            String displayName,
            String avatarUrl,
            String provider,
            boolean enabled
    ) {
        public Map<String, Object> toPublicMap() {
            Map<String, Object> result = new LinkedHashMap<>();
            result.put("id", id);
            result.put("username", username);
            result.put("role", role);
            result.put("displayName", displayName);
            result.put("avatarUrl", avatarUrl);
            result.put("provider", provider);
            return result;
        }
    }

    public static class AccountAuthenticationException extends RuntimeException {
        public AccountAuthenticationException(String message) {
            super(message);
        }
    }

    public static class AccountAuthorizationException extends RuntimeException {
        public AccountAuthorizationException(String message) {
            super(message);
        }
    }

    public static class AccountConflictException extends RuntimeException {
        public AccountConflictException(String message) {
            super(message);
        }
    }
}
