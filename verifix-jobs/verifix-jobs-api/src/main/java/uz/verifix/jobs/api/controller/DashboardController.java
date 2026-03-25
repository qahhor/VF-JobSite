package uz.verifix.jobs.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import uz.verifix.jobs.api.dto.response.DashboardOverviewResponse;
import uz.verifix.jobs.api.dto.response.FunnelResponse;
import uz.verifix.jobs.api.security.SecurityUtils;
import uz.verifix.jobs.service.analytics.DashboardService;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping({"/api/v1/dashboard", "/api/v1/analytics"})
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/overview")
    public ResponseEntity<DashboardOverviewResponse> getOverview(Authentication auth) {
        UUID employerId = SecurityUtils.extractEmployerId(auth);
        DashboardService.OverviewStats stats = dashboardService.getOverview(employerId);

        return ResponseEntity.ok(DashboardOverviewResponse.builder()
                .activeVacancies(stats.activeVacancies())
                .draftVacancies(stats.draftVacancies())
                .pausedVacancies(stats.pausedVacancies())
                .closedVacancies(stats.closedVacancies())
                .totalApplications(stats.totalApplications())
                .newApplications(stats.newApplications())
                .hiredCount(stats.hiredCount())
                .build());
    }

    @GetMapping("/funnel")
    public ResponseEntity<FunnelResponse> getFunnel(Authentication auth) {
        UUID employerId = SecurityUtils.extractEmployerId(auth);
        Map<String, Long> funnel = dashboardService.getFunnel(employerId);
        long total = funnel.values().stream().mapToLong(Long::longValue).sum();

        return ResponseEntity.ok(FunnelResponse.builder()
                .statusCounts(funnel)
                .total(total)
                .build());
    }
}
