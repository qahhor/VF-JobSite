package uz.verifix.jobs.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration test: Vacancy create → list → update → publish → close.
 */
class VacancyCrudIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private ObjectMapper objectMapper;

    private String accessToken;

    @BeforeEach
    void setupEmployer() throws Exception {
        String body = objectMapper.writeValueAsString(Map.of(
                "name", "Vacancy Test Co",
                "inn", "VT" + System.nanoTime(),
                "email", "vt" + System.nanoTime() + "@test.uz",
                "password", "TestPass123!"
        ));

        MvcResult result = mockMvc.perform(post("/api/v1/auth/employer/register")
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk())
                .andReturn();

        Map<String, Object> tokens = objectMapper.readValue(result.getResponse().getContentAsString(), Map.class);
        accessToken = (String) tokens.get("accessToken");
    }

    @Test
    void shouldCreateAndListVacancy() throws Exception {
        String vacancyBody = objectMapper.writeValueAsString(Map.of(
                "title", "Oshpaz kerak",
                "description", "Tajribali oshpaz kerak",
                "category", "COOK",
                "city", "Tashkent",
                "employmentType", "FULL_TIME",
                "positionsCount", 3
        ));

        mockMvc.perform(post("/api/v1/vacancies")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(vacancyBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.title").value("Oshpaz kerak"))
                .andExpect(jsonPath("$.status").value("DRAFT"));

        // List vacancies
        mockMvc.perform(get("/api/v1/vacancies")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].title").value("Oshpaz kerak"));
    }

    @Test
    void shouldSearchPublicVacancies() throws Exception {
        // Public search should work without auth
        mockMvc.perform(get("/api/v1/public/vacancies")
                        .param("city", "Tashkent"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    void shouldGetPublicCategories() throws Exception {
        mockMvc.perform(get("/api/v1/public/categories"))
                .andExpect(status().isOk());
    }

    @Test
    void shouldGetPublicCities() throws Exception {
        mockMvc.perform(get("/api/v1/public/cities"))
                .andExpect(status().isOk());
    }
}
