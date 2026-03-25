package uz.verifix.jobs.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import uz.verifix.jobs.api.security.SecurityUtils;
import uz.verifix.jobs.service.intelligence.SalaryIntelligenceService;

import java.util.List;
import java.util.UUID;

/**
 * Market Intelligence API — salary trends, city comparisons, hiring funnels.
 */
@RestController
@RequestMapping("/api/v1/intelligence")
@RequiredArgsConstructor
public class IntelligenceController {

    private final SalaryIntelligenceService salaryIntelligence;

    @GetMapping("/salary/trends")
    public ResponseEntity<List<SalaryIntelligenceService.SalaryTrend>> getSalaryTrends(
            @RequestParam String category, @RequestParam(required = false) String city) {
        return ResponseEntity.ok(salaryIntelligence.getSalaryTrends(category, city));
    }

    @GetMapping("/salary/cities")
    public ResponseEntity<List<SalaryIntelligenceService.CityComparison>> compareCities(
            @RequestParam String category) {
        return ResponseEntity.ok(salaryIntelligence.compareCities(category));
    }

    @GetMapping("/hiring/funnel")
    public ResponseEntity<List<SalaryIntelligenceService.HiringFunnel>> getHiringFunnels(Authentication auth) {
        UUID employerId = SecurityUtils.extractEmployerId(auth);
        return ResponseEntity.ok(salaryIntelligence.getHiringFunnels(employerId));
    }
}
