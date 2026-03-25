package uz.verifix.jobs.service.intelligence;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.verifix.jobs.domain.repository.ApplicationRepository;
import uz.verifix.jobs.domain.repository.VacancyRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Market intelligence: salary trends, city comparisons, competition analysis.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SalaryIntelligenceService {

    private final VacancyRepository vacancyRepository;
    private final ApplicationRepository applicationRepository;

    public record SalaryTrend(String category, String city, BigDecimal avgSalary,
                               BigDecimal medianSalary, BigDecimal p25, BigDecimal p75,
                               int vacancyCount, int applicationCount) {}

    public record CityComparison(String city, BigDecimal avgSalary, int vacancyCount,
                                  double demandIndex) {}

    public record CompetitionAnalysis(String category, String city, int competitorCount,
                                       BigDecimal avgCompetitorSalary, BigDecimal yourSalary,
                                       String position) {}

    public record HiringFunnel(String vacancyTitle, UUID vacancyId,
                                int totalApps, int viewed, int shortlisted,
                                int interviewed, int offered, int hired, int rejected,
                                double conversionRate, double avgDaysToHire) {}

    @Transactional(readOnly = true)
    public List<SalaryTrend> getSalaryTrends(String category, String city) {
        List<Object[]> stats = vacancyRepository.findSalaryTrendsByCategory(category);
        return stats.stream()
                .map(row -> new SalaryTrend(
                        (String) row[0], (String) row[1],
                        (BigDecimal) row[2], (BigDecimal) row[3],
                        (BigDecimal) row[4], (BigDecimal) row[5],
                        ((Number) row[6]).intValue(), ((Number) row[7]).intValue()
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CityComparison> compareCities(String category) {
        List<Object[]> stats = vacancyRepository.findCityComparisonByCategory(category);
        return stats.stream()
                .map(row -> new CityComparison(
                        (String) row[0], (BigDecimal) row[1],
                        ((Number) row[2]).intValue(),
                        ((Number) row[3]).doubleValue()
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<HiringFunnel> getHiringFunnels(UUID employerId) {
        List<Object[]> funnels = applicationRepository.findHiringFunnelByEmployer(employerId);
        return funnels.stream()
                .map(row -> new HiringFunnel(
                        (String) row[0], (UUID) row[1],
                        ((Number) row[2]).intValue(), ((Number) row[3]).intValue(),
                        ((Number) row[4]).intValue(), ((Number) row[5]).intValue(),
                        ((Number) row[6]).intValue(), ((Number) row[7]).intValue(),
                        ((Number) row[8]).intValue(),
                        ((Number) row[9]).doubleValue(), ((Number) row[10]).doubleValue()
                ))
                .toList();
    }
}
