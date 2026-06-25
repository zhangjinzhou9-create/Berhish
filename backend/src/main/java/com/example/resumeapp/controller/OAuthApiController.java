package com.example.resumeapp.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/oauth")
public class OAuthApiController {

    private final OAuth2AuthorizedClientService authorizedClientService;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${app.base-url:http://localhost:8080}")
    private String appBaseUrl;

    public OAuthApiController(OAuth2AuthorizedClientService authorizedClientService) {
        this.authorizedClientService = authorizedClientService;
    }

    @GetMapping("/status")
    public Map<String, Object> status(@AuthenticationPrincipal OAuth2User principal,
                                      OAuth2AuthenticationToken authentication) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("authenticated", principal != null);
        result.put("currentProvider", authentication == null ? null : authentication.getAuthorizedClientRegistrationId());
        result.put("googleLoginUrl", "/oauth2/authorization/google");
        result.put("githubLoginUrl", "/oauth2/authorization/github");
        result.put("logoutUrl", "/logout");
        if (principal != null) {
            result.put("name", principal.getAttribute("name"));
            result.put("login", principal.getAttribute("login"));
            result.put("email", principal.getAttribute("email"));
            Object avatarUrl = principal.getAttribute("avatar_url");
            Object picture = principal.getAttribute("picture");
            result.put("avatarUrl", avatarUrl == null ? picture : avatarUrl);
        }
        return result;
    }

    @GetMapping("/github/profile")
    public ResponseEntity<?> githubProfile(@AuthenticationPrincipal OAuth2User principal,
                                           OAuth2AuthenticationToken authentication) {
        OAuth2AuthorizedClient client = clientFor("github", authentication);
        if (principal == null || client == null) {
            return providerLoginRequired("github");
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("source", "github");
        result.put("login", principal.getAttribute("login"));
        result.put("name", principal.getAttribute("name"));
        result.put("id", principal.getAttribute("id"));
        result.put("avatarUrl", principal.getAttribute("avatar_url"));
        result.put("profileUrl", principal.getAttribute("html_url"));
        result.put("publicRepos", principal.getAttribute("public_repos"));
        return ResponseEntity.ok(result);
    }

    @GetMapping("/github/repos")
    public ResponseEntity<?> githubRepos(OAuth2AuthenticationToken authentication) {
        OAuth2AuthorizedClient client = clientFor("github", authentication);
        if (client == null) {
            return providerLoginRequired("github");
        }

        String url = UriComponentsBuilder
                .fromUriString("https://api.github.com/user/repos")
                .queryParam("sort", "updated")
                .queryParam("per_page", "8")
                .build()
                .toUriString();

        try {
            ResponseEntity<Object> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    bearerRequest(client),
                    Object.class
            );
            Map<String, Object> result = new LinkedHashMap<>();
            result.put("source", "github");
            result.put("repos", response.getBody());
            return ResponseEntity.ok(result);
        } catch (RestClientException e) {
            return ResponseEntity.status(502).body(Map.of(
                    "source", "github",
                    "error", "GitHub API request failed"
            ));
        }
    }

    @GetMapping("/google/calendar")
    public ResponseEntity<?> googleCalendar(OAuth2AuthenticationToken authentication) {
        OAuth2AuthorizedClient client = clientFor("google", authentication);
        if (client == null) {
            return providerLoginRequired("google");
        }

        String url = UriComponentsBuilder
                .fromUriString("https://www.googleapis.com/calendar/v3/calendars/primary/events")
                .queryParam("maxResults", "10")
                .queryParam("singleEvents", "true")
                .queryParam("orderBy", "startTime")
                .queryParam("timeMin", Instant.now().toString())
                .build()
                .toUriString();

        try {
            ResponseEntity<Object> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    bearerRequest(client),
                    Object.class
            );
            Map<String, Object> result = new LinkedHashMap<>();
            result.put("source", "google-calendar");
            result.put("events", response.getBody());
            return ResponseEntity.ok(result);
        } catch (RestClientException e) {
            return ResponseEntity.status(502).body(Map.of(
                    "source", "google-calendar",
                    "error", "Google Calendar API request failed"
            ));
        }
    }

    private OAuth2AuthorizedClient clientFor(String registrationId, OAuth2AuthenticationToken authentication) {
        if (authentication == null || !registrationId.equals(authentication.getAuthorizedClientRegistrationId())) {
            return null;
        }
        return authorizedClientService.loadAuthorizedClient(registrationId, authentication.getName());
    }

    private HttpEntity<Void> bearerRequest(OAuth2AuthorizedClient client) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(client.getAccessToken().getTokenValue());
        headers.set("Accept", "application/json");
        return new HttpEntity<>(headers);
    }

    private ResponseEntity<Map<String, Object>> providerLoginRequired(String provider) {
        return ResponseEntity.status(401).body(Map.of(
                "error", "Please login with " + provider + " first",
                "loginUrl", "/oauth2/authorization/" + provider,
                "appBaseUrl", appBaseUrl
        ));
    }
}
