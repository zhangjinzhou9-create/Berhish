package com.example.resumeapp.controller;

import jakarta.annotation.PostConstruct;
import org.springframework.dao.DataAccessException;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class AuthController {

    private final JdbcTemplate jdbcTemplate;
    private final JwtUtil jwtUtil;

    public AuthController(JdbcTemplate jdbcTemplate, JwtUtil jwtUtil) {
        this.jdbcTemplate = jdbcTemplate;
        this.jwtUtil = jwtUtil;
    }

    @PostConstruct
    public void prepareUsersTable() {
        try {
            jdbcTemplate.execute("""
                    CREATE TABLE IF NOT EXISTS auth_users (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        username VARCHAR(50) NOT NULL UNIQUE,
                        password VARCHAR(50) NOT NULL,
                        user_type VARCHAR(20) NOT NULL
                    )
                    """);
            jdbcTemplate.update("INSERT IGNORE INTO auth_users (username, password, user_type) VALUES ('student', 'pass', 'STUDENT')");
            jdbcTemplate.update("INSERT IGNORE INTO auth_users (username, password, user_type) VALUES ('teacher', 'pass', 'TEACHER')");
            jdbcTemplate.update("INSERT IGNORE INTO auth_users (username, password, user_type) VALUES ('admin', 'pass', 'ADMIN')");
        } catch (DataAccessException ignored) {
            // The endpoint response will show the database problem during testing.
        }
    }

    @PostMapping("/authenticate")
    public ResponseEntity<?> authenticate(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");

        try {
            List<Map<String, Object>> users = jdbcTemplate.queryForList(
                    "SELECT username, password, user_type FROM auth_users WHERE username = ?",
                    username
            );

            if (users.isEmpty()) {
                return ResponseEntity.status(401).body(Map.of("error", "unknown user"));
            }

            Map<String, Object> user = users.get(0);
            if (!String.valueOf(user.get("password")).equals(password)) {
                return ResponseEntity.status(401).body(Map.of("error", "wrong password"));
            }

            String userType = String.valueOf(user.get("user_type"));
            String token = jwtUtil.generateToken(username, userType);

            return ResponseEntity.ok(Map.of(
                    "status", "logged_in",
                    "token", token,
                    "user", Map.of("username", username, "userType", userType)
            ));
        } catch (DataAccessException e) {
            return ResponseEntity.status(500).body(Map.of("error", "auth_users table could not be read"));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");
        String userType = body.get("userType");

        if (!List.of("STUDENT", "TEACHER", "ADMIN").contains(userType)) {
            return ResponseEntity.badRequest().body(Map.of("error", "userType must be STUDENT, TEACHER, or ADMIN"));
        }

        try {
            int inserted = jdbcTemplate.update(
                    "INSERT IGNORE INTO auth_users (username, password, user_type) VALUES (?, ?, ?)",
                    username, password, userType
            );
            if (inserted == 0) {
                return ResponseEntity.status(409).body(Map.of("error", "username already exists"));
            }
            return ResponseEntity.ok(Map.of("registered", true, "username", username, "userType", userType));
        } catch (DataAccessException e) {
            return ResponseEntity.status(500).body(Map.of("error", "auth_users table could not be written"));
        }
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verify(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        UserToken user = readToken(authHeader);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "missing or invalid token"));
        }
        return ResponseEntity.ok(Map.of("username", user.username(), "userType", user.userType()));
    }

    @GetMapping("/student-area")
    public ResponseEntity<?> studentArea(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        UserToken user = readToken(authHeader);
        if (user == null) return ResponseEntity.status(401).body(Map.of("error", "missing or invalid token"));
        if (!allowed(user, "STUDENT", "TEACHER", "ADMIN")) return ResponseEntity.status(403).body(Map.of("error", "forbidden"));

        return ResponseEntity.ok(Map.of("message", "Student area", "userType", user.userType()));
    }

    @GetMapping("/teacher-area")
    public ResponseEntity<?> teacherArea(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        UserToken user = readToken(authHeader);
        if (user == null) return ResponseEntity.status(401).body(Map.of("error", "missing or invalid token"));
        if (!allowed(user, "TEACHER", "ADMIN")) return ResponseEntity.status(403).body(Map.of("error", "forbidden"));

        return ResponseEntity.ok(Map.of("message", "Teacher area", "userType", user.userType()));
    }

    @GetMapping("/admin-area")
    public ResponseEntity<?> adminArea(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        UserToken user = readToken(authHeader);
        if (user == null) return ResponseEntity.status(401).body(Map.of("error", "missing or invalid token"));
        if (!allowed(user, "ADMIN")) return ResponseEntity.status(403).body(Map.of("error", "forbidden"));

        return ResponseEntity.ok(Map.of("message", "Admin area", "userType", user.userType()));
    }

    private UserToken readToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }

        String token = authHeader.substring(7);
        if (!jwtUtil.validateToken(token)) {
            return null;
        }

        return new UserToken(jwtUtil.extractUsername(token), jwtUtil.extractUserType(token));
    }

    private boolean allowed(UserToken user, String... userTypes) {
        for (String userType : userTypes) {
            if (userType.equals(user.userType())) {
                return true;
            }
        }
        return false;
    }

    private record UserToken(String username, String userType) {
    }
}
