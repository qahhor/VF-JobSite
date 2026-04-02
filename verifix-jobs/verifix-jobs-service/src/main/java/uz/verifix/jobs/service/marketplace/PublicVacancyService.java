package uz.verifix.jobs.service.marketplace;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.verifix.jobs.common.util.SlugUtils;
import uz.verifix.jobs.domain.entity.FavoriteVacancy;
import uz.verifix.jobs.domain.entity.Vacancy;
import uz.verifix.jobs.domain.enums.EmploymentType;
import uz.verifix.jobs.domain.enums.ModerationStatus;
import uz.verifix.jobs.domain.enums.ShiftSchedule;
import uz.verifix.jobs.domain.enums.VacancyStatus;
import uz.verifix.jobs.domain.repository.FavoriteVacancyRepository;
import uz.verifix.jobs.domain.repository.VacancyRepository;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Public-facing vacancy service for the marketplace.
 * No authentication required. SEO-friendly slugs. View counting.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PublicVacancyService {

    private final VacancyRepository vacancyRepository;
    private final FavoriteVacancyRepository favoriteRepository;

    @Transactional(readOnly = true)
    public Page<Vacancy> listActiveVacancies(String city, String category, BigDecimal salaryMin,
                                             BigDecimal salaryMax, String employmentType, String shiftSchedule,
                                             List<String> benefits, boolean verifiedOnly,
                                             String queryText, String sort, Pageable pageable) {
        Specification<Vacancy> specification = publiclyVisible()
                .and(matchesCity(city))
                .and(matchesCategory(category))
                .and(matchesSalaryMin(salaryMin))
                .and(matchesSalaryMax(salaryMax))
                .and(matchesEmploymentType(employmentType))
                .and(matchesShiftSchedule(shiftSchedule))
                .and(matchesBenefits(benefits))
                .and(matchesEmployerVerification(verifiedOnly))
                .and(matchesQuery(queryText));

        Page<Vacancy> page = vacancyRepository.findAll(specification, applySort(pageable, sort, queryText));
        page.getContent().forEach(this::initializePublicVacancy);
        return page;
    }

    @Transactional(readOnly = true)
    public Page<Vacancy> listActiveVacancies(String city, String category, BigDecimal salaryMin,
                                             String employmentType, String queryText, Pageable pageable) {
        return listActiveVacancies(
                city,
                category,
                salaryMin,
                null,
                employmentType,
                null,
                List.of(),
                false,
                queryText,
                "date_desc",
                pageable
        );
    }

    @Transactional
    public Vacancy getBySlug(String slug) {
        Vacancy vacancy = vacancyRepository.findBySlugAndStatus(slug, VacancyStatus.ACTIVE);
        if (vacancy != null) {
            vacancy.setViewCount(vacancy.getViewCount() != null ? vacancy.getViewCount() + 1 : 1);
            vacancyRepository.save(vacancy);
            initializePublicVacancy(vacancy);
        }
        return vacancy;
    }

    @Transactional
    public Vacancy getById(UUID id) {
        Vacancy vacancy = vacancyRepository.findByIdAndStatus(id, VacancyStatus.ACTIVE).orElse(null);
        initializePublicVacancy(vacancy);
        return vacancy;
    }

    public String generateSlug(Vacancy vacancy) {
        String base = SlugUtils.toSlug(vacancy.getTitle());
        String city = vacancy.getCity() != null ? SlugUtils.toSlug(vacancy.getCity()) : "";
        String slug = base + (city.isEmpty() ? "" : "-" + city) + "-" + vacancy.getId().toString().substring(0, 8);
        return slug;
    }

    @Transactional(readOnly = true)
    public Page<Vacancy> getByCategory(String category, Pageable pageable) {
        Page<Vacancy> page = vacancyRepository.findByCategoryAndStatus(category, VacancyStatus.ACTIVE, pageable);
        page.getContent().forEach(this::initializePublicVacancy);
        return page;
    }

    @Transactional(readOnly = true)
    public Page<Vacancy> getByCity(String city, Pageable pageable) {
        Page<Vacancy> page = vacancyRepository.findByCityAndStatus(city, VacancyStatus.ACTIVE, pageable);
        page.getContent().forEach(this::initializePublicVacancy);
        return page;
    }

    public void initializePublicVacancy(Vacancy vacancy) {
        if (vacancy == null) {
            return;
        }
        if (vacancy.getBenefits() != null) {
            vacancy.getBenefits().clone();
        }
        if (vacancy.getEmployer() != null) {
            vacancy.getEmployer().getId();
            vacancy.getEmployer().getName();
            vacancy.getEmployer().getSlug();
            vacancy.getEmployer().getIsVerified();
        }
    }

    // Favorites
    @Transactional
    public void addFavorite(UUID candidateId, UUID vacancyId) {
        if (!favoriteRepository.existsByCandidateIdAndVacancyId(candidateId, vacancyId)) {
            favoriteRepository.save(FavoriteVacancy.builder()
                    .candidateId(candidateId).vacancyId(vacancyId).build());
        }
    }

    @Transactional
    public void removeFavorite(UUID candidateId, UUID vacancyId) {
        favoriteRepository.deleteByCandidateIdAndVacancyId(candidateId, vacancyId);
    }

    @Transactional(readOnly = true)
    public Page<FavoriteVacancy> getFavorites(UUID candidateId, Pageable pageable) {
        return favoriteRepository.findByCandidateIdOrderByCreatedAtDesc(candidateId, pageable);
    }

    @Transactional(readOnly = true)
    public boolean isFavorite(UUID candidateId, UUID vacancyId) {
        return favoriteRepository.existsByCandidateIdAndVacancyId(candidateId, vacancyId);
    }

    private Specification<Vacancy> publiclyVisible() {
        return (root, query, cb) -> cb.and(
                cb.equal(root.get("status"), VacancyStatus.ACTIVE),
                cb.equal(root.get("moderationStatus"), ModerationStatus.APPROVED)
        );
    }

    private Specification<Vacancy> matchesCity(String city) {
        if (city == null || city.isBlank()) {
            return null;
        }
        return (root, query, cb) ->
                cb.like(cb.lower(root.get("city")), "%" + city.trim().toLowerCase() + "%");
    }

    private Specification<Vacancy> matchesCategory(String category) {
        if (category == null || category.isBlank()) {
            return null;
        }
        return (root, query, cb) -> cb.equal(root.get("category"), category.trim().toUpperCase());
    }

    private Specification<Vacancy> matchesSalaryMin(BigDecimal salaryMin) {
        if (salaryMin == null) {
            return null;
        }
        return (root, query, cb) -> cb.greaterThanOrEqualTo(
                cb.coalesce(root.<BigDecimal>get("salaryFrom"), root.<BigDecimal>get("salaryTo")),
                salaryMin
        );
    }

    private Specification<Vacancy> matchesSalaryMax(BigDecimal salaryMax) {
        if (salaryMax == null) {
            return null;
        }
        return (root, query, cb) -> cb.lessThanOrEqualTo(
                cb.coalesce(root.<BigDecimal>get("salaryTo"), root.<BigDecimal>get("salaryFrom")),
                salaryMax
        );
    }

    private Specification<Vacancy> matchesEmploymentType(String employmentType) {
        EmploymentType parsed = parseEnum(employmentType, EmploymentType.class);
        if (parsed == null) {
            return null;
        }
        return (root, query, cb) -> cb.equal(root.get("employmentType"), parsed);
    }

    private Specification<Vacancy> matchesShiftSchedule(String shiftSchedule) {
        ShiftSchedule parsed = parseEnum(shiftSchedule, ShiftSchedule.class);
        if (parsed == null) {
            return null;
        }
        return (root, query, cb) -> cb.equal(root.get("shiftSchedule"), parsed);
    }

    private Specification<Vacancy> matchesBenefits(List<String> benefits) {
        List<String> normalized = normalizeBenefits(benefits);
        if (normalized.isEmpty()) {
            return null;
        }
        return (root, query, cb) -> {
            var serializedBenefits = cb.lower(
                    cb.function("array_to_string", String.class, root.get("benefits"), cb.literal(","))
            );
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            for (String benefit : normalized) {
                predicates.add(cb.like(serializedBenefits, "%" + benefit + "%"));
            }
            return cb.or(predicates.toArray(jakarta.persistence.criteria.Predicate[]::new));
        };
    }

    private Specification<Vacancy> matchesEmployerVerification(boolean verifiedOnly) {
        if (!verifiedOnly) {
            return null;
        }
        return (root, query, cb) -> cb.isTrue(root.join("employer").get("isVerified"));
    }

    private Specification<Vacancy> matchesQuery(String queryText) {
        if (queryText == null || queryText.isBlank()) {
            return null;
        }
        return (root, query, cb) -> {
            String pattern = "%" + queryText.trim().toLowerCase() + "%";
            var employer = root.join("employer");
            return cb.or(
                    cb.like(cb.lower(root.get("title")), pattern),
                    cb.like(cb.lower(root.get("description")), pattern),
                    cb.like(cb.lower(employer.get("name")), pattern)
            );
        };
    }

    private Pageable applySort(Pageable pageable, String sort, String queryText) {
        String sortKey = sort == null || sort.isBlank() ? "date_desc" : sort.trim().toLowerCase();
        List<Sort.Order> orders = new ArrayList<>();
        orders.add(Sort.Order.desc("isBranded"));

        switch (sortKey) {
            case "salary_asc" -> {
                orders.add(Sort.Order.asc("salaryFrom"));
                orders.add(Sort.Order.desc("createdAt"));
            }
            case "salary_desc" -> {
                orders.add(Sort.Order.desc("salaryFrom"));
                orders.add(Sort.Order.desc("createdAt"));
            }
            case "date_asc" -> orders.add(Sort.Order.asc("createdAt"));
            case "relevance" -> {
                if (queryText != null && !queryText.isBlank()) {
                    orders.add(Sort.Order.desc("applyCount"));
                    orders.add(Sort.Order.desc("viewCount"));
                }
                orders.add(Sort.Order.desc("createdAt"));
            }
            default -> orders.add(Sort.Order.desc("createdAt"));
        }

        Sort resolved = Sort.by(orders);
        return PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), resolved);
    }

    private List<String> normalizeBenefits(List<String> benefits) {
        if (benefits == null || benefits.isEmpty()) {
            return List.of();
        }
        return benefits.stream()
                .filter(value -> value != null && !value.isBlank())
                .flatMap(value -> List.of(value.split(",")).stream())
                .map(String::trim)
                .map(String::toLowerCase)
                .filter(value -> !value.isBlank())
                .toList();
    }

    private <T extends Enum<T>> T parseEnum(String rawValue, Class<T> enumType) {
        if (rawValue == null || rawValue.isBlank()) {
            return null;
        }
        try {
            return Enum.valueOf(enumType, rawValue.trim().toUpperCase());
        } catch (IllegalArgumentException ignored) {
            return null;
        }
    }
}
