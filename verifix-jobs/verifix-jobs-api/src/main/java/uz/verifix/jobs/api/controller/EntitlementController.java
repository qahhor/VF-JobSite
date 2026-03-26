package uz.verifix.jobs.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import uz.verifix.jobs.api.security.SecurityUtils;
import uz.verifix.jobs.service.commerce.EntitlementService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/employer/entitlements")
@RequiredArgsConstructor
public class EntitlementController {

    private final EntitlementService entitlementService;

    @GetMapping
    public ResponseEntity<List<EntitlementService.Entitlement>> getEntitlements(Authentication auth) {
        UUID employerId = SecurityUtils.extractEmployerId(auth);
        return ResponseEntity.ok(entitlementService.getEntitlements(employerId));
    }
}
