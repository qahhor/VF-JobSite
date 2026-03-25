package uz.verifix.jobs.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uz.verifix.jobs.common.dto.PageResponse;
import uz.verifix.jobs.domain.entity.Vacancy;
import uz.verifix.jobs.service.marketplace.PublicVacancyService;

import java.math.BigDecimal;
import java.util.UUID;

@Tag(name = "Public Marketplace", description = "Публичный API вакансий — без аутентификации")
@RestController
@RequestMapping("/api/v1/public")
@RequiredArgsConstructor
public class PublicVacancyController {

    private final PublicVacancyService publicVacancyService;

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
}
