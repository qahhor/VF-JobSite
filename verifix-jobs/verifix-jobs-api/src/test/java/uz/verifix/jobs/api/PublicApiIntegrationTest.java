package uz.verifix.jobs.api;

import org.junit.jupiter.api.Test;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration test: Public API endpoints work without auth.
 */
class PublicApiIntegrationTest extends AbstractIntegrationTest {

    @Test
    void publicVacanciesEndpointWorks() throws Exception {
        mockMvc.perform(get("/api/v1/public/vacancies"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    void publicCategoriesEndpointWorks() throws Exception {
        mockMvc.perform(get("/api/v1/public/categories"))
                .andExpect(status().isOk());
    }

    @Test
    void publicCitiesEndpointWorks() throws Exception {
        mockMvc.perform(get("/api/v1/public/cities"))
                .andExpect(status().isOk());
    }

    @Test
    void healthEndpointWorks() throws Exception {
        mockMvc.perform(get("/actuator/health"))
                .andExpect(status().isOk());
    }

    @Test
    void swaggerEndpointWorks() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk());
    }

    @Test
    void protectedEndpointRequiresAuth() throws Exception {
        mockMvc.perform(get("/api/v1/vacancies"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void salaryBenchmarksPubliclyAccessible() throws Exception {
        mockMvc.perform(get("/api/v1/hrm/salary/benchmarks"))
                .andExpect(status().isOk());
    }
}
