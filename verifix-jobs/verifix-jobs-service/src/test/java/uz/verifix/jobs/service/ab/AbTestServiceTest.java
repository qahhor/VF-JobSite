package uz.verifix.jobs.service.ab;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uz.verifix.jobs.domain.entity.AbConversion;
import uz.verifix.jobs.domain.entity.AbExperiment;
import uz.verifix.jobs.domain.repository.AbConversionRepository;
import uz.verifix.jobs.domain.repository.AbExperimentRepository;
import uz.verifix.jobs.common.exception.BusinessException;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AbTestServiceTest {

    @Mock private AbExperimentRepository experimentRepository;
    @Mock private AbConversionRepository conversionRepository;
    @InjectMocks private AbTestService abTestService;

    @Test
    void shouldCreateExperiment() {
        when(experimentRepository.findByName("test-exp")).thenReturn(Optional.empty());
        when(experimentRepository.save(any(AbExperiment.class))).thenAnswer(inv -> inv.getArgument(0));

        AbExperiment result = abTestService.createExperiment("test-exp", "Test description");

        assertThat(result.getName()).isEqualTo("test-exp");
        assertThat(result.isActive()).isTrue();
    }

    @Test
    void shouldRejectDuplicateExperimentName() {
        AbExperiment existing = AbExperiment.builder().name("test-exp").build();
        when(experimentRepository.findByName("test-exp")).thenReturn(Optional.of(existing));

        assertThatThrownBy(() -> abTestService.createExperiment("test-exp", "Duplicate"))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void shouldAssignDeterministicVariant() {
        UUID userId = UUID.fromString("00000000-0000-0000-0000-000000000001");
        AbExperiment experiment = AbExperiment.builder().name("color-test").active(true).build();
        when(experimentRepository.findByName("color-test")).thenReturn(Optional.of(experiment));
        when(conversionRepository.findByExperimentAndUserId(experiment, userId)).thenReturn(Optional.empty());
        when(conversionRepository.save(any(AbConversion.class))).thenAnswer(inv -> inv.getArgument(0));

        String variant1 = abTestService.getVariant(userId, "color-test");

        // Same user should get same variant (deterministic hash)
        when(conversionRepository.findByExperimentAndUserId(experiment, userId))
                .thenReturn(Optional.of(AbConversion.builder().variant(variant1).build()));
        String variant2 = abTestService.getVariant(userId, "color-test");

        assertThat(variant1).isIn("A", "B");
        assertThat(variant2).isEqualTo(variant1);
    }

    @Test
    void shouldTrackConversion() {
        UUID userId = UUID.randomUUID();
        AbExperiment experiment = AbExperiment.builder().name("cta-test").active(true).build();
        AbConversion conversion = AbConversion.builder().experiment(experiment).userId(userId).variant("A").converted(false).build();

        when(experimentRepository.findByName("cta-test")).thenReturn(Optional.of(experiment));
        when(conversionRepository.findByExperimentAndUserId(experiment, userId)).thenReturn(Optional.of(conversion));
        when(conversionRepository.save(any(AbConversion.class))).thenAnswer(inv -> inv.getArgument(0));

        abTestService.trackConversion(userId, "cta-test");

        verify(conversionRepository).save(argThat(c -> c.isConverted()));
    }

    @Test
    void shouldCalculateStats() {
        AbExperiment experiment = AbExperiment.builder().name("button-test").active(true).build();
        when(experimentRepository.findByName("button-test")).thenReturn(Optional.of(experiment));
        when(conversionRepository.countByExperimentAndVariant(experiment, "A")).thenReturn(100L);
        when(conversionRepository.countByExperimentAndVariant(experiment, "B")).thenReturn(100L);
        when(conversionRepository.countByExperimentAndVariantAndConvertedTrue(experiment, "A")).thenReturn(15L);
        when(conversionRepository.countByExperimentAndVariantAndConvertedTrue(experiment, "B")).thenReturn(20L);

        AbTestService.ExperimentStats stats = abTestService.getStats("button-test");

        assertThat(stats.variantA().conversionRate()).isEqualTo(15.0);
        assertThat(stats.variantB().conversionRate()).isEqualTo(20.0);
        assertThat(stats.winner()).isEqualTo("B");
    }

    @Test
    void shouldDeactivateExperiment() {
        AbExperiment experiment = AbExperiment.builder().name("layout-test").active(true).build();
        when(experimentRepository.findByName("layout-test")).thenReturn(Optional.of(experiment));
        when(experimentRepository.save(any(AbExperiment.class))).thenAnswer(inv -> inv.getArgument(0));

        AbExperiment result = abTestService.deactivateExperiment("layout-test");

        assertThat(result.isActive()).isFalse();
    }
}
