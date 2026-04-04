package uz.verifix.jobs.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemOverviewResponse {

    // Core counts
    private long totalEmployers;
    private long totalCandidates;
    private long totalVacancies;
    private long activeVacancies;
    private long totalApplications;
    private long totalHired;

    // 7-day metrics
    private long newCandidatesLast7Days;
    private long newVacanciesLast7Days;

    // Dashboard KPIs
    private long totalUsers;           // candidates + employers
    private long applicationsToday;    // applications created today
    private BigDecimal monthlyRevenue; // completed payments this month

    // Trends (% change vs previous period)
    private int usersTrend;
    private int vacanciesTrend;
    private int applicationsTrend;
    private int revenueTrend;

    // Admin-specific
    private long pendingModeration;
    private long openFraudAlerts;
    private long activeAdmins;
    private long pendingEmployers;
    private long verifiedEmployers;

    // Analytics charts
    private List<Long> growthData;                    // monthly user registrations (last 6 months)
    private List<Map<String, Object>> topCities;      // [{name, count}] top cities by active vacancies
}
