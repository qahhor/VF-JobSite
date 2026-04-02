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
import uz.verifix.jobs.api.mapper.VacancyMapper;
import uz.verifix.jobs.api.security.SecurityUtils;
import uz.verifix.jobs.common.dto.PageResponse;
import uz.verifix.jobs.domain.entity.Vacancy;
import uz.verifix.jobs.domain.enums.VacancyStatus;
import uz.verifix.jobs.service.vacancy.VacancyService;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/vacancies")
@RequiredArgsConstructor
public class VacancyController {

    private final VacancyService vacancyService;
    private final VacancyMapper vacancyMapper;
    private final uz.verifix.jobs.domain.repository.VacancyRepository vacancyRepository;

    @PostMapping
    public ResponseEntity<VacancyResponse> create(
            @Valid @RequestBody VacancyCreateRequest request,
            Authentication auth) {
        UUID employerId = SecurityUtils.extractEmployerId(auth);

        Vacancy vacancy = vacancyService.create(
                employerId,
                request.getTitle(),
                request.getDescription(),
                request.getCategory(),
                request.getCity(),
                request.getRegion(),
                request.getLatitude(),
                request.getLongitude(),
                request.getSalaryFrom(),
                request.getSalaryTo(),
                request.getCurrency(),
                request.getEmploymentType(),
                request.getShiftSchedule(),
                request.getBenefits(),
                request.getIsMassHiring(),
                request.getPositionsCount(),
                request.getExpiresAt()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(vacancyMapper.toResponse(vacancy));
    }

    @GetMapping("/{id}")
    public ResponseEntity<VacancyResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(vacancyMapper.toResponse(vacancyService.getById(id)));
    }

    @GetMapping
    public ResponseEntity<PageResponse<VacancyResponse>> search(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) BigDecimal salaryFrom,
            @RequestParam(required = false) BigDecimal salaryTo,
            @PageableDefault(size = 20) Pageable pageable) {

        Page<Vacancy> page = vacancyService.search(city, category, salaryFrom, salaryTo, pageable);
        Page<VacancyResponse> responsePage = page.map(vacancyMapper::toResponse);
        return ResponseEntity.ok(PageResponse.of(responsePage));
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<VacancyResponse>> findNearby(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam(defaultValue = "10") double radiusKm) {
        List<VacancyResponse> vacancies = vacancyService.findNearby(lat, lon, radiusKm)
                .stream()
                .map(vacancyMapper::toResponse)
                .toList();
        return ResponseEntity.ok(vacancies);
    }

    @GetMapping("/employer")
    public ResponseEntity<PageResponse<VacancyResponse>> getByEmployer(
            Authentication auth,
            @PageableDefault(size = 20) Pageable pageable) {
        UUID employerId = SecurityUtils.extractEmployerId(auth);
        Page<Vacancy> page = vacancyService.findByEmployer(employerId, pageable);
        return ResponseEntity.ok(PageResponse.of(page.map(vacancyMapper::toResponse)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<VacancyResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody VacancyCreateRequest request,
            Authentication auth) {
        UUID employerId = SecurityUtils.extractEmployerId(auth);
        Vacancy vacancy = vacancyService.update(id, employerId,
                request.getTitle(), request.getDescription(),
                request.getCategory(), request.getCity(),
                request.getRegion(), request.getLatitude(), request.getLongitude(),
                request.getSalaryFrom(), request.getSalaryTo(), request.getCurrency(),
                request.getEmploymentType(), request.getShiftSchedule(), request.getBenefits(),
                request.getIsMassHiring(), request.getPositionsCount(), request.getExpiresAt());
        return ResponseEntity.ok(vacancyMapper.toResponse(vacancy));
    }

    @PostMapping("/{id}/publish")
    public ResponseEntity<VacancyResponse> publish(@PathVariable UUID id, Authentication auth) {
        UUID employerId = SecurityUtils.extractEmployerId(auth);
        Vacancy vacancy = vacancyService.changeStatus(id, employerId, VacancyStatus.ACTIVE);
        return ResponseEntity.ok(vacancyMapper.toResponse(vacancy));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<VacancyResponse> changeStatus(
            @PathVariable UUID id,
            @RequestParam VacancyStatus status,
            Authentication auth) {
        UUID employerId = SecurityUtils.extractEmployerId(auth);
        Vacancy vacancy = vacancyService.changeStatus(id, employerId, status);
        return ResponseEntity.ok(vacancyMapper.toResponse(vacancy));
    }

    @PostMapping("/{id}/bump")
    public ResponseEntity<VacancyResponse> bump(@PathVariable UUID id, Authentication auth) {
        UUID employerId = SecurityUtils.extractEmployerId(auth);
        Vacancy vacancy = vacancyService.getById(id);
        if (!vacancy.getEmployer().getId().equals(employerId)) {
            return ResponseEntity.status(403).build();
        }
        vacancy.setUpdatedAt(java.time.Instant.now());
        vacancy = vacancyRepository.save(vacancy);
        return ResponseEntity.ok(vacancyMapper.toResponse(vacancy));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id, Authentication auth) {
        UUID employerId = SecurityUtils.extractEmployerId(auth);
        vacancyService.softDelete(id, employerId);
        return ResponseEntity.noContent().build();
    }
}
