package uz.verifix.jobs.service.admin;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uz.verifix.jobs.common.dto.SystemOverviewResponse;
import uz.verifix.jobs.domain.enums.ApplicationStatus;
import uz.verifix.jobs.domain.enums.EmployerStatus;
import uz.verifix.jobs.domain.enums.ModerationStatus;
import uz.verifix.jobs.domain.enums.VacancyStatus;
import uz.verifix.jobs.domain.repository.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminDashboardServiceTest {

    @Mock private EmployerRepository employerRepository;
    @Mock private CandidateRepository candidateRepository;
    @Mock private VacancyRepository vacancyRepository;
    @Mock private ApplicationRepository applicationRepository;
    @Mock private ModerationQueueRepository moderationQueueRepository;
    @Mock private FraudAlertRepository fraudAlertRepository;
    @Mock private AdminUserRepository adminUserRepository;
    @Mock private PaymentRepository paymentRepository;

    @InjectMocks
    private AdminDashboardService service;

    @Test
    void getOverview_returnsTotalUsers() {
        stubAllRepositories(50, 40, 30, 20, BigDecimal.valueOf(100000), BigDecimal.valueOf(170000));

        SystemOverviewResponse result = service.getOverview();

        assertThat(result.getTotalUsers()).isEqualTo(1200L);
        assertThat(result.getTotalCandidates()).isEqualTo(1000L);
        assertThat(result.getTotalEmployers()).isEqualTo(200L);
    }

    @Test
    void getOverview_returnsCoreCounts() {
        stubAllRepositories(50, 40, 30, 20, BigDecimal.valueOf(100000), BigDecimal.valueOf(170000));

        SystemOverviewResponse result = service.getOverview();

        assertThat(result.getTotalVacancies()).isEqualTo(500L);
        assertThat(result.getActiveVacancies()).isEqualTo(150L);
        assertThat(result.getTotalApplications()).isEqualTo(3000L);
        assertThat(result.getTotalHired()).isEqualTo(400L);
    }

    @Test
    void getOverview_calculatesPositiveUsersTrend() {
        stubAllRepositories(60, 40, 30, 20, BigDecimal.valueOf(100000), BigDecimal.valueOf(170000));

        SystemOverviewResponse result = service.getOverview();

        assertThat(result.getUsersTrend()).isEqualTo(50); // (60-40)/40 * 100
    }

    @Test
    void getOverview_calculatesNegativeVacanciesTrend() {
        stubAllRepositories(50, 40, 20, 30, BigDecimal.valueOf(100000), BigDecimal.valueOf(170000));

        SystemOverviewResponse result = service.getOverview();

        assertThat(result.getVacanciesTrend()).isEqualTo(-33); // (20-30)/30 * 100
    }

    @Test
    void getOverview_handlesZeroPreviousPeriod() {
        stubAllRepositories(50, 0, 30, 0, BigDecimal.valueOf(100000), BigDecimal.ZERO);

        SystemOverviewResponse result = service.getOverview();

        assertThat(result.getUsersTrend()).isEqualTo(100);
        assertThat(result.getVacanciesTrend()).isEqualTo(100);
    }

    @Test
    void getOverview_handlesZeroBothPeriods() {
        stubAllRepositories(0, 0, 0, 0, BigDecimal.ZERO, BigDecimal.ZERO);

        SystemOverviewResponse result = service.getOverview();

        assertThat(result.getUsersTrend()).isEqualTo(0);
        assertThat(result.getVacanciesTrend()).isEqualTo(0);
        assertThat(result.getRevenueTrend()).isEqualTo(0);
    }

    @Test
    void getOverview_calculatesRevenueTrend() {
        // monthlyRevenue=150000, sinceRevenue=250000 => prevMonth=100000 => trend=+50%
        stubAllRepositories(50, 40, 30, 20, BigDecimal.valueOf(150000), BigDecimal.valueOf(250000));

        SystemOverviewResponse result = service.getOverview();

        assertThat(result.getRevenueTrend()).isEqualTo(50);
    }

    @Test
    void getOverview_returnsAdminSpecificMetrics() {
        stubAllRepositories(50, 40, 30, 20, BigDecimal.valueOf(100000), BigDecimal.valueOf(170000));

        SystemOverviewResponse result = service.getOverview();

        assertThat(result.getPendingModeration()).isEqualTo(15L);
        assertThat(result.getOpenFraudAlerts()).isEqualTo(3L);
        assertThat(result.getActiveAdmins()).isEqualTo(5L);
        assertThat(result.getPendingEmployers()).isEqualTo(10L);
        assertThat(result.getVerifiedEmployers()).isEqualTo(180L);
    }

    @Test
    void getOverview_returnsMonthlyRevenue() {
        BigDecimal revenue = BigDecimal.valueOf(500000);
        stubAllRepositories(50, 40, 30, 20, revenue, BigDecimal.valueOf(800000));

        SystemOverviewResponse result = service.getOverview();

        assertThat(result.getMonthlyRevenue()).isEqualByComparingTo(revenue);
    }

    private void stubAllRepositories(long candidatesLast7d, long candidatesPrev7d,
                                     long vacanciesLast7d, long vacanciesPrev7d,
                                     BigDecimal monthlyRevenue, BigDecimal sinceRevenue) {
        when(candidateRepository.count()).thenReturn(1000L);
        when(employerRepository.count()).thenReturn(200L);
        when(vacancyRepository.count()).thenReturn(500L);
        when(vacancyRepository.countByStatus(VacancyStatus.ACTIVE)).thenReturn(150L);
        when(applicationRepository.count()).thenReturn(3000L);
        when(applicationRepository.countByStatus(ApplicationStatus.HIRED)).thenReturn(400L);

        when(candidateRepository.countByCreatedAtAfter(any(Instant.class)))
                .thenReturn(candidatesLast7d)
                .thenReturn(candidatesLast7d + candidatesPrev7d);

        when(vacancyRepository.countByCreatedAtAfter(any(Instant.class)))
                .thenReturn(vacanciesLast7d)
                .thenReturn(vacanciesLast7d + vacanciesPrev7d);

        long appsToday = 30;
        when(applicationRepository.countByAppliedAtAfter(any(Instant.class)))
                .thenReturn(appsToday)
                .thenReturn(appsToday + 25);

        when(paymentRepository.sumCompletedAmountSince(any(Instant.class)))
                .thenReturn(monthlyRevenue)
                .thenReturn(sinceRevenue);

        when(moderationQueueRepository.countByStatus(ModerationStatus.PENDING)).thenReturn(15L);
        when(fraudAlertRepository.countByReviewedFalse()).thenReturn(3L);
        when(adminUserRepository.count()).thenReturn(5L);
        when(employerRepository.countByStatus(EmployerStatus.PENDING)).thenReturn(10L);
        when(employerRepository.countByIsVerifiedTrue()).thenReturn(180L);

        when(candidateRepository.countByMonthSince(any(Instant.class)))
                .thenReturn(List.of(new Object[]{"2026-01", 50L}, new Object[]{"2026-02", 60L}));
        when(vacancyRepository.findCityStats())
                .thenReturn(List.of(new Object[]{"Tashkent", 80L, BigDecimal.valueOf(5000000)},
                        new Object[]{"Samarkand", 40L, BigDecimal.valueOf(3000000)}));
    }
}
