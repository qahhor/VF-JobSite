package uz.verifix.jobs.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class VacancyCrudIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private ObjectMapper objectMapper;

    private String accessToken;

    @BeforeEach
    void setupEmployer() throws Exception {
        String unique = String.valueOf(System.nanoTime());
        String body = objectMapper.writeValueAsString(Map.of(
                "companyName", "Vacancy Test Co",
                "inn", "VT" + unique,
                "email", "vt" + unique + "@test.uz",
                "password", "TestPass123!",
                "phone", "+998901112233"
        ));

        MvcResult result = mockMvc.perform(post("/api/v1/auth/employer/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn();

        Map<String, Object> tokens = objectMapper.readValue(result.getResponse().getContentAsString(), Map.class);
        accessToken = (String) tokens.get("accessToken");
    }

    @Test
    void shouldCreateListUpdateAndPublishEmployerVacancy() throws Exception {
        String createBody = objectMapper.writeValueAsString(Map.of(
                "title", "Oshpaz kerak",
                "description", "Tajribali oshpaz kerak",
                "category", "COOK",
                "city", "Tashkent",
                "employmentType", "FULL_TIME",
                "positionsCount", 3,
                "expiresAt", "2026-08-01",
                "country", "UZ",
                "latitude", 41.311081,
                "longitude", 69.240562
        ));

        MvcResult createResult = mockMvc.perform(post("/api/v1/vacancies")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.title").value("Oshpaz kerak"))
                .andExpect(jsonPath("$.status").value("DRAFT"))
                .andExpect(jsonPath("$.latitude").exists())
                .andExpect(jsonPath("$.longitude").exists())
                .andExpect(jsonPath("$.expiresAt").exists())
                .andReturn();

        String vacancyId = objectMapper.readTree(createResult.getResponse().getContentAsString()).get("id").asText();

        mockMvc.perform(get("/api/v1/vacancies/employer")
                        .param("status", "DRAFT")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].title").value("Oshpaz kerak"));

        MvcResult updateResult = mockMvc.perform(put("/api/v1/vacancies/" + vacancyId)
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "title", "Oshpaz senior",
                                "description", "Yangilangan tavsif",
                                "category", "COOK",
                                "city", "Tashkent",
                                "employmentType", "FULL_TIME",
                                "positionsCount", 4,
                                "expiresAt", "2026-08-15",
                                "country", "UZ",
                                "latitude", 41.299500,
                                "longitude", 69.240100
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Oshpaz senior"))
                .andExpect(jsonPath("$.expiresAt").exists())
                .andReturn();

        assertThat(updateResult.getResponse().getContentAsString()).contains("2026-08-15");

        mockMvc.perform(post("/api/v1/vacancies/" + vacancyId + "/publish")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PENDING_MODERATION"))
                .andExpect(jsonPath("$.moderationStatus").value("PENDING"));
    }

    @Test
    void shouldSearchPublicVacancies() throws Exception {
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
