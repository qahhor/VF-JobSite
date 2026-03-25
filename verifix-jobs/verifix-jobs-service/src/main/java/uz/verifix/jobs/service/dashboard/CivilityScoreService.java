package uz.verifix.jobs.service.dashboard;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.verifix.jobs.domain.repository.ApplicationRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.UUID;

/**
 * Employer civility score — measures how well employers treat candidates.
 * Impacts employer visibility and trust badges on the marketplace.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CivilityScoreService {

    private final ApplicationRepository applicationRepository;

    public record CivilityScore(
            UUID employerId, double responseRate, double avgResponseTimeHours,
            double ignoredCandidatesPct, double cleanClosureRate,
            int overallScore, String grade, String summary
    ) {}

    @Transactional(readOnly = true)
    public CivilityScore calculate(UUID employerId) {
        long total = applicationRepository.countByVacancy_EmployerId(employerId);
        if (total == 0) return new CivilityScore(employerId, 0, 0, 0, 0, 50, "C", "Hali arizalar yo'q");

        long viewed = applicationRepository.countByVacancy_EmployerIdAndViewedAtIsNotNull(employerId);
        long ignored = total - viewed;
        long closed = applicationRepository.countByVacancy_EmployerIdAndStatusIn(employerId,
                java.util.List.of("HIRED", "REJECTED", "WITHDRAWN"));

        double responseRate = (double) viewed / total * 100;
        double ignoredPct = (double) ignored / total * 100;
        double closureRate = total > 0 ? (double) closed / total * 100 : 0;

        int score = 50;
        if (responseRate >= 90) score += 25;
        else if (responseRate >= 70) score += 15;
        else if (responseRate >= 50) score += 5;
        else score -= 10;

        if (ignoredPct <= 10) score += 15;
        else if (ignoredPct <= 30) score += 5;
        else score -= 10;

        if (closureRate >= 80) score += 10;
        else if (closureRate >= 50) score += 5;

        score = Math.min(Math.max(score, 0), 100);
        String grade = score >= 80 ? "A" : score >= 60 ? "B" : score >= 40 ? "C" : "D";

        String summary = switch (grade) {
            case "A" -> "A'lo! Nomzodlarga tez va mas'uliyatli javob berasiz.";
            case "B" -> "Yaxshi. Javob tezligini oshiring.";
            case "C" -> "O'rtacha. Nomzodlarni e'tiborsiz qoldirmang.";
            default -> "Past. Nomzodlarga javob berish kerak.";
        };

        return new CivilityScore(employerId, Math.round(responseRate * 10) / 10.0,
                0, Math.round(ignoredPct * 10) / 10.0,
                Math.round(closureRate * 10) / 10.0, score, grade, summary);
    }
}
