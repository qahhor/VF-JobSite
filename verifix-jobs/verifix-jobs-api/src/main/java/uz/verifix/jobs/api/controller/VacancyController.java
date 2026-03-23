package uz.verifix.jobs.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import uz.verifix.jobs.api.dto.request.VacancyCreateRequest;
import uz.verifix.jobs.api.dto.response.VacancyResponse;
import uz.verifix.jobs.api.security.SecurityUtils;
import uz.verifix.jobs.common.dto.PageResponse;
import uz.verifix.jobs.domain.entity.Vacancy;
import uz.verifix.jobs.domain.enums.VacancyStatus;
import uz.verifix.jobs.domain.repository.ManagerRepository;
import uz.verifix.jobs.service.vacancy.VacancyService;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/vacancies")
@RequiredArgsConstructor
public class VacancyController {

    private final VacancyService vacancyService;
    private final ManagerRepository managerRepository;

    @PostMapping
    public ResponseEntity<VacancyResponse> create(
            @Valid @RequestBody VacancyCreateRequest request,
            Authentication auth) {
        UUID employerId = getEmployerId(auth);

        Vacancy vacancy = vacancyService.create(employerId,
                request.getTitle(), request.getDescription(), request.getCategory(),
                request.getCity(), request.getRegion(), request.getLatitude(), request.getLongitude(),
                request.getSalaryFrom(), request.getSalaryTo(), request.getCurrency(),
                request.getEmploymentType(), request.getShiftSchedule(),
                request.getBenefits(), request.getIsMassHiring(), request.getPositionsCount());

        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(vacancy));
    }

    @GetMapping("/{id}")
    public ResponseEntity<VacancyResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(toResponse(vacancyService.getById(id)));
    }

    @GetMapping
    public ResponseEntity<PageResponse<VacancyResponse>> search(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) BigDecimal salaryFrom,
            @RequestParam(required = false) BigDecimal salaryTo,
            @PageableDefault(size = 20) Pageable pageable) {

        Page<Vacancy> page = vacancyService.search(city, category, salaryFrom, salaryTo, pageable);
        Page<VacancyResponse> responsePage = page.map(this::toResponse);
        return ResponseEntity.ok(PageResponse.of(responsePage));
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<VacancyResponse>> findNearby(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam(defaultValue = "10") double radiusKm) {
        List<VacancyResponse> vacancies = vacancyService.findNearby(lat, lon, radiusKm)
                .stream().map(this::toResponse).toList();
        return ResponseEntity.ok(vacancies);
    }

    @GetMapping("/employer")
    public ResponseEntity<PageResponse<VacancyResponse>> getByEmployer(
            Authentication auth,
            @PageableDefault(size = 20) Pageable pageable) {
        UUID employerId = getEmployerId(auth);
        Page<Vacancy> page = vacancyService.findByEmployer(employerId, pageable);
        return ResponseEntity.ok(PageResponse.of(page.map(this::toResponse)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<VacancyResponse> changeStatus(
            @PathVariable UUID id,
            @RequestParam VacancyStatus status,
            Authentication auth) {
        UUID employerId = getEmployerId(auth);
        Vacancy vacancy = vacancyService.changeStatus(id, employerId, status);
        return ResponseEntity.ok(toResponse(vacancy));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id, Authentication auth) {
        UUID employerId = getEmployerId(auth);
        vacancyService.softDelete(id, employerId);
        return ResponseEntity.noContent().build();
    }

    private UUID getEmployerId(Authentication auth) {
        return SecurityUtils.extractEmployerId(auth, managerRepository);
    }

    private VacancyResponse toResponse(Vacancy v) {
        return VacancyResponse.builder()
                .id(v.getId())
                .employerId(v.getEmployer().getId())
                .employerName(v.getEmployer().getName())
                .title(v.getTitle())
                .description(v.getDescription())
                .category(v.getCategory())
                .city(v.getCity())
                .region(v.getRegion())
                .latitude(v.getLocation() != null ? v.getLocation().getY() : null)
                .longitude(v.getLocation() != null ? v.getLocation().getX() : null)
                .salaryFrom(v.getSalaryFrom())
                .salaryTo(v.getSalaryTo())
                .currency(v.getCurrency())
                .employmentType(v.getEmploymentType() != null ? v.getEmploymentType().name() : null)
                .shiftSchedule(v.getShiftSchedule() != null ? v.getShiftSchedule().name() : null)
                .benefits(v.getBenefits() != null ? Arrays.asList(v.getBenefits()) : null)
                .status(v.getStatus().name())
                .moderationStatus(v.getModerationStatus().name())
                .isMassHiring(v.getIsMassHiring())
                .positionsCount(v.getPositionsCount())
                .positionsFilled(v.getPositionsFilled())
                .expiresAt(v.getExpiresAt())
                .createdAt(v.getCreatedAt())
                .updatedAt(v.getUpdatedAt())
                .build();
    }
}
