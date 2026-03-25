package uz.verifix.jobs.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import uz.verifix.jobs.api.security.SecurityUtils;
import uz.verifix.jobs.service.commerce.EntitlementService;
import uz.verifix.jobs.service.commerce.VacancyPromotionService;
import uz.verifix.jobs.service.dashboard.IntegrationHubService;
import uz.verifix.jobs.service.dashboard.ValueReportService;
import uz.verifix.jobs.service.marketplace.CategoryHubService;
import uz.verifix.jobs.service.marketplace.CityHubService;
import uz.verifix.jobs.service.marketplace.SavedSearchService;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class CommerceController {

    private final EntitlementService entitlementService;
    private final VacancyPromotionService promotionService;
    private final ValueReportService valueReportService;
    private final IntegrationHubService integrationHubService;
    private final CategoryHubService categoryHubService;
    private final CityHubService cityHubService;
    private final SavedSearchService savedSearchService;

    // Entitlements
    @GetMapping("/api/v1/employer/entitlements")
    public ResponseEntity<List<EntitlementService.Entitlement>> getEntitlements(Authentication auth) {
        return ResponseEntity.ok(entitlementService.getEntitlements(SecurityUtils.extractEmployerId(auth)));
    }

    // Promotion
    @PostMapping("/api/v1/employer/vacancies/{vacancyId}/promote")
    public ResponseEntity<Map<String, Object>> promote(Authentication auth, @PathVariable UUID vacancyId) {
        UUID employerId = SecurityUtils.extractEmployerId(auth);
        boolean ok = promotionService.promoteVacancy(vacancyId, employerId);
        return ok ? ResponseEntity.ok(Map.of("status", "promoted")) :
                ResponseEntity.badRequest().body(Map.of("error", "Promosyon kreditlari yetarli emas"));
    }

    // Value Report
    @GetMapping("/api/v1/employer/value-report")
    public ResponseEntity<ValueReportService.ValueReport> getValueReport(Authentication auth) {
        return ResponseEntity.ok(valueReportService.generate(SecurityUtils.extractEmployerId(auth)));
    }

    // Integration Hub
    @GetMapping("/api/v1/employer/integrations")
    public ResponseEntity<IntegrationHubService.HubOverview> getIntegrations(Authentication auth) {
        return ResponseEntity.ok(integrationHubService.getStatus(SecurityUtils.extractEmployerId(auth)));
    }

    // Public Category/City hubs (no auth)
    @GetMapping("/api/v1/public/categories")
    public ResponseEntity<List<CategoryHubService.CategoryHub>> getCategories() {
        return ResponseEntity.ok(categoryHubService.getCategories());
    }

    @GetMapping("/api/v1/public/cities")
    public ResponseEntity<List<CityHubService.CityHub>> getCities() {
        return ResponseEntity.ok(cityHubService.getCities());
    }

    // Saved Searches (candidate auth)
    @PostMapping("/api/v1/candidates/saved-searches")
    public ResponseEntity<Map<String, Object>> saveSearch(Authentication auth, @RequestBody Map<String, Object> body) {
        UUID candidateId = SecurityUtils.extractUserId(auth);
        @SuppressWarnings("unchecked")
        Map<String, Object> filters = (Map<String, Object>) body.get("filters");
        return ResponseEntity.ok(savedSearchService.saveSearch(candidateId,
                (String) body.get("query"), filters, Boolean.TRUE.equals(body.get("notifyEnabled"))));
    }

    @GetMapping("/api/v1/candidates/saved-searches")
    public ResponseEntity<List<Map<String, Object>>> getSavedSearches(Authentication auth) {
        return ResponseEntity.ok(savedSearchService.getSavedSearches(SecurityUtils.extractUserId(auth)));
    }

    @DeleteMapping("/api/v1/candidates/saved-searches/{id}")
    public ResponseEntity<Void> deleteSearch(Authentication auth, @PathVariable UUID id) {
        savedSearchService.deleteSearch(id, SecurityUtils.extractUserId(auth));
        return ResponseEntity.noContent().build();
    }
}
