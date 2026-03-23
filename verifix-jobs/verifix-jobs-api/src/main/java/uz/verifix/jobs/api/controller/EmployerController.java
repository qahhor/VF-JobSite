package uz.verifix.jobs.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import uz.verifix.jobs.api.dto.request.EmployerUpdateRequest;
import uz.verifix.jobs.api.dto.response.EmployerProfileResponse;
import uz.verifix.jobs.api.security.SecurityUtils;
import uz.verifix.jobs.domain.entity.Employer;
import uz.verifix.jobs.domain.repository.ManagerRepository;
import uz.verifix.jobs.service.employer.EmployerProfileService;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/employer")
@RequiredArgsConstructor
public class EmployerController {

    private final EmployerProfileService employerProfileService;
    private final ManagerRepository managerRepository;

    @GetMapping("/profile")
    public ResponseEntity<EmployerProfileResponse> getProfile(Authentication auth) {
        UUID employerId = SecurityUtils.extractEmployerId(auth, managerRepository);
        Employer employer = employerProfileService.getProfile(employerId);
        long activeVacancies = employerProfileService.getActiveVacancyCount(employerId);
        return ResponseEntity.ok(toResponse(employer, activeVacancies));
    }

    @PutMapping("/profile")
    public ResponseEntity<EmployerProfileResponse> updateProfile(
            @Valid @RequestBody EmployerUpdateRequest request,
            Authentication auth) {

        UUID employerId = SecurityUtils.extractEmployerId(auth, managerRepository);
        Employer employer = employerProfileService.updateProfile(employerId,
                request.getName(), request.getLegalName(), request.getIndustry(),
                request.getCity(), request.getRegion(), request.getLatitude(), request.getLongitude());
        long activeVacancies = employerProfileService.getActiveVacancyCount(employerId);
        return ResponseEntity.ok(toResponse(employer, activeVacancies));
    }

    @PatchMapping("/profile/logo")
    public ResponseEntity<EmployerProfileResponse> updateLogo(
            @RequestParam String logoUrl,
            Authentication auth) {

        UUID employerId = SecurityUtils.extractEmployerId(auth, managerRepository);
        Employer employer = employerProfileService.updateLogo(employerId, logoUrl);
        long activeVacancies = employerProfileService.getActiveVacancyCount(employerId);
        return ResponseEntity.ok(toResponse(employer, activeVacancies));
    }

    private EmployerProfileResponse toResponse(Employer e, long activeVacancies) {
        return EmployerProfileResponse.builder()
                .id(e.getId())
                .name(e.getName())
                .inn(e.getInn())
                .legalName(e.getLegalName())
                .logoUrl(e.getLogoUrl())
                .industry(e.getIndustry())
                .city(e.getCity())
                .region(e.getRegion())
                .latitude(e.getLocation() != null ? e.getLocation().getY() : null)
                .longitude(e.getLocation() != null ? e.getLocation().getX() : null)
                .status(e.getStatus().name())
                .moderationStatus(e.getModerationStatus().name())
                .subscriptionPlan(e.getSubscriptionPlan())
                .isVerified(e.getIsVerified())
                .activeVacancies(activeVacancies)
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }
}
