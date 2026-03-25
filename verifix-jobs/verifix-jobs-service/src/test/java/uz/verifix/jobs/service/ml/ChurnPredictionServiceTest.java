package uz.verifix.jobs.service.ml;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uz.verifix.jobs.domain.entity.Candidate;
import uz.verifix.jobs.domain.enums.DigestPreference;
import uz.verifix.jobs.domain.repository.ApplicationRepository;
import uz.verifix.jobs.domain.repository.CandidateRepository;
import uz.verifix.jobs.service.notification.NotificationService;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class ChurnPredictionServiceTest {

    @Mock private CandidateRepository candidateRepository;
    @Mock private ApplicationRepository applicationRepository;
    @Mock private NotificationService notificationService;

    @Test
    void shouldScoreHighRiskForInactiveUserWithNoApplications() {
        ChurnPredictionService service = new ChurnPredictionService(
                candidateRepository, applicationRepository, notificationService,
                60, 30, 0.7);

        Candidate candidate = Candidate.builder()
                .id(UUID.randomUUID())
                .createdAt(Instant.now().minus(90, ChronoUnit.DAYS))
                .digestPref(DigestPreference.OFF)
                .build();

        ChurnPredictionService.ChurnRisk risk = service.assessRisk(candidate);

        assertThat(risk.score()).isGreaterThanOrEqualTo(0.5);
        assertThat(risk.factors()).contains("NO_APPLICATIONS");
    }

    @Test
    void shouldScoreLowRiskForActiveUser() {
        ChurnPredictionService service = new ChurnPredictionService(
                candidateRepository, applicationRepository, notificationService,
                60, 30, 0.7);

        Candidate candidate = Candidate.builder()
                .id(UUID.randomUUID())
                .firstName("Ali")
                .lastName("Karimov")
                .createdAt(Instant.now().minus(5, ChronoUnit.DAYS))
                .digestPref(DigestPreference.DAILY)
                .build();

        ChurnPredictionService.ChurnRisk risk = service.assessRisk(candidate);

        assertThat(risk.score()).isLessThan(0.7);
    }

    @Test
    void shouldIncludeNotificationsDisabledFactor() {
        ChurnPredictionService service = new ChurnPredictionService(
                candidateRepository, applicationRepository, notificationService,
                60, 30, 0.7);

        Candidate candidate = Candidate.builder()
                .id(UUID.randomUUID())
                .firstName("Test")
                .createdAt(Instant.now().minus(10, ChronoUnit.DAYS))
                .digestPref(DigestPreference.OFF)
                .build();

        ChurnPredictionService.ChurnRisk risk = service.assessRisk(candidate);

        assertThat(risk.factors()).contains("NOTIFICATIONS_DISABLED");
    }
}
