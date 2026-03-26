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

import java.math.BigDecimal;
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
    public ResponseEntity<SavedSearchService.SavedSearchView> saveSearch(Authentication auth, @RequestBody Map<String, Object> body) {
        UUID candidateId = SecurityUtils.extractCandidateId(auth);
        return ResponseEntity.ok(savedSearchService.saveSearch(candidateId, toSavedSearchPayload(body)));
    }

    @GetMapping("/api/v1/candidates/saved-searches")
    public ResponseEntity<List<SavedSearchService.SavedSearchView>> getSavedSearches(Authentication auth) {
        return ResponseEntity.ok(savedSearchService.getSavedSearches(SecurityUtils.extractCandidateId(auth)));
    }

    @DeleteMapping("/api/v1/candidates/saved-searches/{id}")
    public ResponseEntity<Void> deleteSearch(Authentication auth, @PathVariable UUID id) {
        savedSearchService.deleteSearch(id, SecurityUtils.extractCandidateId(auth));
        return ResponseEntity.noContent().build();
    }

    // Saved Searches (public fallback by candidateId)
    @PostMapping("/api/v1/public/saved-searches")
    public ResponseEntity<?> savePublicSearch(@RequestBody Map<String, Object> body) {
        UUID candidateId = parseUuid(body.get("candidateId"));
        if (candidateId == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "candidateId majburiy"));
        }
        return ResponseEntity.ok(savedSearchService.saveSearch(candidateId, toSavedSearchPayload(body)));
    }

    @GetMapping("/api/v1/public/saved-searches")
    public ResponseEntity<?> getPublicSavedSearches(@RequestParam String candidateId) {
        UUID parsed = parseUuid(candidateId);
        if (parsed == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Noto'g'ri candidateId"));
        }
        return ResponseEntity.ok(savedSearchService.getSavedSearches(parsed));
    }

    @DeleteMapping("/api/v1/public/saved-searches/{id}")
    public ResponseEntity<?> deletePublicSavedSearch(@PathVariable UUID id, @RequestParam String candidateId) {
        UUID parsed = parseUuid(candidateId);
        if (parsed == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Noto'g'ri candidateId"));
        }
        savedSearchService.deleteSearch(id, parsed);
        return ResponseEntity.noContent().build();
    }

    private SavedSearchService.SavedSearchPayload toSavedSearchPayload(Map<String, Object> body) {
        return new SavedSearchService.SavedSearchPayload(
                body.get("name") != null ? body.get("name").toString() : "Saqlangan qidiruv",
                body.get("query") != null ? body.get("query").toString() : null,
                body.get("city") != null ? body.get("city").toString() : null,
                body.get("category") != null ? body.get("category").toString() : null,
                body.get("minSalary") != null ? new BigDecimal(body.get("minSalary").toString()) : null,
                body.get("maxSalary") != null ? new BigDecimal(body.get("maxSalary").toString()) : null,
                body.get("employmentType") != null ? body.get("employmentType").toString() : null,
                body.get("shiftSchedule") != null ? body.get("shiftSchedule").toString() : null,
                readStringList(body.get("benefits")),
                body.containsKey("verifiedOnly") && Boolean.parseBoolean(body.get("verifiedOnly").toString()),
                !body.containsKey("notifyEnabled") || Boolean.parseBoolean(body.get("notifyEnabled").toString())
        );
    }

    private List<String> readStringList(Object raw) {
        if (raw == null) {
            return List.of();
        }
        if (raw instanceof List<?> list) {
            return list.stream().map(String::valueOf).toList();
        }
        return List.of(raw.toString().split(","));
    }

    private UUID parseUuid(Object raw) {
        if (raw == null) {
            return null;
        }
        try {
            return UUID.fromString(raw.toString());
        } catch (IllegalArgumentException ignored) {
            return null;
        }
    }
}
