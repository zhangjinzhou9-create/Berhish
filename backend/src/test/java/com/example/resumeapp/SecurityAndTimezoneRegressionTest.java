package com.example.resumeapp;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.example.resumeapp.service.AccountService;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.HashSet;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.startsWith;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:campusflow-test;MODE=MySQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.sql.init.mode=always",
        "spring.sql.init.schema-locations=classpath:schema-h2.sql",
        "spring.sql.init.data-locations=classpath:data-h2.sql",
        "app.jwt-secret=regression-test-secret-with-more-than-thirty-two-bytes",
        "app.base-url=https://campusflow.example",
        "app.demo-users-enabled=false"
})
@AutoConfigureMockMvc
class SecurityAndTimezoneRegressionTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private RestTemplate restTemplate;

    @BeforeEach
    void cleanUsers() {
        jdbcTemplate.update("DELETE FROM portfolio_items");
        jdbcTemplate.update("DELETE FROM user_profiles");
        jdbcTemplate.update("DELETE FROM auth_users");
    }

    @Test
    void anonymousRegistrationCannotCreateAdmin() throws Exception {
        mockMvc.perform(post("/api/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"username":"attack_admin","password":"StrongPassword123!","userType":"ADMIN"}
                                """))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error", containsString("USER")));

        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM auth_users WHERE username = 'attack_admin'", Integer.class
        );
        org.assertj.core.api.Assertions.assertThat(count).isZero();
    }

    @Test
    void studentPasswordIsHashedAndLegitimateLoginStillWorks() throws Exception {
        registerUser("secure_student", "StrongPassword123!");

        String stored = jdbcTemplate.queryForObject(
                "SELECT password FROM auth_users WHERE username = 'secure_student'", String.class
        );
        org.assertj.core.api.Assertions.assertThat(stored)
                .isNotEqualTo("StrongPassword123!")
                .startsWith("$2");

        mockMvc.perform(post("/api/authenticate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"username":"secure_student","password":"StrongPassword123!"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.role").value("USER"))
                .andExpect(result -> org.assertj.core.api.Assertions.assertThat(
                        result.getResponse().getCookie(AccountService.SESSION_COOKIE)
                ).isNotNull());
    }

    @Test
    void oldSourceCodeSecretCannotForgeAdminSession() throws Exception {
        String forged = tokenSignedWith(
                "campus_flow_super_secret_key_for_jwt_2026",
                "forged",
                "ADMIN"
        );

        mockMvc.perform(get("/api/admin/users").header("Authorization", "Bearer " + forged))
                .andExpect(status().isForbidden());
    }

    @Test
    void profileWritesRequireAuthenticationButSignedInUserCanSave() throws Exception {
        String body = "{\"country\":\"Japan\",\"city\":\"Kyoto\",\"location\":\"Kyoto, Japan\"}";

        mockMvc.perform(post("/api/profile")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isUnauthorized());

        Cookie session = registerUser("profile_writer", "StrongPassword123!");

        mockMvc.perform(post("/api/profile")
                        .with(csrf())
                        .cookie(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.saved").value(true));
    }

    @Test
    void guestPortfolioAlwaysIncludesPresetWork() throws Exception {
        String response = mockMvc.perform(get("/api/portfolio"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.editable").value(false))
                .andExpect(jsonPath("$.preset").value(true))
                .andExpect(jsonPath("$.items.length()").value(4))
                .andExpect(jsonPath("$.items[0].presetKey").value("guestWork01"))
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode items = objectMapper.readTree(response).path("items");
        HashSet<String> imageUrls = new HashSet<>();
        items.forEach(item -> imageUrls.add(item.path("imageUrl").asText()));
        org.assertj.core.api.Assertions.assertThat(imageUrls).hasSize(4);
    }

    @Test
    void releaseUiKeepsThreeLanguagesAndRemovesLegacyLabels() throws Exception {
        mockMvc.perform(get("/index.html"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("<option value=\"en\">EN</option>")))
                .andExpect(content().string(containsString("<option value=\"ja\">日本語</option>")))
                .andExpect(content().string(containsString("<option value=\"zh\">中文</option>")))
                .andExpect(content().string(containsString("id=\"authPassword\" type=\"password\"")))
                .andExpect(content().string(not(containsString("CLASSROOM EDITION"))))
                .andExpect(content().string(not(containsString("CLASS07"))))
                .andExpect(content().string(not(containsString("OAUTH API EVIDENCE"))))
                .andExpect(content().string(not(containsString("LOCAL JWT TEST"))));
    }

    @Test
    void oauthRedirectsUseTheConfiguredPublicBaseUrl() throws Exception {
        mockMvc.perform(get("/oauth2/authorization/google"))
                .andExpect(status().is3xxRedirection())
                .andExpect(header().string(
                        "Location",
                        containsString("redirect_uri=https://campusflow.example/login/oauth2/code/google")
                ));

        mockMvc.perform(get("/oauth2/authorization/github"))
                .andExpect(status().is3xxRedirection())
                .andExpect(header().string(
                        "Location",
                        containsString("redirect_uri=https://campusflow.example/login/oauth2/code/github")
                ));
    }

    @Test
    void publicProfileHidesPrivateFieldsButAuthenticatedOwnerCanReadThem() throws Exception {
        mockMvc.perform(get("/api/profile"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.studentId").doesNotExist())
                .andExpect(jsonPath("$.phone").doesNotExist())
                .andExpect(jsonPath("$.name").value("シュフシン"));

        Cookie session = registerUser("profile_reader", "StrongPassword123!");

        mockMvc.perform(get("/api/profile").cookie(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.phone").exists())
                .andExpect(jsonPath("$.editable").value(true))
                .andExpect(jsonPath("$.name").value("profile_reader"));
    }

    @Test
    void weatherRequestUsesCityTimezoneAndReturnsLabeledLocalTime() throws Exception {
        MockRestServiceServer server = MockRestServiceServer.createServer(restTemplate);
        server.expect(requestTo(startsWith("https://geocoding-api.open-meteo.com/v1/search")))
                .andRespond(withSuccess("""
                        {"results":[{"name":"Kyoto","country":"Japan","latitude":35.0116,"longitude":135.7681,"timezone":"Asia/Tokyo"}]}
                        """, MediaType.APPLICATION_JSON));
        server.expect(requestTo(containsString("timezone=Asia/Tokyo")))
                .andRespond(withSuccess("""
                        {"timezone":"Asia/Tokyo","current_weather":{"temperature":27.6,"windspeed":1.8,"weathercode":2,"time":"2026-07-22T07:45"}}
                        """, MediaType.APPLICATION_JSON));

        mockMvc.perform(get("/api/home").param("country", "Japan").param("city", "Kyoto"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.weather.time").value("2026-07-22T07:45"))
                .andExpect(jsonPath("$.weather.timezone").value("Asia/Tokyo"));
        server.verify();
    }

    private Cookie registerUser(String username, String password) throws Exception {
        return mockMvc.perform(post("/api/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"" + username + "\",\"password\":\"" + password + "\"}"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getCookie(AccountService.SESSION_COOKIE);
    }

    private String tokenSignedWith(String secret, String username, String userType) throws Exception {
        long now = Instant.now().getEpochSecond();
        String header = base64Url("{\"alg\":\"HS256\",\"typ\":\"JWT\"}");
        String payload = base64Url("{\"sub\":\"" + username + "\",\"userType\":\"" + userType
                + "\",\"iat\":" + now + ",\"exp\":" + (now + 3600) + "}");
        String input = header + "." + payload;
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        return input + "." + Base64.getUrlEncoder().withoutPadding()
                .encodeToString(mac.doFinal(input.getBytes(StandardCharsets.UTF_8)));
    }

    private String base64Url(String value) {
        return Base64.getUrlEncoder().withoutPadding()
                .encodeToString(value.getBytes(StandardCharsets.UTF_8));
    }
}
