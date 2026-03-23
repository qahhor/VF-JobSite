package uz.verifix.jobs.service.ml;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.verifix.jobs.domain.repository.VacancyRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SalaryPredictionService {

    private final VacancyRepository vacancyRepository;

    @Transactional(readOnly = true)
    public SalaryPrediction predictSalary(String category, String city, String employmentType) {
        List<Object[]> stats = vacancyRepository.findSalaryStatsByCategoryAndCity(category, city);

        if (stats.isEmpty() || stats.get(0)[0] == null) {
            // Fallback: broader search without city
            stats = vacancyRepository.findSalaryStatsByCategory(category);
        }

        if (stats.isEmpty() || stats.get(0)[0] == null) {
            return new SalaryPrediction(null, null, null, 0, category, city);
        }

        Object[] row = stats.get(0);
        BigDecimal avg = toBigDecimal(row[0]);
        BigDecimal min = toBigDecimal(row[1]);
        BigDecimal max = toBigDecimal(row[2]);
        long count = ((Number) row[3]).longValue();

        // Approximate percentiles from min/avg/max
        BigDecimal p25 = min.add(avg.subtract(min).divide(BigDecimal.valueOf(2), RoundingMode.HALF_UP));
        BigDecimal p75 = avg.add(max.subtract(avg).divide(BigDecimal.valueOf(2), RoundingMode.HALF_UP));

        return new SalaryPrediction(p25, avg, p75, count, category, city);
    }

    @Transactional(readOnly = true)
    public SalaryPrediction getMarketRate(String category, String city) {
        return predictSalary(category, city, null);
    }

    private BigDecimal toBigDecimal(Object val) {
        if (val == null) return BigDecimal.ZERO;
        if (val instanceof BigDecimal) return (BigDecimal) val;
        return new BigDecimal(val.toString());
    }

    public record SalaryPrediction(BigDecimal p25, BigDecimal median, BigDecimal p75,
                                    long sampleSize, String category, String city) {}
}
