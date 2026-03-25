package uz.verifix.jobs.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uz.verifix.jobs.common.dto.PageResponse;
import uz.verifix.jobs.domain.entity.Vacancy;
import uz.verifix.jobs.service.marketplace.CategoryHubService;
import uz.verifix.jobs.service.marketplace.CityHubService;
import uz.verifix.jobs.service.marketplace.PublicVacancyService;
import uz.verifix.jobs.service.regional.RegionalConfigService;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Partner/Open API — for job boards, HR agencies, aggregators.
 * Rate limited. API key authentication (future).
 */
@Tag(name = "Partner API", description = "Ochiq API — ish portallari va HR agentliklari uchun")
@RestController
@RequestMapping("/api/v1/partner")
@RequiredArgsConstructor
public class PartnerApiController {

    private final PublicVacancyService vacancyService;
    private final CategoryHubService categoryHub;
    private final CityHubService cityHub;
    private final RegionalConfigService regionalConfig;

    @Operation(summary = "Vakansiyalar feed", description = "JSON feed barcha faol vakansiyalar")
    @GetMapping("/feed/vacancies")
    public ResponseEntity<PageResponse<Vacancy>> vacancyFeed(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) BigDecimal salaryMin,
            @PageableDefault(size = 50) Pageable pageable) {
        return ResponseEntity.ok(PageResponse.of(
                vacancyService.listActiveVacancies(city, category, salaryMin, null, null, pageable)));
    }

    @Operation(summary = "Kategoriyalar", description = "Barcha kategoriyalar statistikasi bilan")
    @GetMapping("/feed/categories")
    public ResponseEntity<List<CategoryHubService.CategoryHub>> categories() {
        return ResponseEntity.ok(categoryHub.getCategories());
    }

    @Operation(summary = "Shaharlar", description = "Barcha shaharlar statistikasi bilan")
    @GetMapping("/feed/cities")
    public ResponseEntity<List<CityHubService.CityHub>> cities() {
        return ResponseEntity.ok(cityHub.getCities());
    }

    @Operation(summary = "Regional config", description = "Mamlakatlar va valyutalar")
    @GetMapping("/config/regions")
    public ResponseEntity<List<RegionalConfigService.Country>> regions() {
        return ResponseEntity.ok(regionalConfig.getAllCountries());
    }

    @Operation(summary = "API status")
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> status() {
        return ResponseEntity.ok(Map.of(
                "api", "verifix-jobs-partner",
                "version", "1.0",
                "status", "operational"
        ));
    }
}
