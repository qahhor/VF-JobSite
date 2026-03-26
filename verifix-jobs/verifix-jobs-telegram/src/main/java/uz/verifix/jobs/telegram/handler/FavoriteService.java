package uz.verifix.jobs.telegram.handler;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.verifix.jobs.domain.entity.FavoriteVacancy;
import uz.verifix.jobs.domain.repository.FavoriteVacancyRepository;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FavoriteService {

    private final FavoriteVacancyRepository favoriteVacancyRepository;

    public boolean isFavorited(UUID candidateId, UUID vacancyId) {
        return favoriteVacancyRepository.existsByCandidateIdAndVacancyId(candidateId, vacancyId);
    }

    @Transactional
    public boolean toggle(UUID candidateId, UUID vacancyId) {
        if (favoriteVacancyRepository.existsByCandidateIdAndVacancyId(candidateId, vacancyId)) {
            favoriteVacancyRepository.deleteByCandidateIdAndVacancyId(candidateId, vacancyId);
            return false; // removed
        } else {
            favoriteVacancyRepository.save(FavoriteVacancy.builder()
                    .candidateId(candidateId).vacancyId(vacancyId).build());
            return true; // added
        }
    }
}
