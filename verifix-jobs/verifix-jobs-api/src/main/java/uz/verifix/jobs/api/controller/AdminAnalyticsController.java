package uz.verifix.jobs.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import uz.verifix.jobs.common.dto.SystemOverviewResponse;
import uz.verifix.jobs.service.admin.AdminDashboardService;

@RestController
@RequestMapping("/api/v1/admin/analytics")
@RequiredArgsConstructor
public class AdminAnalyticsController {

    private final AdminDashboardService dashboardService;

    @GetMapping("/overview")
    public ResponseEntity<SystemOverviewResponse> getSystemOverview() {
        return ResponseEntity.ok(dashboardService.getOverview());
    }
}
