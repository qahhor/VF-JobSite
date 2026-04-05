package uz.verifix.jobs.api.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import uz.verifix.jobs.api.dto.request.AdminEmployerRequest;
import uz.verifix.jobs.api.dto.response.EmployerProfileResponse;
import uz.verifix.jobs.api.mapper.EmployerMapper;
import uz.verifix.jobs.api.security.SecurityUtils;
import uz.verifix.jobs.common.dto.PageResponse;
import uz.verifix.jobs.domain.entity.Employer;
import uz.verifix.jobs.domain.enums.EmployerStatus;
import uz.verifix.jobs.domain.enums.VacancyStatus;
import uz.verifix.jobs.domain.repository.VacancyRepository;
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
    private final VacancyRepository vacancyRepository;

    @GetMapping
    public ResponseEntity<PageResponse<EmployerProfileResponse>> list(
            @RequestParam(required = false) EmployerStatus status,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<Employer> page = adminEmployerService.list(status, search, pageable);
        return ResponseEntity.ok(PageResponse.of(page.map(this::toResponse)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmployerProfileResponse> getById(@PathVariable UUID id) {
        Employer employer = adminEmployerService.getById(id);
        return ResponseEntity.ok(toResponse(employer));
    }

    @PostMapping
    public ResponseEntity<EmployerProfileResponse> create(
            @Valid @RequestBody AdminEmployerRequest request,
            Authentication auth,
            HttpServletRequest httpRequest) {

        UUID adminId = SecurityUtils.extractAdminId(auth);
        Employer employer = adminEmployerService.create(
                request.getName(), request.getInn(), request.getLegalName(),
                request.getCity(), request.getRegion(), request.getIndustry(),
                request.getWebsiteUrl(), request.getEmployeeCountRange(),
                request.getFoundedYear(), request.getDescription(),
                request.getStatus(), request.getIsVerified(), request.getDeactivationReason());
        adminAuditService.log(adminId, "EMPLOYER_CREATE", "Employer", employer.getId(),
                "{\"name\":\"" + request.getName() + "\"}", httpRequest.getRemoteAddr());
        return ResponseEntity.ok(toResponse(employer));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmployerProfileResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody AdminEmployerRequest request,
            Authentication auth,
            HttpServletRequest httpRequest) {

        UUID adminId = SecurityUtils.extractAdminId(auth);
        Employer employer = adminEmployerService.update(id,
                request.getName(), request.getInn(), request.getLegalName(),
                request.getCity(), request.getRegion(), request.getIndustry(),
                request.getWebsiteUrl(), request.getEmployeeCountRange(),
                request.getFoundedYear(), request.getDescription(),
                request.getStatus(), request.getIsVerified(), request.getDeactivationReason());
        adminAuditService.log(adminId, "EMPLOYER_UPDATE", "Employer", id,
                "{\"name\":\"" + request.getName() + "\"}", httpRequest.getRemoteAddr());
        return ResponseEntity.ok(toResponse(employer));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable UUID id,
            Authentication auth,
            HttpServletRequest httpRequest) {

        UUID adminId = SecurityUtils.extractAdminId(auth);
        adminEmployerService.delete(id);
        adminAuditService.log(adminId, "EMPLOYER_DELETE", "Employer", id, null, httpRequest.getRemoteAddr());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<EmployerProfileResponse> changeStatus(
            @PathVariable UUID id,
            @RequestParam EmployerStatus status,
            @RequestParam(required = false) String reason,
            Authentication auth,
            HttpServletRequest request) {

        UUID adminId = SecurityUtils.extractAdminId(auth);
        Employer employer = adminEmployerService.changeStatus(id, status, reason);
        adminAuditService.log(adminId, "EMPLOYER_STATUS_CHANGE", "Employer", id,
                "{\"newStatus\":\"" + status + "\"}", request.getRemoteAddr());
        return ResponseEntity.ok(toResponse(employer));
    }

    @PostMapping("/{id}/verify")
    public ResponseEntity<EmployerProfileResponse> verify(
            @PathVariable UUID id,
            Authentication auth,
            HttpServletRequest request) {

        UUID adminId = SecurityUtils.extractAdminId(auth);
        Employer employer = adminEmployerService.verify(id);
        adminAuditService.log(adminId, "EMPLOYER_VERIFY", "Employer", id, null, request.getRemoteAddr());
        return ResponseEntity.ok(toResponse(employer));
    }

    private EmployerProfileResponse toResponse(Employer employer) {
        long activeVacancies = vacancyRepository.countByEmployerIdAndStatus(employer.getId(), VacancyStatus.ACTIVE);
        long totalVacancies = adminEmployerService.countTotal(employer.getId());
        return employerMapper.toResponse(employer, activeVacancies, totalVacancies);
    }
}
