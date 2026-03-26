package uz.verifix.jobs.api;

import org.junit.jupiter.api.*;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class PublicEndpointsIntegrationTest extends AbstractIntegrationTest {

    @Test
    void publicStats() throws Exception {
        mockMvc.perform(get("/api/v1/public/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalVacancies").isNumber())
                .andExpect(jsonPath("$.totalEmployers").isNumber());
    }

    @Test
    void publicVacancies() throws Exception {
        mockMvc.perform(get("/api/v1/public/vacancies"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    void publicVacanciesAcceptExtendedFilters() throws Exception {
        mockMvc.perform(get("/api/v1/public/vacancies")
                        .param("salaryMin", "1000000")
                        .param("salaryMax", "7000000")
                        .param("employmentType", "FULL_TIME")
                        .param("shiftSchedule", "MORNING")
                        .param("benefits", "transport,bonus")
                        .param("verifiedOnly", "true")
                        .param("sort", "salary_desc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    void publicCompanies() throws Exception {
        mockMvc.perform(get("/api/v1/public/companies"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    void publicCategoriesEndpoint() throws Exception {
        mockMvc.perform(get("/api/v1/public/categories"))
                .andExpect(status().isOk());
    }

    @Test
    void publicCitiesEndpoint() throws Exception {
        mockMvc.perform(get("/api/v1/public/cities"))
                .andExpect(status().isOk());
    }

    @Test
    void publicQuickApplyValidation() throws Exception {
        mockMvc.perform(post("/api/v1/public/apply")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {"vacancyId":"invalid","phone":"+998901234567","firstName":"Test"}
                            """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void publicAddFavoriteValidation() throws Exception {
        mockMvc.perform(post("/api/v1/public/favorites")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {"candidateId":"invalid","vacancyId":"invalid"}
                            """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void publicSavedSearchValidation() throws Exception {
        mockMvc.perform(post("/api/v1/public/saved-searches")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {"candidateId":"invalid","name":"Test search"}
                            """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void publicCompanyReviews() throws Exception {
        mockMvc.perform(get("/api/v1/public/companies/nonexistent/reviews"))
                .andExpect(status().isNotFound());
    }

    @Test
    void publicSimilarVacanciesMissingVacancyReturnsNotFound() throws Exception {
        mockMvc.perform(get("/api/v1/public/vacancies/nonexistent/similar"))
                .andExpect(status().isNotFound());
    }

    @Test
    void salaryPredictEndpoint() throws Exception {
        mockMvc.perform(get("/api/v1/salary/predict").param("category", "COOK"))
                .andExpect(status().isOk());
    }

    @Test
    void salaryTrendsEndpoint() throws Exception {
        mockMvc.perform(get("/api/v1/intelligence/salary/trends").param("category", "DRIVER"))
                .andExpect(status().isOk());
    }

    @Test
    void subscriptionPlansPublic() throws Exception {
        mockMvc.perform(get("/api/v1/subscription/plans"))
                .andExpect(status().isOk());
    }

    @Test
    void healthEndpoint() throws Exception {
        mockMvc.perform(get("/actuator/health"))
                .andExpect(status().isOk());
    }
}
