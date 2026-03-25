package uz.verifix.jobs.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import uz.verifix.jobs.api.security.SecurityUtils;
import uz.verifix.jobs.integration.verifix.HrmDivision;
import uz.verifix.jobs.integration.verifix.HrmJob;
import uz.verifix.jobs.service.hrm.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/hrm")
@RequiredArgsConstructor
public class HrmIntegrationController {

    private final HrmSsoService ssoService;
    private final HrmOrgSyncService orgSyncService;
    private final HrmSalaryDataService salaryDataService;
    private final HrmReferralBridgeService referralBridgeService;

    // ==================== SSO ====================

    @GetMapping("/sso/authorize")
    public ResponseEntity<Map<String, String>> getAuthorizationUrl(@RequestParam(defaultValue = "") String state) {
        String url = ssoService.getAuthorizationUrl(state);
        return ResponseEntity.ok(Map.of("authorization_url", url));
    }

    @PostMapping("/sso/callback")
    public ResponseEntity<HrmSsoService.SsoLoginResult> handleSsoCallback(@RequestBody Map<String, String> body) {
        String authCode = body.get("code");
        if (authCode == null || authCode.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        HrmSsoService.SsoLoginResult result = ssoService.handleCallback(authCode);
        return ResponseEntity.ok(result);
    }

    // ==================== Org Structure ====================

    @GetMapping("/org/divisions")
    public ResponseEntity<List<HrmDivision>> getDivisions(Authentication auth) {
        UUID employerId = SecurityUtils.extractEmployerId(auth);
        return ResponseEntity.ok(orgSyncService.getActiveDivisions(employerId));
    }

    @GetMapping("/org/jobs")
    public ResponseEntity<List<HrmJob>> getJobs(Authentication auth) {
        UUID employerId = SecurityUtils.extractEmployerId(auth);
        return ResponseEntity.ok(orgSyncService.getActiveJobs(employerId));
    }

    @GetMapping("/org/structure")
    public ResponseEntity<HrmOrgSyncService.OrgStructure> getOrgStructure(Authentication auth) {
        UUID employerId = SecurityUtils.extractEmployerId(auth);
        return ResponseEntity.ok(orgSyncService.getOrgStructure(employerId));
    }

    // ==================== Salary Benchmarks ====================

    @GetMapping("/salary/benchmarks")
    public ResponseEntity<List<HrmSalaryDataService.SalaryBenchmark>> getSalaryBenchmarks() {
        return ResponseEntity.ok(salaryDataService.getAggregatedSalaryData());
    }

    @GetMapping("/salary/benchmark")
    public ResponseEntity<HrmSalaryDataService.SalaryBenchmark> getSalaryBenchmark(
            @RequestParam String jobName,
            @RequestParam(required = false) String region) {
        HrmSalaryDataService.SalaryBenchmark benchmark = salaryDataService.getSalaryBenchmark(jobName, region);
        return benchmark != null ? ResponseEntity.ok(benchmark) : ResponseEntity.notFound().build();
    }

    // ==================== Referral Program ====================

    @GetMapping("/referral/employees")
    public ResponseEntity<List<HrmReferralBridgeService.ReferralEmployee>> getReferralEmployees(Authentication auth) {
        UUID employerId = SecurityUtils.extractEmployerId(auth);
        return ResponseEntity.ok(referralBridgeService.getEligibleEmployees(employerId));
    }
}
