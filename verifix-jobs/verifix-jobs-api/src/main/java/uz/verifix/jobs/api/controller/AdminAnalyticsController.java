package uz.verifix.jobs.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import uz.verifix.jobs.api.dto.response.SystemOverviewResponse;
import uz.verifix.jobs.domain.enums.ApplicationStatus;
import uz.verifix.jobs.domain.enums.VacancyStatus;
import uz.verifix.jobs.domain.repository.ApplicationRepository;
import uz.verifix.jobs.domain.repository.CandidateRepository;
import uz.verifix.jobs.domain.repository.EmployerRepository;
import uz.verifix.jobs.domain.repository.VacancyRepository;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@RestController
@RequestMapping("/api/v1/admin/analytics")
@RequiredArgsConstructor
public class AdminAnalyticsController {

    private final EmployerRepository employerRepository;
    private final CandidateRepository candidateRepository;
    private final VacancyRepository vacancyRepository;
    private final ApplicationRepository applicationRepository;

    @GetMapping("/overview")
    public ResponseEntity<SystemOverviewResponse> getSystemOverview() {
        Instant sevenDaysAgo = Instant.now().minus(7, ChronoUnit.DAYS);

        return ResponseEntity.ok(SystemOverviewResponse.builder()
                .totalEmployers(employerRepository.count())
                .totalCandidates(candidateRepository.count())
                .totalVacancies(vacancyRepository.count())
                .activeVacancies(vacancyRepository.countByStatus(VacancyStatus.ACTIVE))
                .totalApplications(applicationRepository.count())
                .totalHired(applicationRepository.countByStatus(ApplicationStatus.HIRED))
                .newCandidatesLast7Days(candidateRepository.countByCreatedAtAfter(sevenDaysAgo))
                .newVacanciesLast7Days(vacancyRepository.countByCreatedAtAfter(sevenDaysAgo))
                .build());
    }
}
