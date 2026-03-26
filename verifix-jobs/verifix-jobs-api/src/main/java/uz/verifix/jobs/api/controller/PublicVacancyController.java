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
import uz.verifix.jobs.domain.entity.Application;
import uz.verifix.jobs.domain.entity.Candidate;
import uz.verifix.jobs.domain.entity.Employer;
import uz.verifix.jobs.domain.entity.Vacancy;
import uz.verifix.jobs.domain.enums.ApplicationSource;
import uz.verifix.jobs.domain.enums.ApplicationStatus;
import uz.verifix.jobs.domain.enums.VacancyStatus;
import uz.verifix.jobs.domain.entity.CompanyReview;
import uz.verifix.jobs.domain.entity.FavoriteVacancy;
import uz.verifix.jobs.domain.repository.ApplicationRepository;
import uz.verifix.jobs.domain.repository.CompanyReviewRepository;
import uz.verifix.jobs.domain.repository.CandidateRepository;
import uz.verifix.jobs.domain.repository.EmployerRepository;
import uz.verifix.jobs.domain.repository.FavoriteVacancyRepository;
import uz.verifix.jobs.domain.repository.VacancyRepository;
import uz.verifix.jobs.service.auth.OtpService;
import uz.verifix.jobs.service.marketplace.CategoryHubService;
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
    private final EmployerRepository employerRepository;
    private final VacancyRepository vacancyRepository;
    private final CandidateRepository candidateRepository;
    private final ApplicationRepository applicationRepository;
    private final FavoriteVacancyRepository favoriteVacancyRepository;
    private final CompanyReviewRepository companyReviewRepository;
    private final OtpService otpService;

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

    @Operation(summary = "Быстрая подача заявки (без регистрации)")
    @PostMapping("/apply")
    public ResponseEntity<?> quickApply(@RequestBody Map<String, String> body) {
        String vacancyId = body.get("vacancyId");
        String phone = body.get("phone");
        String otpCode = body.get("otpCode");
        String firstName = body.get("firstName");
        String city = body.get("city");

        if (vacancyId == null || phone == null || firstName == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "vacancyId, phone, firstName majburiy"));
        }

        // Verify OTP
        if (otpCode != null && !otpCode.isBlank()) {
            boolean valid = otpService.verifyOtp(phone, otpCode);
            if (!valid) {
                return ResponseEntity.badRequest().body(Map.of("error", "OTP kod noto'g'ri"));
            }
        }

        // Find or create candidate by phone
        Candidate candidate = candidateRepository.findByPhone(phone).orElseGet(() -> {
            Candidate c = Candidate.builder()
                    .firstName(firstName)
                    .phone(phone)
                    .city(city)
                    .build();
            return candidateRepository.save(c);
        });

        // Check vacancy
        Vacancy vacancy;
        try {
            vacancy = vacancyRepository.findById(UUID.fromString(vacancyId)).orElse(null);
        } catch (Exception e) {
            vacancy = null;
        }
        if (vacancy == null || vacancy.getStatus() != VacancyStatus.ACTIVE) {
            return ResponseEntity.badRequest().body(Map.of("error", "Vakansiya topilmadi"));
        }

        // Check duplicate
        if (applicationRepository.existsByVacancyIdAndCandidateId(vacancy.getId(), candidate.getId())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Siz allaqachon ariza topshirgansiz"));
        }

        // Create application
        Application application = Application.builder()
                .vacancy(vacancy)
                .candidate(candidate)
                .status(ApplicationStatus.NEW)
                .source(ApplicationSource.WEB)
                .appliedAt(java.time.Instant.now())
                .build();
        applicationRepository.save(application);

        return ResponseEntity.ok(Map.of("success", true,
                "applicationId", application.getId().toString(),
                "candidateId", candidate.getId().toString()));
    }

    // --- Favorites (server-side, by candidateId) ---

    @Operation(summary = "Получить избранные вакансии кандидата")
    @GetMapping("/favorites")
    public ResponseEntity<?> getFavorites(@RequestParam String candidateId,
                                          @RequestParam(defaultValue = "0") int page,
                                          @RequestParam(defaultValue = "20") int size) {
        try {
            UUID cid = UUID.fromString(candidateId);
            Page<FavoriteVacancy> favs = favoriteVacancyRepository.findByCandidateIdOrderByCreatedAtDesc(cid, PageRequest.of(page, size));
            List<Map<String, Object>> result = favs.getContent().stream().map(fav -> {
                Vacancy v = vacancyRepository.findById(fav.getVacancyId()).orElse(null);
                if (v == null) return null;
                return Map.<String, Object>of(
                        "id", v.getId().toString(),
                        "title", v.getTitle(),
                        "city", v.getCity() != null ? v.getCity() : "",
                        "salaryFrom", v.getSalaryFrom() != null ? v.getSalaryFrom() : 0,
                        "salaryTo", v.getSalaryTo() != null ? v.getSalaryTo() : 0,
                        "employerName", v.getEmployer() != null ? v.getEmployer().getName() : "",
                        "slug", v.getSlug() != null ? v.getSlug() : v.getId().toString()
                );
            }).filter(java.util.Objects::nonNull).toList();
            return ResponseEntity.ok(Map.of("content", result, "totalElements", favs.getTotalElements()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Noto'g'ri candidateId"));
        }
    }

    @Operation(summary = "Добавить в избранное")
    @PostMapping("/favorites")
    public ResponseEntity<?> addFavorite(@RequestBody Map<String, String> body) {
        try {
            UUID candidateId = UUID.fromString(body.get("candidateId"));
            UUID vacancyId = UUID.fromString(body.get("vacancyId"));
            if (favoriteVacancyRepository.existsByCandidateIdAndVacancyId(candidateId, vacancyId)) {
                return ResponseEntity.ok(Map.of("status", "already_exists"));
            }
            FavoriteVacancy fav = FavoriteVacancy.builder().candidateId(candidateId).vacancyId(vacancyId).build();
            favoriteVacancyRepository.save(fav);
            return ResponseEntity.ok(Map.of("status", "added"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Noto'g'ri ma'lumot"));
        }
    }

    @Operation(summary = "Удалить из избранного")
    @DeleteMapping("/favorites")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> removeFavorite(@RequestParam String candidateId, @RequestParam String vacancyId) {
        try {
            favoriteVacancyRepository.deleteByCandidateIdAndVacancyId(
                    UUID.fromString(candidateId), UUID.fromString(vacancyId));
            return ResponseEntity.ok(Map.of("status", "removed"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Noto'g'ri ma'lumot"));
        }
    }

    // --- Company Reviews ---

    @Operation(summary = "Отзывы о компании")
    @GetMapping("/companies/{slug}/reviews")
    public ResponseEntity<?> getReviews(@PathVariable String slug,
                                        @RequestParam(defaultValue = "0") int page,
                                        @RequestParam(defaultValue = "10") int size) {
        var employer = employerRepository.findBySlug(slug)
                .or(() -> { try { return employerRepository.findById(UUID.fromString(slug)); } catch (Exception e) { return java.util.Optional.empty(); } })
                .orElse(null);
        if (employer == null) return ResponseEntity.notFound().build();

        var reviews = companyReviewRepository.findByEmployerIdAndStatusOrderByCreatedAtDesc(
                employer.getId(), "PUBLISHED", PageRequest.of(page, size));
        Double avg = companyReviewRepository.getAverageRating(employer.getId());
        long count = companyReviewRepository.countByEmployer(employer.getId());

        return ResponseEntity.ok(Map.of(
                "reviews", reviews.getContent(),
                "totalElements", reviews.getTotalElements(),
                "averageRating", avg != null ? Math.round(avg * 10) / 10.0 : 0,
                "totalReviews", count
        ));
    }

    @Operation(summary = "Оставить отзыв")
    @PostMapping("/companies/{slug}/reviews")
    public ResponseEntity<?> addReview(@PathVariable String slug, @RequestBody Map<String, Object> body) {
        var employer = employerRepository.findBySlug(slug)
                .or(() -> { try { return employerRepository.findById(UUID.fromString(slug)); } catch (Exception e) { return java.util.Optional.empty(); } })
                .orElse(null);
        if (employer == null) return ResponseEntity.notFound().build();

        String authorName = (String) body.getOrDefault("authorName", "Anonim");
        Integer rating = body.get("rating") != null ? ((Number) body.get("rating")).intValue() : 5;
        String pros = (String) body.get("pros");
        String cons = (String) body.get("cons");
        String title = (String) body.get("title");

        if (rating < 1 || rating > 5) return ResponseEntity.badRequest().body(Map.of("error", "Rating 1-5 orasida bo'lishi kerak"));

        CompanyReview review = CompanyReview.builder()
                .employerId(employer.getId())
                .authorName(authorName)
                .rating(rating)
                .title(title)
                .pros(pros)
                .cons(cons)
                .isAnonymous(Boolean.TRUE.equals(body.get("isAnonymous")))
                .build();
        companyReviewRepository.save(review);
        return ResponseEntity.ok(Map.of("success", true, "reviewId", review.getId().toString()));
    }
}
