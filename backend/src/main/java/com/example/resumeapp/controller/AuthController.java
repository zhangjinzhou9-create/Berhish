package com.example.resumeapp.controller;

import com.example.resumeapp.service.AccountService;
import com.example.resumeapp.service.AccountService.AccountAuthenticationException;
import com.example.resumeapp.service.AccountService.AccountAuthorizationException;
import com.example.resumeapp.service.AccountService.AccountConflictException;
import com.example.resumeapp.service.AccountService.UserAccount;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class AuthController {

    private final AccountService accountService;

    @Value("${app.secure-cookie:false}")
    private boolean secureCookie;

    public AuthController(AccountService accountService) {
        this.accountService = accountService;
    }

    @PostMapping("/authenticate")
    public ResponseEntity<?> authenticate(
            @RequestBody Map<String, String> body,
            HttpServletResponse response
    ) {
        try {
            UserAccount account = accountService.authenticate(body.get("username"), body.get("password"));
            writeSessionCookie(response, accountService.issueToken(account), Duration.ofHours(1));
            return ResponseEntity.ok(Map.of(
                    "authenticated", true,
                    "user", account.toPublicMap()
            ));
        } catch (AccountAuthenticationException e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody Map<String, String> body,
            HttpServletResponse response
    ) {
        String requestedRole = body.getOrDefault("userType", "USER");
        if (!"USER".equals(requestedRole)) {
            return ResponseEntity.status(403).body(Map.of(
                    "error", "Public registration can only create USER accounts"
            ));
        }
        try {
            UserAccount account = accountService.register(body.get("username"), body.get("password"));
            writeSessionCookie(response, accountService.issueToken(account), Duration.ofHours(1));
            return ResponseEntity.ok(Map.of(
                    "registered", true,
                    "authenticated", true,
                    "user", account.toPublicMap()
            ));
        } catch (AccountConflictException e) {
            return ResponseEntity.status(409).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/auth/me")
    public Map<String, Object> currentUser(
            HttpServletRequest request,
            Authentication authentication
    ) {
        return accountService.resolve(request, authentication)
                .<Map<String, Object>>map(account -> Map.of(
                        "authenticated", true,
                        "user", account.toPublicMap()
                ))
                .orElseGet(() -> Map.of(
                        "authenticated", false,
                        "role", "GUEST"
                ));
    }

    @PostMapping("/auth/logout")
    public Map<String, Object> logout(HttpServletResponse response) {
        writeSessionCookie(response, "", Duration.ZERO);
        return Map.of("loggedOut", true);
    }

    @GetMapping("/csrf")
    public Map<String, String> csrf(CsrfToken token) {
        return Map.of(
                "headerName", token.getHeaderName(),
                "parameterName", token.getParameterName(),
                "token", token.getToken()
        );
    }

    @GetMapping("/admin/users")
    public ResponseEntity<?> users(HttpServletRequest request, Authentication authentication) {
        try {
            UserAccount requester = accountService.resolve(request, authentication)
                    .orElseThrow(() -> new AccountAuthorizationException("administrator account required"));
            return ResponseEntity.ok(Map.of("users", accountService.listUsers(requester)));
        } catch (AccountAuthorizationException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/admin/users/{userId}")
    public ResponseEntity<?> updateUser(
            @PathVariable long userId,
            @RequestBody Map<String, Object> body,
            HttpServletRequest request,
            Authentication authentication
    ) {
        try {
            UserAccount requester = accountService.resolve(request, authentication)
                    .orElseThrow(() -> new AccountAuthorizationException("administrator account required"));
            boolean enabled = Boolean.parseBoolean(String.valueOf(body.getOrDefault("enabled", true)));
            return ResponseEntity.ok(accountService.setUserEnabled(requester, userId, enabled));
        } catch (AccountAuthorizationException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/admin/users/{userId}")
    public ResponseEntity<?> deleteUser(
            @PathVariable long userId,
            HttpServletRequest request,
            Authentication authentication
    ) {
        try {
            UserAccount requester = accountService.resolve(request, authentication)
                    .orElseThrow(() -> new AccountAuthorizationException("administrator account required"));
            return ResponseEntity.ok(accountService.deleteUser(requester, userId));
        } catch (AccountAuthorizationException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    private void writeSessionCookie(HttpServletResponse response, String token, Duration maxAge) {
        ResponseCookie cookie = ResponseCookie.from(AccountService.SESSION_COOKIE, token)
                .httpOnly(true)
                .secure(secureCookie)
                .sameSite("Lax")
                .path("/")
                .maxAge(maxAge)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
