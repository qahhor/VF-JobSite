package uz.verifix.jobs.service.ml;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uz.verifix.jobs.domain.entity.Application;
import uz.verifix.jobs.domain.entity.Candidate;
import uz.verifix.jobs.domain.entity.Employer;
import uz.verifix.jobs.domain.entity.Vacancy;
import uz.verifix.jobs.domain.repository.ApplicationRepository;
import uz.verifix.jobs.domain.repository.FraudAlertRepository;

import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FraudDetectionServiceTest {

    @Mock private FraudAlertRepository fraudAlertRepository;
    @Mock private ApplicationRepository applicationRepository;

    @Test
    void shouldDetectRapidFireApplications() {
        FraudDetectionService service = new FraudDetectionService(
                fraudAlertRepository, applicationRepository, new ObjectMapper(),
                10, 5, 0.3);

        Candidate candidate = Candidate.builder().id(UUID.randomUUID()).firstName("Test").lastName("User").build();
        Employer employer = Employer.builder().id(UUID.randomUUID()).build();
        Vacancy vacancy = Vacancy.builder().employer(employer).build();
        Application application = Application.builder().vacancy(vacancy).candidate(candidate).build();

        when(applicationRepository.countByCandidateIdAndAppliedAtAfter(any(), any())).thenReturn(15L);

        FraudDetectionService.FraudCheckResult result = service.checkApplicationFraud(application);

        assertThat(result.score()).isGreaterThanOrEqualTo(java.math.BigDecimal.valueOf(0.3));
        assertThat(result.flags()).contains("RAPID_FIRE_APPLICATIONS");
    }

    @Test
    void shouldDetectIncompleteProfile() {
        FraudDetectionService service = new FraudDetectionService(
                fraudAlertRepository, applicationRepository, new ObjectMapper(),
                10, 5, 0.3);

        Candidate candidate = Candidate.builder().id(UUID.randomUUID()).build(); // no name
        Employer employer = Employer.builder().id(UUID.randomUUID()).build();
        Vacancy vacancy = Vacancy.builder().employer(employer).build();
        Application application = Application.builder().vacancy(vacancy).candidate(candidate).build();

        when(applicationRepository.countByCandidateIdAndAppliedAtAfter(any(), any())).thenReturn(0L);

        FraudDetectionService.FraudCheckResult result = service.checkApplicationFraud(application);

        assertThat(result.flags()).contains("INCOMPLETE_PROFILE");
    }

    @Test
    void shouldDetectSelfReferral() {
        FraudDetectionService service = new FraudDetectionService(
                fraudAlertRepository, applicationRepository, new ObjectMapper(),
                10, 5, 0.3);

        UUID userId = UUID.randomUUID();

        FraudDetectionService.FraudCheckResult result = service.checkReferralFraud(userId, userId);

        assertThat(result.score()).isGreaterThanOrEqualTo(java.math.BigDecimal.valueOf(0.8));
        assertThat(result.flags()).contains("SELF_REFERRAL");
    }

    @Test
    void shouldReturnLowScoreForLegitimateUser() {
        FraudDetectionService service = new FraudDetectionService(
                fraudAlertRepository, applicationRepository, new ObjectMapper(),
                10, 5, 0.3);

        Candidate candidate = Candidate.builder().id(UUID.randomUUID()).firstName("Ali").lastName("Karimov").build();
        Employer employer = Employer.builder().id(UUID.randomUUID()).build();
        Vacancy vacancy = Vacancy.builder().employer(employer).build();
        Application application = Application.builder().vacancy(vacancy).candidate(candidate).build();

        when(applicationRepository.countByCandidateIdAndAppliedAtAfter(any(), any())).thenReturn(2L);
        when(applicationRepository.existsByCandidateIdAndVacancy_EmployerId(any(), any())).thenReturn(false);

        FraudDetectionService.FraudCheckResult result = service.checkApplicationFraud(application);

        assertThat(result.score()).isLessThan(java.math.BigDecimal.valueOf(0.3));
        assertThat(result.flags()).isEmpty();
    }
}
