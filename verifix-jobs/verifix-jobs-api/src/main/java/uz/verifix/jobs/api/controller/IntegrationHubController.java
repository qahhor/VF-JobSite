package uz.verifix.jobs.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import uz.verifix.jobs.api.security.SecurityUtils;
import uz.verifix.jobs.service.dashboard.IntegrationHubService;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/employer/integrations")
@RequiredArgsConstructor
public class IntegrationHubController {

    private final IntegrationHubService integrationHubService;

    @GetMapping
    public ResponseEntity<IntegrationHubService.HubOverview> getStatus(Authentication auth) {
        UUID employerId = SecurityUtils.extractEmployerId(auth);
        return ResponseEntity.ok(integrationHubService.getStatus(employerId));
    }
}
