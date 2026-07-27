package com.example.resumeapp.config;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.web.client.RestTemplate;

import jakarta.servlet.http.HttpServletRequest;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.Map;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            ClientRegistrationRepository clientRegistrations
    ) throws Exception {
        CookieCsrfTokenRepository csrfRepository = CookieCsrfTokenRepository.withHttpOnlyFalse();
        csrfRepository.setCookiePath("/");
        OAuth2AuthorizationRequestResolver authorizationRequestResolver =
                accountSelectingAuthorizationRequestResolver(clientRegistrations);

        http
                .csrf(csrf -> csrf
                        .csrfTokenRepository(csrfRepository)
                        .ignoringRequestMatchers("/api/authenticate", "/api/register"))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/",
                                "/index.html",
                                "/style.css",
                                "/script.js",
                                "/ui-effects.js",
                                "/vendor/**",
                                "/assets/**",
                                "/favicon.ico",
                                "/api-docs.html",
                                "/openapi.yaml",
                                "/api/home",
                                "/api/profile",
                                "/api/portfolio",
                                "/api/authenticate",
                                "/api/register",
                                "/api/auth/me",
                                "/api/csrf",
                                "/api/oauth/status",
                                "/oauth2/**",
                                "/login/**",
                                "/error"
                        ).permitAll()
                        .anyRequest().permitAll()
                )
                .oauth2Login(oauth -> oauth
                        .authorizationEndpoint(endpoint ->
                                endpoint.authorizationRequestResolver(authorizationRequestResolver))
                        .successHandler((request, response, authentication) ->
                                response.sendRedirect("/index.html?page=account&authSuccess=true#account"))
                        .failureHandler((request, response, exception) ->
                                response.sendRedirect("/index.html?authError=provider#account")))
                .logout(logout -> logout
                        .logoutSuccessUrl("/index.html#account")
                        .invalidateHttpSession(true)
                        .clearAuthentication(true)
                        .deleteCookies("JSESSIONID")
                );

        return http.build();
    }

    private OAuth2AuthorizationRequestResolver accountSelectingAuthorizationRequestResolver(
            ClientRegistrationRepository clientRegistrations
    ) {
        DefaultOAuth2AuthorizationRequestResolver delegate =
                new DefaultOAuth2AuthorizationRequestResolver(
                        clientRegistrations,
                        "/oauth2/authorization"
                );
        return new OAuth2AuthorizationRequestResolver() {
            @Override
            public OAuth2AuthorizationRequest resolve(HttpServletRequest request) {
                return addAccountPicker(delegate.resolve(request));
            }

            @Override
            public OAuth2AuthorizationRequest resolve(
                    HttpServletRequest request,
                    String clientRegistrationId
            ) {
                return addAccountPicker(delegate.resolve(request, clientRegistrationId));
            }
        };
    }

    private OAuth2AuthorizationRequest addAccountPicker(OAuth2AuthorizationRequest request) {
        if (request == null) {
            return null;
        }
        Map<String, Object> parameters = new LinkedHashMap<>(request.getAdditionalParameters());
        parameters.put("prompt", "select_account");
        return OAuth2AuthorizationRequest.from(request)
                .additionalParameters(parameters)
                .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder
                .setConnectTimeout(Duration.ofSeconds(5))
                .setReadTimeout(Duration.ofSeconds(10))
                .build();
    }
}
