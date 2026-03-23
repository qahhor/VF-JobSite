package uz.verifix.jobs.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import uz.verifix.jobs.api.dto.request.BulkStatusRequest;
import uz.verifix.jobs.api.dto.request.RecruiterNoteRequest;
import uz.verifix.jobs.api.dto.request.RejectRequest;
import uz.verifix.jobs.api.dto.response.ApplicationDetailResponse;
import uz.verifix.jobs.api.dto.response.ApplicationResponse;
import uz.verifix.jobs.api.dto.response.ApplicationStatsResponse;
import uz.verifix.jobs.api.security.SecurityUtils;
import uz.verifix.jobs.common.dto.PageResponse;
import uz.verifix.jobs.domain.entity.Application;
import uz.verifix.jobs.domain.entity.Candidate;
import uz.verifix.jobs.domain.entity.WorkHistory;
import uz.verifix.jobs.domain.enums.ApplicationStatus;
import uz.verifix.jobs.domain.repository.ManagerRepository;
import uz.verifix.jobs.domain.repository.WorkHistoryRepository;
import uz.verifix.jobs.service.application.ApplicationService;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;
    private final ManagerRepository managerRepository;
    private final WorkHistoryRepository workHistoryRepository;

    @GetMapping("/vacancy/{vacancyId}")
    public ResponseEntity<PageResponse<ApplicationResponse>> getByVacancy(
            @PathVariable UUID vacancyId,
            @RequestParam(required = false) ApplicationStatus status,
            @PageableDefault(size = 20) Pageable pageable,
            Authentication auth) {

        UUID employerId = SecurityUtils.extractEmployerId(auth, managerRepository);
        Page<Application> page = applicationService.getByVacancy(vacancyId, employerId, status, pageable);
        return ResponseEntity.ok(PageResponse.of(page.map(this::toResponse)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApplicationDetailResponse> getDetail(
            @PathVariable UUID id,
            Authentication auth) {

        UUID employerId = SecurityUtils.extractEmployerId(auth, managerRepository);
        Application application = applicationService.getDetail(id, employerId);
        return ResponseEntity.ok(toDetailResponse(application));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApplicationResponse> changeStatus(
            @PathVariable UUID id,
            @RequestParam ApplicationStatus status,
            Authentication auth) {

        UUID employerId = SecurityUtils.extractEmployerId(auth, managerRepository);
        Application application = applicationService.changeStatus(id, employerId, status);
        return ResponseEntity.ok(toResponse(application));
    }

    @PatchMapping("/{id}/note")
    public ResponseEntity<ApplicationResponse> addNote(
            @PathVariable UUID id,
            @Valid @RequestBody RecruiterNoteRequest request,
            Authentication auth) {

        UUID employerId = SecurityUtils.extractEmployerId(auth, managerRepository);
        Application application = applicationService.addNote(id, employerId, request.getNote());
        return ResponseEntity.ok(toResponse(application));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<ApplicationResponse> reject(
            @PathVariable UUID id,
            @Valid @RequestBody RejectRequest request,
            Authentication auth) {

        UUID employerId = SecurityUtils.extractEmployerId(auth, managerRepository);
        Application application = applicationService.reject(id, employerId, request.getReason());
        return ResponseEntity.ok(toResponse(application));
    }

    @PostMapping("/bulk-status")
    public ResponseEntity<List<ApplicationResponse>> bulkChangeStatus(
            @Valid @RequestBody BulkStatusRequest request,
            Authentication auth) {

        UUID employerId = SecurityUtils.extractEmployerId(auth, managerRepository);
        List<Application> applications = applicationService.bulkChangeStatus(
                request.getApplicationIds(), employerId, request.getStatus());
        return ResponseEntity.ok(applications.stream().map(this::toResponse).toList());
    }

    @GetMapping("/vacancy/{vacancyId}/stats")
    public ResponseEntity<ApplicationStatsResponse> getStats(
            @PathVariable UUID vacancyId,
            Authentication auth) {

        UUID employerId = SecurityUtils.extractEmployerId(auth, managerRepository);
        Map<String, Long> stats = applicationService.getStatsMap(vacancyId, employerId);
        long total = stats.getOrDefault("TOTAL", 0L);
        stats.remove("TOTAL");

        return ResponseEntity.ok(ApplicationStatsResponse.builder()
                .vacancyId(vacancyId)
                .statusCounts(stats)
                .total(total)
                .build());
    }

    private ApplicationResponse toResponse(Application app) {
        Candidate c = app.getCandidate();
        return ApplicationResponse.builder()
                .id(app.getId())
                .vacancyId(app.getVacancy().getId())
                .vacancyTitle(app.getVacancy().getTitle())
                .candidateId(c.getId())
                .candidateName(c.getFirstName() + " " + c.getLastName())
                .candidatePhone(c.getPhone())
                .candidateCity(c.getCity())
                .status(app.getStatus().name())
                .source(app.getSource() != null ? app.getSource().name() : null)
                .appliedAt(app.getAppliedAt())
                .viewedAt(app.getViewedAt())
                .invitedAt(app.getInvitedAt())
                .rejectedAt(app.getRejectedAt())
                .hiredAt(app.getHiredAt())
                .rejectionReason(app.getRejectionReason())
                .recruiterNotes(app.getRecruiterNotes())
                .createdAt(app.getCreatedAt())
                .build();
    }

    private ApplicationDetailResponse toDetailResponse(Application app) {
        Candidate c = app.getCandidate();
        List<WorkHistory> histories = workHistoryRepository.findByCandidateIdOrderByStartDateDesc(c.getId());

        return ApplicationDetailResponse.builder()
                .id(app.getId())
                .status(app.getStatus().name())
                .source(app.getSource() != null ? app.getSource().name() : null)
                .appliedAt(app.getAppliedAt())
                .viewedAt(app.getViewedAt())
                .invitedAt(app.getInvitedAt())
                .rejectedAt(app.getRejectedAt())
                .hiredAt(app.getHiredAt())
                .rejectionReason(app.getRejectionReason())
                .recruiterNotes(app.getRecruiterNotes())
                .vacancyId(app.getVacancy().getId())
                .vacancyTitle(app.getVacancy().getTitle())
                .candidateId(c.getId())
                .firstName(c.getFirstName())
                .lastName(c.getLastName())
                .phone(c.getPhone())
                .city(c.getCity())
                .region(c.getRegion())
                .gender(c.getGender() != null ? c.getGender().name() : null)
                .educationLevel(c.getEducationLevel() != null ? c.getEducationLevel().name() : null)
                .birthDate(c.getBirthDate())
                .skills(c.getSkills())
                .workExperienceText(c.getWorkExperienceText())
                .workHistory(histories.stream().map(wh -> ApplicationDetailResponse.WorkHistoryItem.builder()
                        .jobTitle(wh.getJobTitle())
                        .companyName(wh.getCompanyName())
                        .employmentType(wh.getEmploymentType() != null ? wh.getEmploymentType().name() : null)
                        .startDate(wh.getStartDate())
                        .endDate(wh.getEndDate())
                        .description(wh.getDescription())
                        .build()).toList())
                .build();
    }
}
