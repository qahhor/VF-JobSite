package uz.verifix.jobs.service.application;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uz.verifix.jobs.domain.entity.Application;
import uz.verifix.jobs.domain.entity.Candidate;
import uz.verifix.jobs.domain.entity.Employer;
import uz.verifix.jobs.domain.entity.Vacancy;
import uz.verifix.jobs.domain.enums.ApplicationSource;
import uz.verifix.jobs.domain.enums.ApplicationStatus;
import uz.verifix.jobs.domain.enums.VacancyStatus;
import uz.verifix.jobs.domain.repository.ApplicationRepository;
import uz.verifix.jobs.domain.repository.CandidateRepository;
import uz.verifix.jobs.domain.repository.VacancyRepository;
import uz.verifix.jobs.common.exception.BusinessException;
import uz.verifix.jobs.service.notification.EventPublisher;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ApplicationServiceTest {

    @Mock private ApplicationRepository applicationRepository;
    @Mock private VacancyRepository vacancyRepository;
    @Mock private CandidateRepository candidateRepository;
    @Mock private EventPublisher eventPublisher;
    @Mock private ApplicationStatusMachine statusMachine;
    @InjectMocks private ApplicationService applicationService;

    @Test
    void shouldCreateApplicationSuccessfully() {
        UUID vacancyId = UUID.randomUUID();
        UUID candidateId = UUID.randomUUID();
        Employer employer = Employer.builder().id(UUID.randomUUID()).build();
        Vacancy vacancy = Vacancy.builder().id(vacancyId).employer(employer).status(VacancyStatus.ACTIVE).positionsCount(5).positionsFilled(0).build();
        Candidate candidate = Candidate.builder().id(candidateId).phone("+998901234567").build();

        when(vacancyRepository.findById(vacancyId)).thenReturn(Optional.of(vacancy));
        when(candidateRepository.findById(candidateId)).thenReturn(Optional.of(candidate));
        when(applicationRepository.existsByVacancyIdAndCandidateId(vacancyId, candidateId)).thenReturn(false);
        when(applicationRepository.save(any(Application.class))).thenAnswer(inv -> inv.getArgument(0));

        Application result = applicationService.apply(vacancyId, candidateId, ApplicationSource.TELEGRAM);

        assertThat(result.getStatus()).isEqualTo(ApplicationStatus.NEW);
        assertThat(result.getSource()).isEqualTo(ApplicationSource.TELEGRAM);
        verify(applicationRepository).save(any(Application.class));
    }

    @Test
    void shouldPreventDuplicateApplication() {
        UUID vacancyId = UUID.randomUUID();
        UUID candidateId = UUID.randomUUID();
        Vacancy vacancy = Vacancy.builder().id(vacancyId).status(VacancyStatus.ACTIVE).build();

        when(vacancyRepository.findById(vacancyId)).thenReturn(Optional.of(vacancy));
        when(applicationRepository.existsByVacancyIdAndCandidateId(vacancyId, candidateId)).thenReturn(true);

        assertThatThrownBy(() -> applicationService.apply(vacancyId, candidateId, ApplicationSource.WEB))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void shouldChangeApplicationStatusThroughPipeline() {
        UUID appId = UUID.randomUUID();
        UUID employerId = UUID.randomUUID();
        Employer employer = Employer.builder().id(employerId).build();
        Vacancy vacancy = Vacancy.builder().employer(employer).build();
        Application application = Application.builder().id(appId).vacancy(vacancy).status(ApplicationStatus.NEW).build();

        when(applicationRepository.findById(appId)).thenReturn(Optional.of(application));
        when(statusMachine.isValidTransition(ApplicationStatus.NEW, ApplicationStatus.VIEWED)).thenReturn(true);
        when(applicationRepository.save(any(Application.class))).thenAnswer(inv -> inv.getArgument(0));

        Application result = applicationService.changeStatus(appId, employerId, ApplicationStatus.VIEWED, null);

        assertThat(result.getStatus()).isEqualTo(ApplicationStatus.VIEWED);
        assertThat(result.getViewedAt()).isNotNull();
    }

    @Test
    void shouldRejectInvalidStatusTransition() {
        UUID appId = UUID.randomUUID();
        UUID employerId = UUID.randomUUID();
        Employer employer = Employer.builder().id(employerId).build();
        Vacancy vacancy = Vacancy.builder().employer(employer).build();
        Application application = Application.builder().id(appId).vacancy(vacancy).status(ApplicationStatus.NEW).build();

        when(applicationRepository.findById(appId)).thenReturn(Optional.of(application));
        when(statusMachine.isValidTransition(ApplicationStatus.NEW, ApplicationStatus.HIRED)).thenReturn(false);

        assertThatThrownBy(() -> applicationService.changeStatus(appId, employerId, ApplicationStatus.HIRED, null))
                .isInstanceOf(BusinessException.class);
    }
}
