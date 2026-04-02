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
import uz.verifix.jobs.api.dto.request.InviteCandidateRequest;
import uz.verifix.jobs.api.dto.request.RecruiterNoteRequest;
import uz.verifix.jobs.api.dto.request.RejectRequest;
import uz.verifix.jobs.api.dto.response.ApplicationDetailResponse;
import uz.verifix.jobs.api.dto.response.ApplicationResponse;
import uz.verifix.jobs.api.dto.response.ApplicationStatsResponse;
import uz.verifix.jobs.api.mapper.ApplicationMapper;
import uz.verifix.jobs.api.security.SecurityUtils;
import uz.verifix.jobs.common.dto.PageResponse;
import uz.verifix.jobs.domain.entity.Application;
import uz.verifix.jobs.domain.enums.ApplicationStatus;
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
    private final WorkHistoryRepository workHistoryRepository;
    private final ApplicationMapper applicationMapper;

    @GetMapping("/vacancy/{vacancyId}")
    public ResponseEntity<PageResponse<ApplicationResponse>> getByVacancy(
            @PathVariable UUID vacancyId,
            @RequestParam(required = false) ApplicationStatus status,
            @PageableDefault(size = 20) Pageable pageable,
            Authentication auth) {

        UUID employerId = SecurityUtils.extractEmployerId(auth);
        Page<Application> page = applicationService.getByVacancy(vacancyId, employerId, status, pageable);
        return ResponseEntity.ok(PageResponse.of(page.map(applicationMapper::toResponse)));
    }

    @GetMapping("/vacancy/all")
    public ResponseEntity<PageResponse<ApplicationResponse>> getAllForEmployer(
            @RequestParam(required = false) ApplicationStatus status,
            @PageableDefault(size = 20) Pageable pageable,
            Authentication auth) {

        UUID employerId = SecurityUtils.extractEmployerId(auth);
        Page<Application> page = applicationService.getAllByEmployer(employerId, status, pageable);
        return ResponseEntity.ok(PageResponse.of(page.map(applicationMapper::toResponse)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApplicationDetailResponse> getDetail(
            @PathVariable UUID id,
            Authentication auth) {

        UUID employerId = SecurityUtils.extractEmployerId(auth);
        Application application = applicationService.getDetail(id, employerId);
        return ResponseEntity.ok(applicationMapper.toDetailResponse(
                application,
                workHistoryRepository.findByCandidateIdOrderByStartDateDesc(application.getCandidate().getId())
        ));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApplicationResponse> changeStatus(
            @PathVariable UUID id,
            @RequestParam ApplicationStatus status,
            Authentication auth) {

        UUID employerId = SecurityUtils.extractEmployerId(auth);
        Application application = applicationService.changeStatus(id, employerId, status);
        return ResponseEntity.ok(applicationMapper.toResponse(application));
    }

    @PatchMapping("/{id}/note")
    public ResponseEntity<ApplicationResponse> addNote(
            @PathVariable UUID id,
            @Valid @RequestBody RecruiterNoteRequest request,
            Authentication auth) {

        UUID employerId = SecurityUtils.extractEmployerId(auth);
        Application application = applicationService.addNote(id, employerId, request.getNote());
        return ResponseEntity.ok(applicationMapper.toResponse(application));
    }

    @PostMapping("/invite")
    public ResponseEntity<ApplicationResponse> inviteCandidate(
            @Valid @RequestBody InviteCandidateRequest request,
            Authentication auth) {

        UUID employerId = SecurityUtils.extractEmployerId(auth);
        Application application = applicationService.inviteCandidate(
                request.getVacancyId(),
                request.getCandidateId(),
                employerId,
                request.getNote());
        return ResponseEntity.ok(applicationMapper.toResponse(application));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<ApplicationResponse> reject(
            @PathVariable UUID id,
            @Valid @RequestBody RejectRequest request,
            Authentication auth) {

        UUID employerId = SecurityUtils.extractEmployerId(auth);
        Application application = applicationService.reject(id, employerId, request.getReason());
        return ResponseEntity.ok(applicationMapper.toResponse(application));
    }

    @PostMapping("/bulk-status")
    public ResponseEntity<List<ApplicationResponse>> bulkChangeStatus(
            @Valid @RequestBody BulkStatusRequest request,
            Authentication auth) {

        UUID employerId = SecurityUtils.extractEmployerId(auth);
        List<Application> applications = applicationService.bulkChangeStatus(
                request.getApplicationIds(), employerId, request.getNewStatus());
        return ResponseEntity.ok(applications.stream().map(applicationMapper::toResponse).toList());
    }

    @GetMapping("/vacancy/{vacancyId}/stats")
    public ResponseEntity<ApplicationStatsResponse> getStats(
            @PathVariable UUID vacancyId,
            Authentication auth) {

        UUID employerId = SecurityUtils.extractEmployerId(auth);
        Map<String, Long> stats = applicationService.getStatsMap(vacancyId, employerId);
        long total = stats.getOrDefault("TOTAL", 0L);
        stats.remove("TOTAL");

        return ResponseEntity.ok(ApplicationStatsResponse.builder()
                .vacancyId(vacancyId)
                .statusCounts(stats)
                .total(total)
                .build());
    }
}
