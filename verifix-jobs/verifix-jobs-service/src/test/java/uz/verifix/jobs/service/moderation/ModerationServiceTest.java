package uz.verifix.jobs.service.moderation;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uz.verifix.jobs.domain.entity.Employer;
import uz.verifix.jobs.domain.entity.ModerationQueue;
import uz.verifix.jobs.domain.entity.Vacancy;
import uz.verifix.jobs.domain.enums.EmployerStatus;
import uz.verifix.jobs.domain.enums.ModerationStatus;
import uz.verifix.jobs.domain.enums.VacancyStatus;
import uz.verifix.jobs.domain.repository.ModerationQueueRepository;
import uz.verifix.jobs.domain.repository.VacancyRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ModerationServiceTest {

    @Mock
    private ModerationQueueRepository moderationQueueRepository;
    @Mock
    private VacancyRepository vacancyRepository;

    private ModerationProperties moderationProperties;
    private ModerationService moderationService;

    @BeforeEach
    void setUp() {
        moderationProperties = new ModerationProperties();
        moderationService = new ModerationService(
                moderationQueueRepository,
                vacancyRepository,
                moderationProperties
        );

        when(vacancyRepository.save(any(Vacancy.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(moderationQueueRepository.save(any(ModerationQueue.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void shouldQueueManualModerationWhenKeywordMatches() {
        UUID vacancyId = UUID.randomUUID();
        Vacancy vacancy = baseVacancy(vacancyId);
        vacancy.setDescription("Remote work with flexible shifts");

        when(vacancyRepository.findById(vacancyId)).thenReturn(Optional.of(vacancy));

        ModerationQueue queue = moderationService.submitForModeration(vacancyId);

        assertEquals(ModerationStatus.PENDING, queue.getStatus());
        assertEquals(VacancyStatus.PENDING_MODERATION, vacancy.getStatus());
        assertEquals(ModerationStatus.PENDING, vacancy.getModerationStatus());
        assertTrue(vacancy.getModerationNote().contains("remote work"));
    }

    @Test
    void shouldAutoRejectWhenSalaryBelowMinimumWage() {
        UUID vacancyId = UUID.randomUUID();
        Vacancy vacancy = baseVacancy(vacancyId);
        vacancy.setSalaryFrom(new BigDecimal("900000"));

        when(vacancyRepository.findById(vacancyId)).thenReturn(Optional.of(vacancy));

        ModerationQueue queue = moderationService.submitForModeration(vacancyId);

        assertEquals(ModerationStatus.REJECTED, queue.getStatus());
        assertEquals(VacancyStatus.DRAFT, vacancy.getStatus());
        assertEquals(moderationProperties.getMinimumWageReason(), vacancy.getModerationNote());
    }

    @Test
    void shouldAutoApproveTrustedEmployerWithoutRiskSignals() {
        UUID vacancyId = UUID.randomUUID();
        Vacancy vacancy = baseVacancy(vacancyId);
        vacancy.setDescription("Factory operator day shift");
        vacancy.setSalaryFrom(new BigDecimal("2000000"));
        vacancy.getEmployer().setIsVerified(true);

        when(vacancyRepository.findById(vacancyId)).thenReturn(Optional.of(vacancy));
        when(vacancyRepository.countByEmployerIdAndModerationStatus(vacancy.getEmployer().getId(), ModerationStatus.APPROVED))
                .thenReturn(15L);
        when(vacancyRepository.countByEmployerIdAndModerationStatus(vacancy.getEmployer().getId(), ModerationStatus.REJECTED))
                .thenReturn(0L);
        when(vacancyRepository.countByEmployerIdAndModerationStatusIn(
                vacancy.getEmployer().getId(),
                List.of(ModerationStatus.APPROVED, ModerationStatus.REJECTED)))
                .thenReturn(15L);

        ModerationQueue queue = moderationService.submitForModeration(vacancyId);

        assertEquals(ModerationStatus.APPROVED, queue.getStatus());
        assertEquals(VacancyStatus.ACTIVE, vacancy.getStatus());
        assertEquals(ModerationStatus.APPROVED, vacancy.getModerationStatus());
    }

    private Vacancy baseVacancy(UUID vacancyId) {
        Employer employer = Employer.builder()
                .name("ACME")
                .status(EmployerStatus.ACTIVE)
                .moderationStatus(ModerationStatus.APPROVED)
                .isVerified(false)
                .build();
        employer.setId(UUID.randomUUID());

        Vacancy vacancy = Vacancy.builder()
                .title("Warehouse operator")
                .description("Safe vacancy")
                .salaryFrom(new BigDecimal("1500000"))
                .status(VacancyStatus.DRAFT)
                .moderationStatus(ModerationStatus.PENDING)
                .employer(employer)
                .build();
        vacancy.setId(vacancyId);
        return vacancy;
    }
}
