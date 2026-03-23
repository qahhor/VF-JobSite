package uz.verifix.jobs.telegram.miniapp;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uz.verifix.jobs.common.dto.PageResponse;
import uz.verifix.jobs.domain.entity.Vacancy;
import uz.verifix.jobs.domain.enums.ApplicationSource;
import uz.verifix.jobs.domain.enums.ApplicationStatus;
import uz.verifix.jobs.domain.entity.Application;
import uz.verifix.jobs.domain.entity.Candidate;
import uz.verifix.jobs.domain.repository.ApplicationRepository;
import uz.verifix.jobs.domain.repository.CandidateRepository;
import uz.verifix.jobs.domain.repository.VacancyRepository;
import uz.verifix.jobs.service.vacancy.VacancyService;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/miniapp")
@RequiredArgsConstructor
public class MiniAppController {

    private final MiniAppAuthService miniAppAuthService;
    private final VacancyService vacancyService;
    private final CandidateRepository candidateRepository;
    private final VacancyRepository vacancyRepository;
    private final ApplicationRepository applicationRepository;

    @PostMapping("/auth")
    public ResponseEntity<Map<String, Object>> authenticate(@RequestBody Map<String, String> body) {
        String initData = body.get("initData");
        MiniAppAuthService.AuthResult result = miniAppAuthService.authenticate(initData);

        if (!result.success()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", result.error()));
        }

        return ResponseEntity.ok(Map.of(
                "token", result.token(),
                "candidateId", result.candidateId().toString(),
                "firstName", result.firstName() != null ? result.firstName() : ""
        ));
    }

    @GetMapping("/vacancies")
    public ResponseEntity<PageResponse<?>> getVacancies(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String category) {

        Page<Vacancy> vacancies = vacancyService.search(city, category, null, null, PageRequest.of(page, size));

        Page<Map<String, Object>> mapped = vacancies.map(v -> Map.<String, Object>of(
                "id", v.getId().toString(),
                "title", v.getTitle(),
                "employerName", v.getEmployer().getName(),
                "city", v.getCity() != null ? v.getCity() : "",
                "salaryFrom", v.getSalaryFrom() != null ? v.getSalaryFrom().toString() : "",
                "salaryTo", v.getSalaryTo() != null ? v.getSalaryTo().toString() : "",
                "employmentType", v.getEmploymentType() != null ? v.getEmploymentType().name() : ""
        ));

        return ResponseEntity.ok(PageResponse.of(mapped));
    }

    @PostMapping("/vacancies/{id}/apply")
    public ResponseEntity<Map<String, Object>> quickApply(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {

        String candidateIdStr = body.get("candidateId");
        if (candidateIdStr == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "candidateId required"));
        }

        UUID candidateId = UUID.fromString(candidateIdStr);
        Candidate candidate = candidateRepository.findById(candidateId).orElse(null);
        Vacancy vacancy = vacancyRepository.findById(id).orElse(null);

        if (candidate == null || vacancy == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Not found"));
        }

        if (applicationRepository.existsByVacancyIdAndCandidateId(id, candidateId)) {
            return ResponseEntity.ok(Map.of("status", "already_applied"));
        }

        Application application = Application.builder()
                .vacancy(vacancy)
                .candidate(candidate)
                .status(ApplicationStatus.NEW)
                .source(ApplicationSource.TELEGRAM)
                .appliedAt(Instant.now())
                .build();
        applicationRepository.save(application);

        return ResponseEntity.ok(Map.of("status", "applied", "applicationId", application.getId().toString()));
    }

    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getProfile(@RequestParam UUID candidateId) {
        Candidate c = candidateRepository.findById(candidateId).orElse(null);
        if (c == null) return ResponseEntity.notFound().build();

        return ResponseEntity.ok(Map.of(
                "id", c.getId().toString(),
                "firstName", c.getFirstName() != null ? c.getFirstName() : "",
                "lastName", c.getLastName() != null ? c.getLastName() : "",
                "phone", c.getPhone(),
                "city", c.getCity() != null ? c.getCity() : "",
                "skills", c.getSkills() != null ? c.getSkills() : new String[0]
        ));
    }

    @PutMapping("/profile")
    public ResponseEntity<Map<String, String>> updateProfile(@RequestBody Map<String, Object> body) {
        String candidateIdStr = (String) body.get("candidateId");
        if (candidateIdStr == null) return ResponseEntity.badRequest().body(Map.of("error", "candidateId required"));

        Candidate c = candidateRepository.findById(UUID.fromString(candidateIdStr)).orElse(null);
        if (c == null) return ResponseEntity.notFound().build();

        if (body.containsKey("city")) c.setCity((String) body.get("city"));
        if (body.containsKey("firstName")) c.setFirstName((String) body.get("firstName"));
        if (body.containsKey("lastName")) c.setLastName((String) body.get("lastName"));

        candidateRepository.save(c);
        return ResponseEntity.ok(Map.of("status", "updated"));
    }
}
