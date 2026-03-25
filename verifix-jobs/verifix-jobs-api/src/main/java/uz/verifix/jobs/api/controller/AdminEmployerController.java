package uz.verifix.jobs.api.controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import uz.verifix.jobs.api.dto.response.EmployerProfileResponse;
import uz.verifix.jobs.api.mapper.EmployerMapper;
import uz.verifix.jobs.api.security.SecurityUtils;
import uz.verifix.jobs.common.dto.PageResponse;
import uz.verifix.jobs.domain.entity.Employer;
import uz.verifix.jobs.domain.enums.EmployerStatus;
import uz.verifix.jobs.service.admin.AdminAuditService;
import uz.verifix.jobs.service.admin.AdminEmployerService;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/employers")
@RequiredArgsConstructor
public class AdminEmployerController {

    private final AdminEmployerService adminEmployerService;
    private final AdminAuditService adminAuditService;
    private final EmployerMapper employerMapper;

    @GetMapping
    public ResponseEntity<PageResponse<EmployerProfileResponse>> list(
            @RequestParam(required = false) EmployerStatus status,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<Employer> page = adminEmployerService.list(status, pageable);
        return ResponseEntity.ok(PageResponse.of(page.map(employer -> employerMapper.toResponse(employer, 0))));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<EmployerProfileResponse> changeStatus(
            @PathVariable UUID id,
            @RequestParam EmployerStatus status,
            Authentication auth,
            HttpServletRequest request) {

        UUID adminId = SecurityUtils.extractUserId(auth);
        Employer employer = adminEmployerService.changeStatus(id, status);
        adminAuditService.log(adminId, "EMPLOYER_STATUS_CHANGE", "Employer", id,
                "{\"newStatus\":\"" + status + "\"}", request.getRemoteAddr());
        return ResponseEntity.ok(employerMapper.toResponse(employer, 0));
    }

    @PostMapping("/{id}/verify")
    public ResponseEntity<EmployerProfileResponse> verify(
            @PathVariable UUID id,
            Authentication auth,
            HttpServletRequest request) {

        UUID adminId = SecurityUtils.extractUserId(auth);
        Employer employer = adminEmployerService.verify(id);
        adminAuditService.log(adminId, "EMPLOYER_VERIFY", "Employer", id, null, request.getRemoteAddr());
        return ResponseEntity.ok(employerMapper.toResponse(employer, 0));
    }
}
