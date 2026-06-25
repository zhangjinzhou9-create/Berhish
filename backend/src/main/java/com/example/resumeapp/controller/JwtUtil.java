package com.example.resumeapp.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;

@Component
public class JwtUtil {

    private static final String SECRET = "campus_flow_super_secret_key_for_jwt_2026";
    private static final long EXPIRE_SECONDS = 60 * 60;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String generateToken(String username, String userType) {
        try {
            long now = Instant.now().getEpochSecond();

            Map<String, Object> header = new LinkedHashMap<>();
            header.put("alg", "HS256");
            header.put("typ", "JWT");

            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("sub", username);
            payload.put("userType", userType);
            payload.put("iat", now);
            payload.put("exp", now + EXPIRE_SECONDS);

            String headerPart = base64Url(objectMapper.writeValueAsBytes(header));
            String payloadPart = base64Url(objectMapper.writeValueAsBytes(payload));
            String signingInput = headerPart + "." + payloadPart;
            return signingInput + "." + sign(signingInput);
        } catch (Exception e) {
            throw new IllegalStateException("Could not generate JWT token", e);
        }
    }

    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public String extractUsername(String token) {
        Object username = parseClaims(token).get("sub");
        return username == null ? "" : username.toString();
    }

    public String extractUserType(String token) {
        Object userType = parseClaims(token).get("userType");
        return userType == null ? "" : userType.toString();
    }

    public Map<String, Object> parseClaims(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                throw new IllegalArgumentException("JWT token must have three parts");
            }

            String signingInput = parts[0] + "." + parts[1];
            String expectedSignature = sign(signingInput);
            if (!constantTimeEquals(expectedSignature, parts[2])) {
                throw new IllegalArgumentException("JWT signature is invalid");
            }

            byte[] payloadBytes = Base64.getUrlDecoder().decode(parts[1]);
            Map<String, Object> claims = objectMapper.readValue(payloadBytes, new TypeReference<>() {});
            long exp = ((Number) claims.getOrDefault("exp", 0)).longValue();
            if (Instant.now().getEpochSecond() > exp) {
                throw new IllegalArgumentException("JWT token is expired");
            }
            return claims;
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid JWT token", e);
        }
    }

    private String sign(String value) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(SECRET.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        return base64Url(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
    }

    private String base64Url(byte[] bytes) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private boolean constantTimeEquals(String a, String b) {
        if (a.length() != b.length()) {
            return false;
        }
        int result = 0;
        for (int i = 0; i < a.length(); i++) {
            result |= a.charAt(i) ^ b.charAt(i);
        }
        return result == 0;
    }
}
