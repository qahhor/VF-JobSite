package uz.verifix.jobs.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uz.verifix.jobs.common.dto.PageResponse;
import uz.verifix.jobs.domain.entity.Employer;
import uz.verifix.jobs.domain.entity.Vacancy;
import uz.verifix.jobs.domain.enums.VacancyStatus;
import uz.verifix.jobs.domain.repository.EmployerRepository;
import uz.verifix.jobs.domain.repository.VacancyRepository;
import uz.verifix.jobs.service.marketplace.CategoryHubService;
import uz.verifix.jobs.service.marketplace.CityHubService;
import uz.verifix.jobs.service.marketplace.PublicVacancyService;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Tag(name = "Public Marketplace", description = "Публичный API вакансий — без аутентификации")
@RestController
@RequestMapping("/api/v1/public")
@RequiredArgsConstructor
public class PublicVacancyController {

    private final PublicVacancyService publicVacancyService;
    private final CategoryHubService categoryHubService;
    private final CityHubService cityHubService;
    private final EmployerRepository employerRepository;
    private final VacancyRepository vacancyRepository;

    @Operation(summary = "Поиск вакансий", description = "Фильтрация по городу, категории, зарплате, типу занятости и текстовому запросу")
    @ApiResponse(responseCode = "200", description = "Страница с вакансиями")
    @GetMapping("/vacancies")
    public ResponseEntity<PageResponse<Vacancy>> listVacancies(
            @Parameter(description = "Город (напр. Tashkent)") @RequestParam(required = false) String city,
            @Parameter(description = "Категория (напр. COOK, DRIVER)") @RequestParam(required = false) String category,
            @Parameter(description = "Минимальная зарплата (UZS)") @RequestParam(required = false) BigDecimal salaryMin,
            @Parameter(description = "Тип занятости: FULL_TIME, PART_TIME, CONTRACT, TEMPORARY") @RequestParam(required = false) String employmentType,
            @Parameter(description = "Текстовый поиск по названию и описанию") @RequestParam(required = false) String q,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(PageResponse.of(
                publicVacancyService.listActiveVacancies(city, category, salaryMin, employmentType, q, pageable)));
    }

    @Operation(summary = "Детали вакансии", description = "Получение вакансии по SEO slug или UUID")
    @ApiResponse(responseCode = "200", description = "Вакансия найдена")
    @ApiResponse(responseCode = "404", description = "Вакансия не найдена")
    @GetMapping("/vacancies/{slug}")
    public ResponseEntity<Vacancy> getVacancy(
            @Parameter(description = "SEO slug или UUID вакансии") @PathVariable String slug) {
        Vacancy vacancy = publicVacancyService.getBySlug(slug);
        if (vacancy == null) {
            try { vacancy = publicVacancyService.getById(UUID.fromString(slug)); } catch (Exception ignored) {}
        }
        return vacancy != null ? ResponseEntity.ok(vacancy) : ResponseEntity.notFound().build();
    }

    @Operation(summary = "Вакансии по категории", description = "Все активные вакансии в указанной категории")
    @GetMapping("/vacancies/category/{category}")
    public ResponseEntity<PageResponse<Vacancy>> byCategory(
            @Parameter(description = "Код категории: COOK, DRIVER, SALES и т.д.") @PathVariable String category,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(PageResponse.of(publicVacancyService.getByCategory(category, pageable)));
    }

    @Operation(summary = "Вакансии по городу", description = "Все активные вакансии в указанном городе")
    @GetMapping("/vacancies/city/{city}")
    public ResponseEntity<PageResponse<Vacancy>> byCity(
            @Parameter(description = "Название города") @PathVariable String city,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(PageResponse.of(publicVacancyService.getByCity(city, pageable)));
    }

    @Operation(summary = "Статистика платформы")
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> stats() {
        var categories = categoryHubService.getCategories();
        long totalVacancies = categories.stream().mapToLong(CategoryHubService.CategoryHub::vacancyCount).sum();
        long totalEmployers = employerRepository.count();
        return ResponseEntity.ok(Map.of(
                "totalVacancies", totalVacancies,
                "totalEmployers", totalEmployers,
                "totalHired", Math.round(totalVacancies * 0.05)
        ));
    }

    @Operation(summary = "Категории с количеством вакансий")
    @GetMapping("/categories")
    public ResponseEntity<List<CategoryHubService.CategoryHub>> categories() {
        return ResponseEntity.ok(categoryHubService.getCategories());
    }

    @Operation(summary = "Города с количеством вакансий")
    @GetMapping("/cities")
    public ResponseEntity<List<CityHubService.CityHub>> cities() {
        return ResponseEntity.ok(cityHubService.getCities());
    }

    @Operation(summary = "Список компаний")
    @GetMapping("/companies")
    public ResponseEntity<PageResponse<Employer>> companies(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String industry,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Page<Employer> result;
        Pageable pageable = PageRequest.of(page, size);
        if (q != null && !q.isBlank()) {
            result = employerRepository.findByNameContainingIgnoreCase(q, pageable);
        } else {
            result = employerRepository.findAll(pageable);
        }
        return ResponseEntity.ok(PageResponse.of(result));
    }

    @Operation(summary = "Детали компании")
    @GetMapping("/companies/{slug}")
    public ResponseEntity<Employer> company(@PathVariable String slug) {
        return employerRepository.findBySlug(slug)
                .or(() -> { try { return employerRepository.findById(UUID.fromString(slug)); } catch (Exception e) { return java.util.Optional.empty(); } })
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Вакансии компании")
    @GetMapping("/companies/{slug}/vacancies")
    public ResponseEntity<PageResponse<Vacancy>> companyVacancies(
            @PathVariable String slug,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        var employer = employerRepository.findBySlug(slug)
                .or(() -> { try { return employerRepository.findById(UUID.fromString(slug)); } catch (Exception e) { return java.util.Optional.empty(); } })
                .orElse(null);
        if (employer == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(PageResponse.of(
                vacancyRepository.findByEmployerIdAndStatus(employer.getId(), VacancyStatus.ACTIVE, PageRequest.of(page, size))));
    }
}
