package uz.verifix.jobs.service.dashboard;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.verifix.jobs.domain.entity.Vacancy;
import uz.verifix.jobs.domain.enums.VacancyStatus;
import uz.verifix.jobs.domain.repository.ApplicationRepository;
import uz.verifix.jobs.domain.repository.VacancyRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

/**
 * Vacancy health diagnostics — analyzes each vacancy's performance
 * and provides actionable recommendations.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class VacancyHealthService {

    private final VacancyRepository vacancyRepository;
    private final ApplicationRepository applicationRepository;

    public record VacancyHealth(
            UUID vacancyId, String title, int impressions, int detailViews, int applies,
            double conversionRate, Double avgResponseTimeHours,
            String salaryCompetitiveness, String geoCompetitiveness,
            int healthScore, String healthGrade, List<String> recommendations
    ) {}

    @Transactional(readOnly = true)
    public VacancyHealth diagnose(UUID vacancyId) {
        Vacancy v = vacancyRepository.findById(vacancyId).orElse(null);
        if (v == null) return null;

        int views = v.getViewCount() != null ? v.getViewCount() : 0;
        int applies = v.getApplyCount() != null ? v.getApplyCount() : 0;
        double conversion = views > 0 ? (double) applies / views * 100 : 0;

        // Salary competitiveness
        String salaryComp = assessSalaryCompetitiveness(v);

        // Build recommendations
        List<String> recommendations = new ArrayList<>();
        int score = 100;

        if (views < 50) { recommendations.add("Vakansiya ko'rishlar soni past. Promosyon yoki Telegram kanal e'lonini ko'rib chiqing."); score -= 15; }
        if (conversion < 2.0 && views > 50) { recommendations.add("Konversiya past. Vakansiya tavsifini yaxshilang, maoshni ko'rsating."); score -= 20; }
        if (v.getSalaryFrom() == null && v.getSalaryTo() == null) { recommendations.add("Maosh ko'rsatilmagan. Maosh ko'rsatilgan vakansiyalar 3x ko'proq ariza oladi."); score -= 15; }
        if (v.getDescription() == null || v.getDescription().length() < 100) { recommendations.add("Tavsif juda qisqa. Kamida 200 belgi yozing."); score -= 10; }
        if (v.getBenefits() == null || v.getBenefits().length == 0) { recommendations.add("Imtiyozlar ko'rsatilmagan. Ovqat, transport, turar-joy kabi imtiyozlarni qo'shing."); score -= 10; }
        if ("LOW".equals(salaryComp)) { recommendations.add("Maosh bozor o'rtachasidan past. Raqobatdosh maosh belgilang."); score -= 15; }
        if (applies == 0 && views > 20) { recommendations.add("Ko'rishlar bor, lekin ariza yo'q. Ariza topshirish jarayonini soddalashtiring."); score -= 20; }

        score = Math.max(score, 0);
        String grade = score >= 80 ? "A" : score >= 60 ? "B" : score >= 40 ? "C" : "D";

        return new VacancyHealth(v.getId(), v.getTitle(), views, views, applies,
                Math.round(conversion * 100) / 100.0, null,
                salaryComp, "AVERAGE", score, grade, recommendations);
    }

    @Transactional(readOnly = true)
    public List<VacancyHealth> diagnoseAll(UUID employerId) {
        return vacancyRepository.findByEmployerIdAndStatus(employerId, VacancyStatus.ACTIVE).stream()
                .map(v -> diagnose(v.getId()))
                .filter(Objects::nonNull)
                .sorted(Comparator.comparingInt(VacancyHealth::healthScore))
                .toList();
    }

    private String assessSalaryCompetitiveness(Vacancy v) {
        if (v.getSalaryFrom() == null) return "UNKNOWN";
        java.util.List<Object[]> statsList = vacancyRepository.findSalaryStatsByCategoryAndCity(v.getCategory(), v.getCity());
        if (statsList == null || statsList.isEmpty()) return "UNKNOWN"; Object[] stats = statsList.get(0);
        BigDecimal avg = (BigDecimal) stats[0];
        if (avg == null) return "UNKNOWN";
        int cmp = v.getSalaryFrom().compareTo(avg);
        if (cmp >= 0) return "HIGH";
        if (v.getSalaryFrom().compareTo(avg.multiply(BigDecimal.valueOf(0.8))) >= 0) return "AVERAGE";
        return "LOW";
    }
}
