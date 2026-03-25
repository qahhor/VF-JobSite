package uz.verifix.jobs.service.hrm;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import uz.verifix.jobs.domain.entity.Employer;
import uz.verifix.jobs.domain.repository.EmployerRepository;
import uz.verifix.jobs.integration.verifix.HrmSalaryStats;
import uz.verifix.jobs.integration.verifix.VerifixHrmClient;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Aggregates anonymized salary data from HRM payroll for ML salary prediction.
 * Used to improve SalaryPredictionService accuracy with real market data.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class HrmSalaryDataService {

    private final VerifixHrmClient hrmClient;
    private final EmployerRepository employerRepository;

    public record SalaryBenchmark(
            String jobName,
            String region,
            BigDecimal avgSalary,
            BigDecimal minSalary,
            BigDecimal maxSalary,
            BigDecimal p25,
            BigDecimal p75,
            int sampleSize
    ) {}

    /**
     * Fetch salary benchmarks from all HRM-linked employers.
     * Data is aggregated and anonymized (no individual employee data).
     */
    public List<SalaryBenchmark> getAggregatedSalaryData() {
        List<Employer> hrmEmployers = employerRepository.findByHrmSyncEnabledTrue();

        List<HrmSalaryStats> allStats = hrmEmployers.stream()
                .filter(e -> e.getHrmCompanyId() != null)
                .flatMap(e -> {
                    try {
                        return hrmClient.getSalaryStats(UUID.fromString(e.getHrmCompanyId())).stream();
                    } catch (Exception ex) {
                        log.warn("Failed to fetch salary stats for employer {}: {}", e.getId(), ex.getMessage());
                        return java.util.stream.Stream.empty();
                    }
                })
                .toList();

        // Aggregate by job + region
        Map<String, List<HrmSalaryStats>> grouped = allStats.stream()
                .collect(Collectors.groupingBy(
                        s -> (s.getJobName() != null ? s.getJobName() : "OTHER") + "|" +
                                (s.getRegionName() != null ? s.getRegionName() : "ALL")));

        return grouped.entrySet().stream()
                .map(entry -> {
                    String[] parts = entry.getKey().split("\\|", 2);
                    List<HrmSalaryStats> stats = entry.getValue();

                    BigDecimal avgSalary = stats.stream()
                            .map(HrmSalaryStats::getAvgSalary)
                            .filter(java.util.Objects::nonNull)
                            .reduce(BigDecimal.ZERO, BigDecimal::add)
                            .divide(BigDecimal.valueOf(Math.max(stats.size(), 1)), BigDecimal.ROUND_HALF_UP);

                    BigDecimal minSalary = stats.stream()
                            .map(HrmSalaryStats::getMinSalary)
                            .filter(java.util.Objects::nonNull)
                            .min(BigDecimal::compareTo)
                            .orElse(BigDecimal.ZERO);

                    BigDecimal maxSalary = stats.stream()
                            .map(HrmSalaryStats::getMaxSalary)
                            .filter(java.util.Objects::nonNull)
                            .max(BigDecimal::compareTo)
                            .orElse(BigDecimal.ZERO);

                    int totalEmployees = stats.stream().mapToInt(HrmSalaryStats::getEmployeeCount).sum();

                    // Approximate percentiles
                    BigDecimal p25 = minSalary.add(avgSalary.subtract(minSalary).divide(BigDecimal.valueOf(2), BigDecimal.ROUND_HALF_UP));
                    BigDecimal p75 = avgSalary.add(maxSalary.subtract(avgSalary).divide(BigDecimal.valueOf(2), BigDecimal.ROUND_HALF_UP));

                    return new SalaryBenchmark(parts[0], parts[1], avgSalary, minSalary, maxSalary, p25, p75, totalEmployees);
                })
                .filter(b -> b.sampleSize() >= 3)  // Minimum 3 employees for anonymity
                .toList();
    }

    /**
     * Get salary benchmark for a specific job + region combination.
     */
    public SalaryBenchmark getSalaryBenchmark(String jobName, String region) {
        return getAggregatedSalaryData().stream()
                .filter(b -> b.jobName().equalsIgnoreCase(jobName))
                .filter(b -> region == null || b.region().equalsIgnoreCase(region))
                .findFirst()
                .orElse(null);
    }
}
