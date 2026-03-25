package uz.verifix.jobs.service.vacancy;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import uz.verifix.jobs.domain.entity.Employer;
import uz.verifix.jobs.domain.entity.Vacancy;
import uz.verifix.jobs.domain.enums.EmployerStatus;
import uz.verifix.jobs.domain.enums.VacancyStatus;
import uz.verifix.jobs.domain.repository.EmployerRepository;
import uz.verifix.jobs.domain.repository.VacancyRepository;
import uz.verifix.jobs.common.exception.ResourceNotFoundException;
import uz.verifix.jobs.service.notification.EventPublisher;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VacancyServiceTest {

    @Mock private VacancyRepository vacancyRepository;
    @Mock private EmployerRepository employerRepository;
    @Mock private EventPublisher eventPublisher;
    @InjectMocks private VacancyService vacancyService;

    @Test
    void shouldCreateVacancyWithDraftStatus() {
        UUID employerId = UUID.randomUUID();
        Employer employer = Employer.builder().id(employerId).name("Test Co").status(EmployerStatus.ACTIVE).build();
        when(employerRepository.findById(employerId)).thenReturn(Optional.of(employer));
        when(vacancyRepository.save(any(Vacancy.class))).thenAnswer(inv -> inv.getArgument(0));

        Vacancy result = vacancyService.createVacancy(employerId, "Driver needed", "Full description",
                "DRIVER", "Tashkent", null, BigDecimal.valueOf(3000000), BigDecimal.valueOf(5000000),
                "UZS", "FULL_TIME", null, null, false, 1, null);

        assertThat(result.getStatus()).isEqualTo(VacancyStatus.DRAFT);
        assertThat(result.getTitle()).isEqualTo("Driver needed");
        assertThat(result.getEmployer()).isEqualTo(employer);
        verify(vacancyRepository).save(any(Vacancy.class));
    }

    @Test
    void shouldThrowWhenEmployerNotFound() {
        UUID employerId = UUID.randomUUID();
        when(employerRepository.findById(employerId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> vacancyService.createVacancy(employerId, "Test", "Desc",
                "COOK", "Tashkent", null, null, null, "UZS", "FULL_TIME", null, null, false, 1, null))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void shouldSearchVacanciesByFilters() {
        Vacancy v = Vacancy.builder().title("Cook").city("Tashkent").status(VacancyStatus.ACTIVE).build();
        Page<Vacancy> page = new PageImpl<>(List.of(v));
        when(vacancyRepository.findAll(any(), any(PageRequest.class))).thenReturn(page);

        Page<Vacancy> result = vacancyService.search("Tashkent", "COOK", null, null, PageRequest.of(0, 10));

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getTitle()).isEqualTo("Cook");
    }

    @Test
    void shouldDeleteVacancyViaSoftDelete() {
        UUID vacancyId = UUID.randomUUID();
        UUID employerId = UUID.randomUUID();
        Employer employer = Employer.builder().id(employerId).build();
        Vacancy vacancy = Vacancy.builder().id(vacancyId).employer(employer).status(VacancyStatus.DRAFT).build();
        when(vacancyRepository.findById(vacancyId)).thenReturn(Optional.of(vacancy));

        vacancyService.deleteVacancy(vacancyId, employerId);

        verify(vacancyRepository).save(argThat(v -> v.getDeletedAt() != null));
    }
}
