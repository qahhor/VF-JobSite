package uz.verifix.jobs.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import uz.verifix.jobs.api.security.SecurityUtils;
import uz.verifix.jobs.service.dashboard.CivilityScoreService;
import uz.verifix.jobs.service.dashboard.VacancyHealthService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/vacancy-health")
@RequiredArgsConstructor
public class VacancyHealthController {

    private final VacancyHealthService healthService;
    private final CivilityScoreService civilityService;

    @GetMapping("/{vacancyId}")
    public ResponseEntity<VacancyHealthService.VacancyHealth> getHealth(@PathVariable UUID vacancyId) {
        var health = healthService.diagnose(vacancyId);
        return health != null ? ResponseEntity.ok(health) : ResponseEntity.notFound().build();
    }

    @GetMapping("/all")
    public ResponseEntity<List<VacancyHealthService.VacancyHealth>> getAllHealth(Authentication auth) {
        UUID employerId = SecurityUtils.extractEmployerId(auth);
        return ResponseEntity.ok(healthService.diagnoseAll(employerId));
    }

    @GetMapping("/civility")
    public ResponseEntity<CivilityScoreService.CivilityScore> getCivilityScore(Authentication auth) {
        UUID employerId = SecurityUtils.extractEmployerId(auth);
        return ResponseEntity.ok(civilityService.calculate(employerId));
    }
}
