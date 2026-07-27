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
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.HashSet;
import java.util.Map;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.startsWith;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
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

    @Autowired
    private AccountService accountService;

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
    void configuredAdministratorPasswordFollowsTheCurrentEnvironmentValue() {
        ReflectionTestUtils.setField(accountService, "adminUsername", "configured_admin");
        ReflectionTestUtils.setField(accountService, "adminPassword", "FirstAdminPassword!");
        accountService.initializeSchema();

        org.assertj.core.api.Assertions.assertThat(
                accountService.authenticate("configured_admin", "FirstAdminPassword!").role()
        ).isEqualTo("ADMIN");

        ReflectionTestUtils.setField(accountService, "adminPassword", "SecondAdminPassword!");
        accountService.initializeSchema();

        org.assertj.core.api.Assertions.assertThatThrownBy(
                () -> accountService.authenticate("configured_admin", "FirstAdminPassword!")
        ).isInstanceOf(AccountService.AccountAuthenticationException.class);
        org.assertj.core.api.Assertions.assertThat(
                accountService.authenticate("configured_admin", "SecondAdminPassword!").role()
        ).isEqualTo("ADMIN");
    }

    @Test
    void newAccountsStartWithAnEmptyPortfolio() throws Exception {
        Cookie session = registerUser("empty_portfolio", "StrongPassword123!");

        mockMvc.perform(get("/api/portfolio").cookie(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.editable").value(true))
                .andExpect(jsonPath("$.items.length()").value(0));
    }

    @Test
    void portfolioCreationWithoutAFileDoesNotInsertAPresetImage() throws Exception {
        Cookie session = registerUser("no_placeholder", "StrongPassword123!");

        mockMvc.perform(post("/api/portfolio")
                        .with(csrf())
                        .cookie(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "type":"PHOTOGRAPHY",
                                  "title":"No file",
                                  "description":"Should be rejected",
                                  "imageUrl":""
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error", containsString("upload")));

        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM portfolio_items",
                Integer.class
        );
        org.assertj.core.api.Assertions.assertThat(count).isZero();
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
    void oversizedProfileInputReturnsBadRequestInsteadOfDatabaseFailure() throws Exception {
        Cookie session = registerUser("bounded_profile", "StrongPassword123!");
        String body = objectMapper.writeValueAsString(Map.of(
                "name", "x".repeat(121),
                "country", "Japan",
                "city", "Kyoto"
        ));

        mockMvc.perform(post("/api/profile")
                        .with(csrf())
                        .cookie(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error", containsString("120")));
    }

    @Test
    void profileTitleMustUseAPreset() throws Exception {
        Cookie session = registerUser("preset_title", "StrongPassword123!");

        mockMvc.perform(post("/api/profile")
                        .with(csrf())
                        .cookie(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name":"Preset User",
                                  "country":"Japan",
                                  "city":"Kyoto",
                                  "title":"Anything I want"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error", containsString("preset")));

        mockMvc.perform(post("/api/profile")
                        .with(csrf())
                        .cookie(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name":"Preset User",
                                  "country":"Japan",
                                  "city":"Kyoto",
                                  "title":"PHOTOGRAPHER"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.profile.title").value("PHOTOGRAPHER"));
    }

    @Test
    void administratorCanRemoveATestAccountButNotTheActiveAccount() throws Exception {
        Cookie adminSession = registerUser("cleanup_admin", "StrongPassword123!");
        jdbcTemplate.update(
                "UPDATE auth_users SET user_type = 'ADMIN' WHERE username = 'cleanup_admin'"
        );
        registerUser("temporary_test_user", "StrongPassword123!");
        Long testUserId = jdbcTemplate.queryForObject(
                "SELECT id FROM auth_users WHERE username = 'temporary_test_user'",
                Long.class
        );
        Long adminId = jdbcTemplate.queryForObject(
                "SELECT id FROM auth_users WHERE username = 'cleanup_admin'",
                Long.class
        );

        mockMvc.perform(delete("/api/admin/users/" + testUserId)
                        .with(csrf())
                        .cookie(adminSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.deleted").value(true));

        mockMvc.perform(delete("/api/admin/users/" + adminId)
                        .with(csrf())
                        .cookie(adminSession))
                .andExpect(status().isBadRequest());
    }

    @Test
    void uploadedMediaRemainsAvailableAfterMetadataUpdate() throws Exception {
        Cookie session = registerUser("media_owner", "StrongPassword123!");
        MockMultipartFile image = new MockMultipartFile(
                "file",
                "sample.png",
                "image/png",
                new byte[]{(byte) 0x89, 'P', 'N', 'G', 13, 10, 26, 10, 1}
        );

        String uploadResponse = mockMvc.perform(multipart("/api/portfolio/upload")
                        .file(image)
                        .param("mediaKind", "IMAGE")
                        .param("type", "PHOTOGRAPHY")
                        .param("title", "Uploaded image")
                        .param("description", "Original description")
                        .param("layoutSize", "WIDE")
                        .param("mediaFit", "CONTAIN")
                        .param("public", "true")
                        .with(csrf())
                        .cookie(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.created").value(true))
                .andReturn()
                .getResponse()
                .getContentAsString();

        long itemId = objectMapper.readTree(uploadResponse).path("id").asLong();
        mockMvc.perform(put("/api/portfolio/" + itemId)
                        .with(csrf())
                        .cookie(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "type":"PHOTOGRAPHY",
                                  "title":"Edited title",
                                  "description":"Edited description",
                                  "imageUrl":"",
                                  "externalUrl":"",
                                  "layoutSize":"TALL",
                                  "mediaFit":"CONTAIN",
                                  "public":true
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.updated").value(true));

        String mediaUrl = jdbcTemplate.queryForObject(
                "SELECT image_url FROM portfolio_items WHERE id = ?",
                String.class,
                itemId
        );
        org.assertj.core.api.Assertions.assertThat(mediaUrl)
                .isEqualTo("/api/portfolio/" + itemId + "/media");
        Map<String, Object> presentation = jdbcTemplate.queryForMap(
                "SELECT layout_size, media_fit FROM portfolio_items WHERE id = ?",
                itemId
        );
        org.assertj.core.api.Assertions.assertThat(presentation.get("layout_size")).isEqualTo("TALL");
        org.assertj.core.api.Assertions.assertThat(presentation.get("media_fit")).isEqualTo("CONTAIN");

        mockMvc.perform(get(mediaUrl).cookie(session))
                .andExpect(status().isOk())
                .andExpect(header().string("X-Content-Type-Options", "nosniff"))
                .andExpect(content().contentTypeCompatibleWith(MediaType.IMAGE_PNG));
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
                .andExpect(content().string(containsString("id=\"workFile\" type=\"file\"")))
                .andExpect(content().string(containsString("id=\"workLayoutSize\"")))
                .andExpect(content().string(containsString("value=\"PHOTOGRAPHER\"")))
                .andExpect(content().string(not(containsString("id=\"workImageUrl\""))))
                .andExpect(content().string(not(containsString("CLASSROOM EDITION"))))
                .andExpect(content().string(not(containsString("CLASS07"))))
                .andExpect(content().string(not(containsString("OAUTH API EVIDENCE"))))
                .andExpect(content().string(not(containsString("LOCAL JWT TEST"))));

        mockMvc.perform(get("/script.js"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString(
                        "safeFetch('/logout', { method: 'POST' })"
                )));
    }

    @Test
    void oauthRedirectsUseTheConfiguredPublicBaseUrl() throws Exception {
        mockMvc.perform(get("/oauth2/authorization/google"))
                .andExpect(status().is3xxRedirection())
                .andExpect(header().string(
                        "Location",
                        containsString("redirect_uri=https://campusflow.example/login/oauth2/code/google")
                ))
                .andExpect(header().string("Location", containsString("prompt=select_account")));

        mockMvc.perform(get("/oauth2/authorization/github"))
                .andExpect(status().is3xxRedirection())
                .andExpect(header().string(
                        "Location",
                        containsString("redirect_uri=https://campusflow.example/login/oauth2/code/github")
                ))
                .andExpect(header().string("Location", containsString("prompt=select_account")));
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
