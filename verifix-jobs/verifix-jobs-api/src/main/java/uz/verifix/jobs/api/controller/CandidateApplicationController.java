package uz.verifix.jobs.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import uz.verifix.jobs.api.security.SecurityUtils;
import uz.verifix.jobs.common.dto.PageResponse;
import uz.verifix.jobs.domain.entity.Application;
import uz.verifix.jobs.domain.entity.Candidate;
import uz.verifix.jobs.domain.entity.Vacancy;
import uz.verifix.jobs.domain.enums.ApplicationSource;
import uz.verifix.jobs.domain.enums.ApplicationStatus;
import uz.verifix.jobs.domain.enums.VacancyStatus;
import uz.verifix.jobs.domain.repository.ApplicationRepository;
import uz.verifix.jobs.domain.repository.CandidateRepository;
import uz.verifix.jobs.domain.repository.VacancyRepository;
import uz.verifix.jobs.service.notification.DomainEvent;
import uz.verifix.jobs.service.notification.EventPublisher;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

/**
 * Candidate-facing REST API — apply to vacancies, view applications, manage profile.
 * Requires candidate authentication (JWT from OTP login).
 */
@RestController
@RequestMapping("/api/v1/candidates")
@RequiredArgsConstructor
public class CandidateApplicationController {

    private final ApplicationRepository applicationRepository;
    private final VacancyRepository vacancyRepository;
    private final CandidateRepository candidateRepository;
    private final EventPublisher eventPublisher;

    /**
     * Apply to a vacancy.
     * POST /api/v1/candidates/apply
     */
    @PostMapping("/apply")
    public ResponseEntity<?> apply(Authentication auth, @RequestBody Map<String, String> body) {
        UUID candidateId = SecurityUtils.extractUserId(auth);
        UUID vacancyId = UUID.fromString(body.get("vacancyId"));

        Vacancy vacancy = vacancyRepository.findById(vacancyId).orElse(null);
        if (vacancy == null || vacancy.getStatus() != VacancyStatus.ACTIVE) {
            return ResponseEntity.badRequest().body(Map.of("error", "Vakansiya topilmadi yoki faol emas"));
        }

        if (applicationRepository.existsByVacancyIdAndCandidateId(vacancyId, candidateId)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Siz allaqachon ariza topshirgansiz"));
        }

        Candidate candidate = candidateRepository.findById(candidateId).orElse(null);
        if (candidate == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Nomzod topilmadi"));
        }

        Application application = Application.builder()
                .vacancy(vacancy)
                .candidate(candidate)
                .status(ApplicationStatus.NEW)
                .source(ApplicationSource.WEB)
                .appliedAt(Instant.now())
                .build();

        // Branch selection
        if (body.containsKey("branchName")) {
            application.setRecruiterNotes("Tanlangan filial: " + body.get("branchName"));
        }

        application = applicationRepository.save(application);

        // Update vacancy apply count
        vacancy.setApplyCount(vacancy.getApplyCount() != null ? vacancy.getApplyCount() + 1 : 1);
        vacancyRepository.save(vacancy);

        eventPublisher.publish(DomainEvent.APPLICATION_NEW, application.getId(), "APPLICATION", candidateId,
                Map.of("applicationId", application.getId().toString(), "candidateId", candidateId.toString(),
                        "vacancyId", vacancyId.toString(), "vacancyTitle", vacancy.getTitle(),
                        "employerId", vacancy.getEmployer().getId().toString(),
                        "candidateName", candidate.getFirstName() != null ? candidate.getFirstName() : ""));


        return ResponseEntity.ok(Map.of(
                "applicationId", application.getId().toString(),
                "status", "NEW",
                "message", "Ariza muvaffaqiyatli topshirildi!"
        ));
    }

    /**
     * Get my applications.
     * GET /api/v1/candidates/applications
     */
    @GetMapping("/applications")
    public ResponseEntity<PageResponse<Application>> getMyApplications(
            Authentication auth,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20) Pageable pageable) {
        UUID candidateId = SecurityUtils.extractUserId(auth);
        Page<Application> page;
        if (status != null) {
            page = applicationRepository.findByCandidateIdAndStatus(candidateId,
                    ApplicationStatus.valueOf(status), pageable);
        } else {
            page = applicationRepository.findByCandidateIdOrderByAppliedAtDesc(candidateId, pageable);
        }
        return ResponseEntity.ok(PageResponse.of(page));
    }

    /**
     * Withdraw an application.
     * POST /api/v1/candidates/applications/{id}/withdraw
     */
    @PostMapping("/applications/{applicationId}/withdraw")
    public ResponseEntity<?> withdrawApplication(Authentication auth, @PathVariable UUID applicationId) {
        UUID candidateId = SecurityUtils.extractUserId(auth);
        Application application = applicationRepository.findById(applicationId).orElse(null);
        if (application == null || !application.getCandidate().getId().equals(candidateId)) {
            return ResponseEntity.notFound().build();
        }
        if (application.getStatus() == ApplicationStatus.HIRED ||
            application.getStatus() == ApplicationStatus.REJECTED ||
            application.getStatus() == ApplicationStatus.WITHDRAWN) {
            return ResponseEntity.badRequest().body(Map.of("error", "Bu arizani qaytarib bo'lmaydi"));
        }
        application.setStatus(ApplicationStatus.WITHDRAWN);
        applicationRepository.save(application);
        return ResponseEntity.ok(Map.of("status", "WITHDRAWN"));
    }
}
