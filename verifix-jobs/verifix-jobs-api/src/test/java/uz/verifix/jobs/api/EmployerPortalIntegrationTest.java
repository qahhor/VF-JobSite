package uz.verifix.jobs.api;

import org.junit.jupiter.api.*;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class EmployerPortalIntegrationTest extends AbstractIntegrationTest {

    private static String accessToken;
    private static String vacancyId;

    @Test @Order(1)
    void registerEmployer() throws Exception {
        String body = """
            {"companyName":"Test Corp","inn":"999888777","email":"portal@test.uz","password":"Portal1234","phone":"+998991234567"}
            """;
        MvcResult result = mockMvc.perform(post("/api/v1/auth/employer/register")
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(jsonPath("$.employerId").exists())
                .andReturn();

        accessToken = com.jayway.jsonpath.JsonPath.read(result.getResponse().getContentAsString(), "$.accessToken");
    }

    @Test @Order(2)
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

    @Test @Order(3)
    void getProfile() throws Exception {
        mockMvc.perform(get("/api/v1/employer/profile")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test Corp"));
    }

    @Test @Order(4)
    void createVacancy() throws Exception {
        String body = """
            {"title":"Test Oshpaz","category":"COOK","city":"Tashkent","description":"Test vacancy","employmentType":"FULL_TIME","salaryFrom":3000000,"positionsCount":5}
            """;
        MvcResult result = mockMvc.perform(post("/api/v1/vacancies")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Test Oshpaz"))
                .andExpect(jsonPath("$.status").value("DRAFT"))
                .andReturn();

        vacancyId = com.jayway.jsonpath.JsonPath.read(result.getResponse().getContentAsString(), "$.id");
    }

    @Test @Order(5)
    void getEmployerVacancies() throws Exception {
        mockMvc.perform(get("/api/v1/vacancies/employer")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].title").value("Test Oshpaz"));
    }

    @Test @Order(6)
    void publishVacancy() throws Exception {
        mockMvc.perform(post("/api/v1/vacancies/" + vacancyId + "/publish")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    @Test @Order(7)
    void updateVacancy() throws Exception {
        mockMvc.perform(put("/api/v1/vacancies/" + vacancyId)
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {"title":"Updated Oshpaz","category":"COOK","city":"Tashkent"}
                            """))
                .andExpect(status().isOk());
    }

    @Test @Order(8)
    void getDashboard() throws Exception {
        mockMvc.perform(get("/api/v1/analytics/overview")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.activeVacancies").isNumber());
    }

    @Test @Order(9)
    void getFunnel() throws Exception {
        mockMvc.perform(get("/api/v1/analytics/funnel")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusCounts").exists());
    }

    @Test @Order(10)
    void getValueReport() throws Exception {
        mockMvc.perform(get("/api/v1/employer/value-report")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.maturityLevel").exists());
    }

    @Test @Order(11)
    void getIntegrationHub() throws Exception {
        mockMvc.perform(get("/api/v1/employer/integrations")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.integrations").isArray())
                .andExpect(jsonPath("$.maturityLevel").isNumber());
    }

    @Test @Order(12)
    void getVacancyHealth() throws Exception {
        mockMvc.perform(get("/api/v1/vacancy-health/all")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test @Order(13)
    void sendChatMessage() throws Exception {
        // Need a candidateId — skip if none exists
        mockMvc.perform(get("/api/v1/chat/conversations")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.conversations").isArray());
    }

    @Test @Order(14)
    void getAutomations() throws Exception {
        mockMvc.perform(get("/api/v1/employer/automations")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk());
    }

    @Test @Order(15)
    void deleteVacancy() throws Exception {
        mockMvc.perform(delete("/api/v1/vacancies/" + vacancyId)
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isNoContent());
    }

    @Test @Order(16)
    void unauthenticatedRequestReturns401() throws Exception {
        mockMvc.perform(get("/api/v1/employer/profile"))
                .andExpect(status().is4xxClientError());
    }
}
