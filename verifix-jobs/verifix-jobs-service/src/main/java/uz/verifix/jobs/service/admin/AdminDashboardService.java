package uz.verifix.jobs.service.admin;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import uz.verifix.jobs.common.dto.SystemOverviewResponse;
import uz.verifix.jobs.domain.enums.ApplicationStatus;
import uz.verifix.jobs.domain.enums.EmployerStatus;
import uz.verifix.jobs.domain.enums.ModerationStatus;
import uz.verifix.jobs.domain.enums.VacancyStatus;
import uz.verifix.jobs.domain.repository.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.*;

/**
 * Admin Dashboard metrics service.
 * All metrics come from real DB queries. Results are cached for 60s.
 * SLA target: < 500ms for the full overview response.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final EmployerRepository employerRepository;
    private final CandidateRepository candidateRepository;
    private final VacancyRepository vacancyRepository;
    private final ApplicationRepository applicationRepository;
    private final ModerationQueueRepository moderationQueueRepository;
    private final FraudAlertRepository fraudAlertRepository;
    private final AdminUserRepository adminUserRepository;
    private final PaymentRepository paymentRepository;

    private static final ZoneId UZ_ZONE = ZoneId.of("Asia/Tashkent");

    @Cacheable(value = "admin:dashboard:overview", unless = "#result == null")
    public SystemOverviewResponse getOverview() {
        long start = System.currentTimeMillis();

        Instant now = Instant.now();
        Instant sevenDaysAgo = now.minus(7, ChronoUnit.DAYS);
        Instant fourteenDaysAgo = now.minus(14, ChronoUnit.DAYS);
        Instant todayStart = LocalDate.now(UZ_ZONE).atStartOfDay(UZ_ZONE).toInstant();
        Instant monthStart = LocalDate.now(UZ_ZONE).withDayOfMonth(1).atStartOfDay(UZ_ZONE).toInstant();
        Instant prevMonthStart = LocalDate.now(UZ_ZONE).withDayOfMonth(1).minusMonths(1).atStartOfDay(UZ_ZONE).toInstant();

        // Core counts
        long totalCandidates = candidateRepository.count();
        long totalEmployers = employerRepository.count();
        long totalVacancies = vacancyRepository.count();
        long activeVacancies = vacancyRepository.countByStatus(VacancyStatus.ACTIVE);
        long totalApplications = applicationRepository.count();
        long totalHired = applicationRepository.countByStatus(ApplicationStatus.HIRED);

        // 7-day metrics
        long newCandidates7d = candidateRepository.countByCreatedAtAfter(sevenDaysAgo);
        long newVacancies7d = vacancyRepository.countByCreatedAtAfter(sevenDaysAgo);

        // Dashboard KPIs
        long totalUsers = totalCandidates + totalEmployers;
        long applicationsToday = applicationRepository.countByAppliedAtAfter(todayStart);
        BigDecimal monthlyRevenue = paymentRepository.sumCompletedAmountSince(monthStart);

        // Trends: compare current 7d vs previous 7d
        long prevCandidates7d = candidateRepository.countByCreatedAtAfter(fourteenDaysAgo) - newCandidates7d;
        int usersTrend = calcTrendPercent(newCandidates7d, prevCandidates7d);

        long prevVacancies7d = vacancyRepository.countByCreatedAtAfter(fourteenDaysAgo) - newVacancies7d;
        int vacanciesTrend = calcTrendPercent(newVacancies7d, prevVacancies7d);

        // Applications today vs yesterday
        Instant yesterdayStart = todayStart.minus(1, ChronoUnit.DAYS);
        long appsYesterday = applicationRepository.countByAppliedAtAfter(yesterdayStart) - applicationsToday;
        int applicationsTrend = calcTrendPercent(applicationsToday, appsYesterday);

        // Revenue: this month vs previous month
        BigDecimal prevMonthRevenue = paymentRepository.sumCompletedAmountSince(prevMonthStart)
                .subtract(monthlyRevenue);
        int revenueTrend = calcTrendPercent(monthlyRevenue, prevMonthRevenue);

        // Admin-specific
        long pendingModeration = moderationQueueRepository.countByStatus(ModerationStatus.PENDING);
        long openFraudAlerts = fraudAlertRepository.countByReviewedFalse();
        long activeAdmins = adminUserRepository.count();
        long pendingEmployers = employerRepository.countByStatus(EmployerStatus.PENDING);
        long verifiedEmployers = employerRepository.countByIsVerifiedTrue();

        // Growth data: monthly registrations for last 6 months
        Instant sixMonthsAgo = LocalDate.now(UZ_ZONE).minusMonths(5).withDayOfMonth(1)
                .atStartOfDay(UZ_ZONE).toInstant();
        List<Object[]> monthlyRows = candidateRepository.countByMonthSince(sixMonthsAgo);
        Map<String, Long> monthlyMap = new LinkedHashMap<>();
        for (Object[] row : monthlyRows) {
            monthlyMap.put((String) row[0], ((Number) row[1]).longValue());
        }
        List<Long> growthData = new ArrayList<>();
        YearMonth current = YearMonth.now(UZ_ZONE);
        for (int i = 5; i >= 0; i--) {
            String key = current.minusMonths(i).toString(); // YYYY-MM
            growthData.add(monthlyMap.getOrDefault(key, 0L));
        }

        // Top cities by active vacancies
        List<Object[]> cityRows = vacancyRepository.findCityStats();
        List<Map<String, Object>> topCities = new ArrayList<>();
        for (int i = 0; i < Math.min(cityRows.size(), 10); i++) {
            Object[] row = cityRows.get(i);
            topCities.add(Map.of("name", row[0], "count", ((Number) row[1]).longValue()));
        }

        long elapsed = System.currentTimeMillis() - start;
        log.info("Dashboard overview computed in {}ms", elapsed);

        return SystemOverviewResponse.builder()
                .totalEmployers(totalEmployers)
                .totalCandidates(totalCandidates)
                .totalVacancies(totalVacancies)
                .activeVacancies(activeVacancies)
                .totalApplications(totalApplications)
                .totalHired(totalHired)
                .newCandidatesLast7Days(newCandidates7d)
                .newVacanciesLast7Days(newVacancies7d)
                .totalUsers(totalUsers)
                .applicationsToday(applicationsToday)
                .monthlyRevenue(monthlyRevenue)
                .usersTrend(usersTrend)
                .vacanciesTrend(vacanciesTrend)
                .applicationsTrend(applicationsTrend)
                .revenueTrend(revenueTrend)
                .pendingModeration(pendingModeration)
                .openFraudAlerts(openFraudAlerts)
                .activeAdmins(activeAdmins)
                .pendingEmployers(pendingEmployers)
                .verifiedEmployers(verifiedEmployers)
                .growthData(growthData)
                .topCities(topCities)
                .build();
    }

    private int calcTrendPercent(long current, long previous) {
        if (previous == 0) return current > 0 ? 100 : 0;
        return (int) Math.round(((double)(current - previous) / previous) * 100);
    }

    private int calcTrendPercent(BigDecimal current, BigDecimal previous) {
        if (previous.signum() == 0) return current.signum() > 0 ? 100 : 0;
        return current.subtract(previous)
                .multiply(BigDecimal.valueOf(100))
                .divide(previous, 0, RoundingMode.HALF_UP)
                .intValue();
    }
}
