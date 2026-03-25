package uz.verifix.jobs.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import uz.verifix.jobs.api.dto.request.EmployerUpdateRequest;
import uz.verifix.jobs.api.dto.response.EmployerProfileResponse;
import uz.verifix.jobs.api.mapper.EmployerMapper;
import uz.verifix.jobs.api.security.SecurityUtils;
import uz.verifix.jobs.domain.entity.Employer;
import uz.verifix.jobs.service.employer.EmployerProfileService;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/employer")
@RequiredArgsConstructor
public class EmployerController {

    private final EmployerProfileService employerProfileService;
    private final EmployerMapper employerMapper;

    @GetMapping("/profile")
    public ResponseEntity<EmployerProfileResponse> getProfile(Authentication auth) {
        UUID employerId = SecurityUtils.extractEmployerId(auth);
        Employer employer = employerProfileService.getProfile(employerId);
        long activeVacancies = employerProfileService.getActiveVacancyCount(employerId);
        return ResponseEntity.ok(employerMapper.toResponse(employer, activeVacancies));
    }

    @PutMapping("/profile")
    public ResponseEntity<EmployerProfileResponse> updateProfile(
            @Valid @RequestBody EmployerUpdateRequest request,
            Authentication auth) {

        UUID employerId = SecurityUtils.extractEmployerId(auth);
        Employer employer = employerProfileService.updateProfile(
                employerId,
                request.getName(),
                request.getLegalName(),
                request.getIndustry(),
                request.getCity(),
                request.getRegion(),
                request.getLatitude(),
                request.getLongitude()
        );
        long activeVacancies = employerProfileService.getActiveVacancyCount(employerId);
        return ResponseEntity.ok(employerMapper.toResponse(employer, activeVacancies));
    }

    @PatchMapping("/profile/logo")
    public ResponseEntity<EmployerProfileResponse> updateLogo(
            @RequestParam String logoUrl,
            Authentication auth) {

        UUID employerId = SecurityUtils.extractEmployerId(auth);
        Employer employer = employerProfileService.updateLogo(employerId, logoUrl);
        long activeVacancies = employerProfileService.getActiveVacancyCount(employerId);
        return ResponseEntity.ok(employerMapper.toResponse(employer, activeVacancies));
    }
}
