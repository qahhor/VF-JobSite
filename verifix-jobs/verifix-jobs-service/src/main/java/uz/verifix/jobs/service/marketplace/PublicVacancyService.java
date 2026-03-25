package uz.verifix.jobs.service.marketplace;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.verifix.jobs.common.util.SlugUtils;
import uz.verifix.jobs.domain.entity.FavoriteVacancy;
import uz.verifix.jobs.domain.entity.Vacancy;
import uz.verifix.jobs.domain.enums.VacancyStatus;
import uz.verifix.jobs.domain.repository.FavoriteVacancyRepository;
import uz.verifix.jobs.domain.repository.VacancyRepository;

import java.math.BigDecimal;
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

    @Cacheable(value = "public-vacancies", key = "#city + '-' + #category + '-' + #salaryMin + '-' + #pageable.pageNumber", unless = "#result.isEmpty()")
    @Transactional(readOnly = true)
    public Page<Vacancy> listActiveVacancies(String city, String category, BigDecimal salaryMin,
                                              String employmentType, String query, Pageable pageable) {
        return vacancyRepository.searchActive(city, category, salaryMin, employmentType, query, pageable);
    }

    @Transactional
    public Vacancy getBySlug(String slug) {
        Vacancy vacancy = vacancyRepository.findBySlugAndStatus(slug, VacancyStatus.ACTIVE);
        if (vacancy != null) {
            vacancy.setViewCount(vacancy.getViewCount() != null ? vacancy.getViewCount() + 1 : 1);
            vacancyRepository.save(vacancy);
        }
        return vacancy;
    }

    @Transactional
    public Vacancy getById(UUID id) {
        return vacancyRepository.findByIdAndStatus(id, VacancyStatus.ACTIVE).orElse(null);
    }

    public String generateSlug(Vacancy vacancy) {
        String base = SlugUtils.toSlug(vacancy.getTitle());
        String city = vacancy.getCity() != null ? SlugUtils.toSlug(vacancy.getCity()) : "";
        String slug = base + (city.isEmpty() ? "" : "-" + city) + "-" + vacancy.getId().toString().substring(0, 8);
        return slug;
    }

    @Transactional(readOnly = true)
    public Page<Vacancy> getByCategory(String category, Pageable pageable) {
        return vacancyRepository.findByCategoryAndStatus(category, VacancyStatus.ACTIVE, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Vacancy> getByCity(String city, Pageable pageable) {
        return vacancyRepository.findByCityAndStatus(city, VacancyStatus.ACTIVE, pageable);
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
}
