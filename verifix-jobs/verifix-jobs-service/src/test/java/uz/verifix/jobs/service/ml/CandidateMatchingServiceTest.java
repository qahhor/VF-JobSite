package uz.verifix.jobs.service.ml;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uz.verifix.jobs.domain.entity.Candidate;
import uz.verifix.jobs.domain.entity.Vacancy;
import uz.verifix.jobs.domain.enums.MyIdStatus;
import uz.verifix.jobs.domain.repository.CandidateRepository;
import uz.verifix.jobs.domain.repository.MlCandidateScoreRepository;
import uz.verifix.jobs.domain.repository.VacancyRepository;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class CandidateMatchingServiceTest {

    @Mock private MlCandidateScoreRepository scoreRepository;
    @Mock private CandidateRepository candidateRepository;
    @Mock private VacancyRepository vacancyRepository;

    @Test
    void shouldScoreCityMatch() {
        CandidateMatchingService service = new CandidateMatchingService(scoreRepository, candidateRepository, vacancyRepository,
                0.2, 0.2, 0.2, 0.2, 0.1, 0.1, 0.0, 0.0);

        Candidate candidate = Candidate.builder().city("Tashkent").build();
        Vacancy vacancy = Vacancy.builder().city("Tashkent").build();

        BigDecimal score = service.calculateScore(candidate, vacancy);

        assertThat(score.doubleValue()).isGreaterThanOrEqualTo(0.2);
    }

    @Test
    void shouldScoreCategoryMatch() {
        CandidateMatchingService service = new CandidateMatchingService(scoreRepository, candidateRepository, vacancyRepository,
                0.2, 0.2, 0.2, 0.2, 0.1, 0.1, 0.0, 0.0);

        Candidate candidate = Candidate.builder().preferredCategories(new String[]{"COOK", "DRIVER"}).build();
        Vacancy vacancy = Vacancy.builder().category("COOK").build();

        BigDecimal score = service.calculateScore(candidate, vacancy);

        assertThat(score.doubleValue()).isGreaterThanOrEqualTo(0.2);
    }

    @Test
    void shouldScoreSalaryMatch() {
        CandidateMatchingService service = new CandidateMatchingService(scoreRepository, candidateRepository, vacancyRepository,
                0.2, 0.2, 0.2, 0.2, 0.1, 0.1, 0.0, 0.0);

        Candidate candidate = Candidate.builder().preferredSalary(BigDecimal.valueOf(4000000)).build();
        Vacancy vacancy = Vacancy.builder().salaryFrom(BigDecimal.valueOf(3000000)).salaryTo(BigDecimal.valueOf(5000000)).build();

        BigDecimal score = service.calculateScore(candidate, vacancy);

        assertThat(score.doubleValue()).isGreaterThanOrEqualTo(0.2);
    }

    @Test
    void shouldBonusForMyIdVerification() {
        CandidateMatchingService service = new CandidateMatchingService(scoreRepository, candidateRepository, vacancyRepository,
                0.2, 0.2, 0.2, 0.2, 0.1, 0.1, 0.0, 0.0);

        Candidate candidate = Candidate.builder().myidStatus(MyIdStatus.VERIFIED).city("Tashkent").build();
        Vacancy vacancy = Vacancy.builder().city("Tashkent").build();

        BigDecimal score = service.calculateScore(candidate, vacancy);

        assertThat(score.doubleValue()).isGreaterThanOrEqualTo(0.3); // city + myid
    }

    @Test
    void shouldCapScoreAtOne() {
        CandidateMatchingService service = new CandidateMatchingService(scoreRepository, candidateRepository, vacancyRepository,
                0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.0, 0.0);

        Candidate candidate = Candidate.builder()
                .city("Tashkent").preferredCategories(new String[]{"COOK"})
                .preferredSalary(BigDecimal.valueOf(3000000))
                .myidStatus(MyIdStatus.VERIFIED)
                .build();
        Vacancy vacancy = Vacancy.builder().city("Tashkent").category("COOK")
                .salaryFrom(BigDecimal.valueOf(2000000)).salaryTo(BigDecimal.valueOf(5000000)).build();

        BigDecimal score = service.calculateScore(candidate, vacancy);

        assertThat(score.doubleValue()).isLessThanOrEqualTo(1.0);
    }
}
