package com.example.resumeapp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.client.endpoint.OAuth2AccessTokenResponseClient;
import org.springframework.security.oauth2.client.endpoint.OAuth2AuthorizationCodeGrantRequest;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.OAuth2AuthorizationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.endpoint.OAuth2AccessTokenResponse;
import org.springframework.security.oauth2.core.endpoint.OAuth2ParameterNames;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/",
                                "/index.html",
                                "/style.css",
                                "/script.js",
                                "/api-docs.html",
                                "/openapi.yaml",
                                "/api/home",
                                "/api/profile",
                                "/api/authenticate",
                                "/api/register",
                                "/api/verify",
                                "/api/student-area",
                                "/api/teacher-area",
                                "/api/admin-area",
                                "/api/oauth/**",
                                "/oauth2/**",
                                "/login/**",
                                "/error"
                        ).permitAll()
                        .anyRequest().permitAll()
                )
                .oauth2Login(oauth -> oauth
                        .tokenEndpoint(token -> token.accessTokenResponseClient(accessTokenResponseClient()))
                        .successHandler((request, response, authentication) -> {
                            String provider = "oauth";
                            if (authentication instanceof OAuth2AuthenticationToken token) {
                                provider = token.getAuthorizedClientRegistrationId();
                            }
                            response.sendRedirect("/index.html?page=me&oauth=" + provider);
                        })
                        .failureHandler((request, response, exception) -> {
                            String message = URLEncoder.encode(exception.getMessage(), StandardCharsets.UTF_8);
                            response.sendRedirect("/index.html?page=me&oauthError=" + message);
                        }))
                .logout(logout -> logout
                        .logoutSuccessUrl("/index.html?page=me&logout=true")
                        .invalidateHttpSession(true)
                        .clearAuthentication(true)
                );

        return http.build();
    }

    private OAuth2AccessTokenResponseClient<OAuth2AuthorizationCodeGrantRequest> accessTokenResponseClient() {
        return request -> {
            RestTemplate restTemplate = new RestTemplate();

            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add(OAuth2ParameterNames.GRANT_TYPE, AuthorizationGrantType.AUTHORIZATION_CODE.getValue());
            body.add(OAuth2ParameterNames.CODE, request.getAuthorizationExchange().getAuthorizationResponse().getCode());
            body.add(OAuth2ParameterNames.REDIRECT_URI,
                    request.getAuthorizationExchange().getAuthorizationRequest().getRedirectUri());
            body.add(OAuth2ParameterNames.CLIENT_ID, request.getClientRegistration().getClientId());
            body.add(OAuth2ParameterNames.CLIENT_SECRET, request.getClientRegistration().getClientSecret());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            headers.setAccept(java.util.List.of(MediaType.APPLICATION_JSON));

            ResponseEntity<Map> response = restTemplate.postForEntity(
                    request.getClientRegistration().getProviderDetails().getTokenUri(),
                    new HttpEntity<>(body, headers),
                    Map.class
            );

            Map<String, Object> tokenBody = new HashMap<>(response.getBody());
            if (tokenBody.containsKey("error")) {
                String code = String.valueOf(tokenBody.get("error"));
                String description = String.valueOf(tokenBody.getOrDefault("error_description", code));
                throw new OAuth2AuthorizationException(new OAuth2Error(code, description, null));
            }

            Object token = tokenBody.get("access_token");
            if (token == null) {
                throw new OAuth2AuthorizationException(new OAuth2Error(
                        "invalid_token_response",
                        "Token response did not include access_token.",
                        null
                ));
            }

            Set<String> scopes = parseScopes(tokenBody.get("scope"), request);
            OAuth2AccessTokenResponse.Builder builder = OAuth2AccessTokenResponse
                    .withToken(String.valueOf(token))
                    .tokenType(OAuth2AccessToken.TokenType.BEARER)
                    .scopes(scopes)
                    .additionalParameters(tokenBody);

            Object expiresIn = tokenBody.get("expires_in");
            if (expiresIn instanceof Number number) {
                builder.expiresIn(number.longValue());
            }
            Object refreshToken = tokenBody.get("refresh_token");
            if (refreshToken != null) {
                builder.refreshToken(String.valueOf(refreshToken));
            }

            return builder.build();
        };
    }

    private Set<String> parseScopes(Object scopeValue, OAuth2AuthorizationCodeGrantRequest request) {
        Set<String> scopes = new LinkedHashSet<>(request.getClientRegistration().getScopes());
        if (scopeValue instanceof String scopeText && !scopeText.isBlank()) {
            scopes.clear();
            for (String scope : scopeText.split("[,\\s]+")) {
                if (!scope.isBlank()) {
                    scopes.add(scope);
                }
            }
        }
        return scopes;
    }
}
