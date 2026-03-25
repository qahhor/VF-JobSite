package uz.verifix.jobs.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration test: Employer registration → login → refresh → logout.
 */
class AuthFlowIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldCompleteFullEmployerAuthFlow() throws Exception {
        // 1. Register employer
        String registerBody = objectMapper.writeValueAsString(Map.of(
                "name", "Test Company",
                "inn", "123456789",
                "email", "admin@testcompany.uz",
                "password", "SecurePass123!"
        ));

        mockMvc.perform(post("/api/v1/auth/employer/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(jsonPath("$.refreshToken").exists());

        // 2. Login
        String loginBody = objectMapper.writeValueAsString(Map.of(
                "email", "admin@testcompany.uz",
                "password", "SecurePass123!"
        ));

        String loginResult = mockMvc.perform(post("/api/v1/auth/employer/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(jsonPath("$.refreshToken").exists())
                .andReturn().getResponse().getContentAsString();

        Map<String, Object> tokens = objectMapper.readValue(loginResult, Map.class);
        String refreshToken = (String) tokens.get("refreshToken");

        // 3. Refresh token
        mockMvc.perform(post("/api/v1/auth/employer/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("refreshToken", refreshToken))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists());
    }

    @Test
    void shouldRejectInvalidLogin() throws Exception {
        mockMvc.perform(post("/api/v1/auth/employer/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"noone@test.uz\",\"password\":\"wrong\"}"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    void shouldRejectDuplicateInn() throws Exception {
        String body = "{\"name\":\"Dup Co\",\"inn\":\"999888777\",\"email\":\"dup1@test.uz\",\"password\":\"Pass123!\"}";
        mockMvc.perform(post("/api/v1/auth/employer/register").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk());

        String body2 = "{\"name\":\"Dup Co 2\",\"inn\":\"999888777\",\"email\":\"dup2@test.uz\",\"password\":\"Pass123!\"}";
        mockMvc.perform(post("/api/v1/auth/employer/register").contentType(MediaType.APPLICATION_JSON).content(body2))
                .andExpect(status().is4xxClientError());
    }
}
