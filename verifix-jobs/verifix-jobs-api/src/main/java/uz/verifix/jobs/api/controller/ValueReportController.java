package uz.verifix.jobs.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import uz.verifix.jobs.api.security.SecurityUtils;
import uz.verifix.jobs.service.dashboard.ValueReportService;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/employer/value-report")
@RequiredArgsConstructor
public class ValueReportController {

    private final ValueReportService valueReportService;

    @GetMapping
    public ResponseEntity<ValueReportService.ValueReport> getReport(Authentication auth) {
        UUID employerId = SecurityUtils.extractEmployerId(auth);
        return ResponseEntity.ok(valueReportService.generate(employerId));
    }
}
