package uz.verifix.jobs.api;

import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class EmployerPortalIntegrationTest extends AbstractIntegrationTest {

    private static String accessToken;
    private static String vacancyId;

    @Test
    @Order(1)
    void registerEmployer() throws Exception {
        String body = """
            {"companyName":"Test Corp","inn":"999888777","email":"portal@test.uz","password":"Portal1234","phone":"+998991234567"}
            """;

        MvcResult result = mockMvc.perform(post("/api/v1/auth/employer/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(jsonPath("$.employerId").exists())
                .andReturn();

        accessToken = com.jayway.jsonpath.JsonPath.read(result.getResponse().getContentAsString(), "$.accessToken");
    }

    @Test
    @Order(2)
    void loginEmployer() throws Exception {
        mockMvc.perform(post("/api/v1/auth/employer/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {"email":"portal@test.uz","password":"Portal1234"}
                            """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(jsonPath("$.role").value("EMPLOYER_ADMIN"));
    }

    @Test
    @Order(3)
    void getProfile() throws Exception {
        mockMvc.perform(get("/api/v1/employer/profile")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test Corp"));
    }

    @Test
    @Order(4)
    void createVacancyWithGpsAndExpiry() throws Exception {
        String body = """
            {
              "title":"Test Oshpaz",
              "category":"COOK",
              "city":"Tashkent",
              "description":"Test vacancy with exact branch location",
              "employmentType":"FULL_TIME",
              "salaryFrom":3000000,
              "salaryTo":4500000,
              "positionsCount":5,
              "expiresAt":"2026-06-15",
              "country":"UZ",
              "latitude":41.311081,
              "longitude":69.240562
            }
            """;

        MvcResult result = mockMvc.perform(post("/api/v1/vacancies")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Test Oshpaz"))
                .andExpect(jsonPath("$.status").value("DRAFT"))
                .andExpect(jsonPath("$.country").value("UZ"))
                .andExpect(jsonPath("$.latitude").exists())
                .andExpect(jsonPath("$.longitude").exists())
                .andExpect(jsonPath("$.expiresAt").exists())
                .andReturn();

        String payload = result.getResponse().getContentAsString();
        assertThat(payload).contains("2026-06-15");
        vacancyId = com.jayway.jsonpath.JsonPath.read(payload, "$.id");
    }

    @Test
    @Order(5)
    void getEmployerVacanciesByDraftStatus() throws Exception {
        mockMvc.perform(get("/api/v1/vacancies/employer")
                        .param("status", "DRAFT")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].title").value("Test Oshpaz"))
                .andExpect(jsonPath("$.content[0].status").value("DRAFT"));
    }

    @Test
    @Order(6)
    void publishVacancyGoesToModerationForNewEmployer() throws Exception {
        mockMvc.perform(post("/api/v1/vacancies/" + vacancyId + "/publish")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PENDING_MODERATION"))
                .andExpect(jsonPath("$.moderationStatus").value("PENDING"));
    }

    @Test
    @Order(7)
    void updateVacancyKeepsEditableExpiryAndGps() throws Exception {
        MvcResult result = mockMvc.perform(put("/api/v1/vacancies/" + vacancyId)
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {
                              "title":"Updated Oshpaz",
                              "category":"COOK",
                              "city":"Tashkent",
                              "description":"Updated vacancy",
                              "employmentType":"FULL_TIME",
                              "salaryFrom":3500000,
                              "salaryTo":5000000,
                              "positionsCount":3,
                              "expiresAt":"2026-07-20",
                              "country":"UZ",
                              "latitude":41.299500,
                              "longitude":69.240100
                            }
                            """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated Oshpaz"))
                .andExpect(jsonPath("$.latitude").exists())
                .andExpect(jsonPath("$.longitude").exists())
                .andExpect(jsonPath("$.expiresAt").exists())
                .andReturn();

        assertThat(result.getResponse().getContentAsString()).contains("2026-07-20");
    }

    @Test
    @Order(8)
    void getEmployerVacanciesByModerationStatus() throws Exception {
        mockMvc.perform(get("/api/v1/vacancies/employer")
                        .param("status", "PENDING_MODERATION")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].title").value("Updated Oshpaz"))
                .andExpect(jsonPath("$.content[0].status").value("PENDING_MODERATION"));
    }

    @Test
    @Order(9)
    void getDashboard() throws Exception {
        mockMvc.perform(get("/api/v1/analytics/overview")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.activeVacancies").isNumber());
    }

    @Test
    @Order(10)
    void getFunnel() throws Exception {
        mockMvc.perform(get("/api/v1/analytics/funnel")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusCounts").exists());
    }

    @Test
    @Order(11)
    void getValueReport() throws Exception {
        mockMvc.perform(get("/api/v1/employer/value-report")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.maturityLevel").exists());
    }

    @Test
    @Order(12)
    void getIntegrationHub() throws Exception {
        mockMvc.perform(get("/api/v1/employer/integrations")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.integrations").isArray())
                .andExpect(jsonPath("$.maturityLevel").isNumber());
    }

    @Test
    @Order(13)
    void getVacancyHealth() throws Exception {
        mockMvc.perform(get("/api/v1/vacancy-health/all")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @Order(14)
    void sendChatMessage() throws Exception {
        mockMvc.perform(get("/api/v1/chat/conversations")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.conversations").isArray());
    }

    @Test
    @Order(15)
    void getAutomations() throws Exception {
        mockMvc.perform(get("/api/v1/employer/automations")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk());
    }

    @Test
    @Order(16)
    void deleteVacancy() throws Exception {
        mockMvc.perform(delete("/api/v1/vacancies/" + vacancyId)
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isNoContent());
    }

    @Test
    @Order(17)
    void deletedVacancyDisappearsFromEmployerListingAndLookup() throws Exception {
        mockMvc.perform(get("/api/v1/vacancies/employer")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(0))
                .andExpect(jsonPath("$.content").isEmpty());

        mockMvc.perform(get("/api/v1/vacancies/" + vacancyId)
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isNotFound());
    }

    @Test
    @Order(18)
    void unauthenticatedRequestReturns401() throws Exception {
        mockMvc.perform(get("/api/v1/employer/profile"))
                .andExpect(status().is4xxClientError());
    }
}
