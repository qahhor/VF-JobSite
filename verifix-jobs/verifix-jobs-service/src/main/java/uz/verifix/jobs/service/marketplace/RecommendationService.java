package uz.verifix.jobs.service.marketplace;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.verifix.jobs.domain.entity.Candidate;
import uz.verifix.jobs.domain.entity.Vacancy;
import uz.verifix.jobs.domain.enums.VacancyStatus;
import uz.verifix.jobs.domain.repository.CandidateRepository;
import uz.verifix.jobs.domain.repository.VacancyRepository;

import java.util.List;
import java.util.UUID;

/**
 * Vacancy recommendation engine — suggests relevant vacancies based on candidate profile.
 * Uses city, category, salary preferences for matching.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final VacancyRepository vacancyRepository;
    private final CandidateRepository candidateRepository;

    @Transactional(readOnly = true)
    public List<Vacancy> getRecommendations(UUID candidateId, int limit) {
        Candidate candidate = candidateRepository.findById(candidateId).orElse(null);
        if (candidate == null) return List.of();

        // Strategy 1: Match by city + preferred categories
        if (candidate.getCity() != null && candidate.getPreferredCategories() != null) {
            for (String category : candidate.getPreferredCategories()) {
                List<Vacancy> matches = vacancyRepository.searchActive(
                        candidate.getCity(), category, candidate.getPreferredSalary(),
                        null, null, PageRequest.of(0, limit)).getContent();
                if (!matches.isEmpty()) return matches;
            }
        }

        // Strategy 2: Match by city only
        if (candidate.getCity() != null) {
            List<Vacancy> cityMatches = vacancyRepository.searchActive(
                    candidate.getCity(), null, null, null, null, PageRequest.of(0, limit)).getContent();
            if (!cityMatches.isEmpty()) return cityMatches;
        }

        // Strategy 3: Latest vacancies as fallback
        return vacancyRepository.findByCategoryAndStatus(null, VacancyStatus.ACTIVE, PageRequest.of(0, limit)).getContent();
    }

    @Cacheable(value = "similar-vacancies", key = "#vacancyId", unless = "#result.isEmpty()")
    @Transactional(readOnly = true)
    public List<Vacancy> getSimilarVacancies(UUID vacancyId, int limit) {
        Vacancy vacancy = vacancyRepository.findById(vacancyId).orElse(null);
        if (vacancy == null) return List.of();

        // Same category + same city
        List<Vacancy> similar = vacancyRepository.searchActive(
                vacancy.getCity(), vacancy.getCategory(), null, null, null,
                PageRequest.of(0, limit + 1)).getContent();

        // Remove self
        return similar.stream().filter(v -> !v.getId().equals(vacancyId)).limit(limit).toList();
    }
}
