package uz.verifix.jobs.service.ml;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uz.verifix.jobs.domain.repository.VacancyRepository;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SalaryPredictionServiceTest {

    @Mock private VacancyRepository vacancyRepository;
    @InjectMocks private SalaryPredictionService salaryPredictionService;

    @Test
    void shouldPredictSalaryWithCityAndCategory() {
        Object[] stats = {BigDecimal.valueOf(3500000), BigDecimal.valueOf(2000000), BigDecimal.valueOf(5000000), 50L};
        when(vacancyRepository.findSalaryStatsByCategoryAndCity("COOK", "Tashkent")).thenReturn(stats);

        SalaryPredictionService.SalaryPrediction result = salaryPredictionService.predict("COOK", "Tashkent");

        assertThat(result.median()).isEqualTo(BigDecimal.valueOf(3500000));
        assertThat(result.sampleSize()).isEqualTo(50);
        assertThat(result.p25()).isLessThan(result.median());
        assertThat(result.p75()).isGreaterThan(result.median());
    }

    @Test
    void shouldFallbackToCategoryOnlyWhenNoCityData() {
        when(vacancyRepository.findSalaryStatsByCategoryAndCity("DRIVER", "Khiva")).thenReturn(null);
        Object[] stats = {BigDecimal.valueOf(4500000), BigDecimal.valueOf(3000000), BigDecimal.valueOf(7000000), 100L};
        when(vacancyRepository.findSalaryStatsByCategory("DRIVER")).thenReturn(stats);

        SalaryPredictionService.SalaryPrediction result = salaryPredictionService.predict("DRIVER", "Khiva");

        assertThat(result.median()).isEqualTo(BigDecimal.valueOf(4500000));
        assertThat(result.category()).isEqualTo("DRIVER");
    }

    @Test
    void shouldReturnNullWhenNoDataAvailable() {
        when(vacancyRepository.findSalaryStatsByCategoryAndCity("UNKNOWN", "Nowhere")).thenReturn(null);
        when(vacancyRepository.findSalaryStatsByCategory("UNKNOWN")).thenReturn(null);

        SalaryPredictionService.SalaryPrediction result = salaryPredictionService.predict("UNKNOWN", "Nowhere");

        assertThat(result).isNull();
    }
}
