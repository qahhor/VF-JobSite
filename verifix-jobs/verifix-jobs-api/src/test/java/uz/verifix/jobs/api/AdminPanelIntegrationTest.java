package uz.verifix.jobs.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MvcResult;
import uz.verifix.jobs.domain.entity.AdminUser;
import uz.verifix.jobs.domain.enums.AdminRole;
import uz.verifix.jobs.domain.repository.AdminUserRepository;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AdminPanelIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AdminUserRepository adminUserRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void shouldManageAdminAccessAndSecurityFlows() throws Exception {
        adminUserRepository.save(AdminUser.builder()
                .email("admin@test.uz")
                .passwordHash(passwordEncoder.encode("AdminPass123"))
                .role(AdminRole.SUPER_ADMIN)
                .build());

        MvcResult loginResult = mockMvc.perform(post("/api/v1/admin/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", "admin@test.uz",
                                "password", "AdminPass123"
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(jsonPath("$.role").value("SUPER_ADMIN"))
                .andExpect(jsonPath("$.mustChangePassword").value(false))
                .andReturn();

        String accessToken = com.jayway.jsonpath.JsonPath.read(loginResult.getResponse().getContentAsString(), "$.accessToken");

        mockMvc.perform(get("/api/v1/admin/auth/me")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("admin@test.uz"))
                .andExpect(jsonPath("$.role").value("SUPER_ADMIN"))
                .andExpect(jsonPath("$.mustChangePassword").value(false));

        mockMvc.perform(post("/api/v1/admin/auth/change-password")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "currentPassword", "AdminPass123",
                                "newPassword", "NewAdminPass456"
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("admin@test.uz"));

        MvcResult reloginResult = mockMvc.perform(post("/api/v1/admin/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", "admin@test.uz",
                                "password", "NewAdminPass456"
                        ))))
                .andExpect(status().isOk())
                .andReturn();

        String refreshedToken = com.jayway.jsonpath.JsonPath.read(reloginResult.getResponse().getContentAsString(), "$.accessToken");

        MvcResult createModerator = mockMvc.perform(post("/api/v1/admin/users/admins/invite")
                        .header("Authorization", "Bearer " + refreshedToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", "moderator@test.uz",
                                "role", "MODERATOR"
                        ))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("moderator@test.uz"))
                .andExpect(jsonPath("$.role").value("MODERATOR"))
                .andExpect(jsonPath("$.mustChangePassword").value(true))
                .andExpect(jsonPath("$.emailSent").value(false))
                .andReturn();

        String moderatorId = com.jayway.jsonpath.JsonPath.read(createModerator.getResponse().getContentAsString(), "$.id");
        String moderatorPassword = com.jayway.jsonpath.JsonPath.read(createModerator.getResponse().getContentAsString(), "$.temporaryPassword");

        MvcResult moderatorLogin = mockMvc.perform(post("/api/v1/admin/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", "moderator@test.uz",
                                "password", moderatorPassword
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mustChangePassword").value(true))
                .andReturn();

        String moderatorToken = com.jayway.jsonpath.JsonPath.read(moderatorLogin.getResponse().getContentAsString(), "$.accessToken");

        mockMvc.perform(get("/api/v1/admin/auth/me")
                        .header("Authorization", "Bearer " + moderatorToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("moderator@test.uz"))
                .andExpect(jsonPath("$.mustChangePassword").value(true));

        mockMvc.perform(get("/api/v1/admin/users")
                        .header("Authorization", "Bearer " + moderatorToken)
                        .param("type", "ADMIN"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("PASSWORD_CHANGE_REQUIRED"));

        mockMvc.perform(post("/api/v1/admin/auth/change-password")
                        .header("Authorization", "Bearer " + moderatorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "currentPassword", moderatorPassword,
                                "newPassword", "ModeratorNew123"
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mustChangePassword").value(false));

        MvcResult moderatorRelogin = mockMvc.perform(post("/api/v1/admin/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", "moderator@test.uz",
                                "password", "ModeratorNew123"
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mustChangePassword").value(false))
                .andReturn();

        String moderatorUnlockedToken = com.jayway.jsonpath.JsonPath.read(moderatorRelogin.getResponse().getContentAsString(), "$.accessToken");

        mockMvc.perform(get("/api/v1/admin/users")
                        .header("Authorization", "Bearer " + moderatorUnlockedToken)
                        .param("type", "ADMIN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].email").exists());

        mockMvc.perform(patch("/api/v1/admin/users/admins/" + moderatorId + "/role")
                        .header("Authorization", "Bearer " + refreshedToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("role", "SUPPORT"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("SUPPORT"));

        mockMvc.perform(post("/api/v1/admin/users/admins/" + moderatorId + "/reset-password")
                        .header("Authorization", "Bearer " + refreshedToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("password", "Support123A"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("moderator@test.uz"))
                .andExpect(jsonPath("$.mustChangePassword").value(true));

        mockMvc.perform(get("/api/v1/admin/users")
                        .header("Authorization", "Bearer " + refreshedToken)
                        .param("type", "ADMIN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].email").exists());
    }
}
