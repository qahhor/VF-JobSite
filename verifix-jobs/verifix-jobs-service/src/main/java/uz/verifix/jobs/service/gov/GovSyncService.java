package uz.verifix.jobs.service.gov;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.verifix.jobs.domain.entity.*;
import uz.verifix.jobs.domain.enums.*;
import uz.verifix.jobs.domain.repository.EmployerRepository;
import uz.verifix.jobs.domain.repository.GovSyncLogRepository;
import uz.verifix.jobs.domain.repository.VacancyRepository;
import uz.verifix.jobs.integration.gov.GovClientRouter;
import uz.verifix.jobs.integration.gov.GovSyncClient;
import uz.verifix.jobs.integration.gov.GovSyncResult;
import uz.verifix.jobs.integration.gov.GovVacancyData;

import java.time.Instant;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class GovSyncService {

    private static final int MAX_RETRY_ATTEMPTS = 3;

    private final GovClientRouter clientRouter;
    private final GovSyncLogRepository syncLogRepository;
    private final VacancyRepository vacancyRepository;
    private final EmployerRepository employerRepository;

    @Transactional
    public GovSyncResult exportVacancy(Vacancy vacancy, GovSyncSource source) {
        String idempotencyKey = source + ":vacancy:" + vacancy.getId();
        if (syncLogRepository.existsByIdempotencyKey(idempotencyKey)) {
            log.debug("Skipping duplicate export: {}", idempotencyKey);
            return GovSyncResult.ok("already_synced");
        }

        GovSyncLog syncLog = createLog(source, SyncDirection.EXPORT, "VACANCY", vacancy.getId(), idempotencyKey);

        Map<String, Object> data = Map.of(
                "title", vacancy.getTitle(),
                "description", vacancy.getDescription() != null ? vacancy.getDescription() : "",
                "category", vacancy.getCategory() != null ? vacancy.getCategory() : "",
                "city", vacancy.getCity() != null ? vacancy.getCity() : "",
                "employer_inn", vacancy.getEmployer().getInn() != null ? vacancy.getEmployer().getInn() : "",
                "employer_name", vacancy.getEmployer().getName(),
                "salary_from", vacancy.getSalaryFrom() != null ? vacancy.getSalaryFrom() : 0,
                "salary_to", vacancy.getSalaryTo() != null ? vacancy.getSalaryTo() : 0,
                "positions_count", vacancy.getPositionsCount() != null ? vacancy.getPositionsCount() : 1
        );

        GovSyncClient client = clientRouter.getClient(source);
        GovSyncResult result = client.exportVacancy(data);

        updateLog(syncLog, result);
        return result;
    }

    @Transactional
    public GovSyncResult exportEmployer(Employer employer, GovSyncSource source) {
        String idempotencyKey = source + ":employer:" + employer.getId();
        if (syncLogRepository.existsByIdempotencyKey(idempotencyKey)) {
            return GovSyncResult.ok("already_synced");
        }

        GovSyncLog syncLog = createLog(source, SyncDirection.EXPORT, "EMPLOYER", employer.getId(), idempotencyKey);

        Map<String, Object> data = Map.of(
                "name", employer.getName(),
                "inn", employer.getInn() != null ? employer.getInn() : "",
                "legal_name", employer.getLegalName() != null ? employer.getLegalName() : "",
                "city", employer.getCity() != null ? employer.getCity() : "",
                "industry", employer.getIndustry() != null ? employer.getIndustry() : ""
        );

        GovSyncClient client = clientRouter.getClient(source);
        GovSyncResult result = client.exportEmployer(data);

        updateLog(syncLog, result);
        return result;
    }

    @Transactional
    public GovSyncResult reportHiring(Application application, GovSyncSource source) {
        String idempotencyKey = source + ":hiring:" + application.getId();
        if (syncLogRepository.existsByIdempotencyKey(idempotencyKey)) {
            return GovSyncResult.ok("already_reported");
        }

        GovSyncLog syncLog = createLog(source, SyncDirection.EXPORT, "HIRING", application.getId(), idempotencyKey);

        Map<String, Object> data = new HashMap<>();
        data.put("candidate_name", (application.getCandidate().getFirstName() != null ? application.getCandidate().getFirstName() : "") +
                " " + (application.getCandidate().getLastName() != null ? application.getCandidate().getLastName() : ""));
        data.put("candidate_phone", application.getCandidate().getPhone());
        data.put("employer_inn", application.getVacancy().getEmployer().getInn());
        data.put("employer_name", application.getVacancy().getEmployer().getName());
        data.put("position", application.getVacancy().getTitle());
        data.put("hired_at", application.getHiredAt() != null ? application.getHiredAt().toString() : Instant.now().toString());

        GovSyncClient client = clientRouter.getClient(source);
        GovSyncResult result = client.reportHiring(data);

        updateLog(syncLog, result);
        return result;
    }

    @Transactional
    public int importVacancies(GovSyncSource source) {
        GovSyncClient client = clientRouter.getClient(source);
        List<GovVacancyData> imported = client.importVacancies();

        int count = 0;
        for (GovVacancyData data : imported) {
            String idempotencyKey = source + ":import:" + data.getExternalId();
            if (syncLogRepository.existsByIdempotencyKey(idempotencyKey)) continue;

            // Find or skip employer
            Employer employer = null;
            if (data.getEmployerInn() != null && !data.getEmployerInn().isBlank()) {
                employer = employerRepository.findByInn(data.getEmployerInn()).orElse(null);
            }
            if (employer == null) continue;

            Vacancy vacancy = Vacancy.builder()
                    .employer(employer)
                    .title(data.getTitle())
                    .description(data.getDescription())
                    .category(data.getCategory())
                    .city(data.getCity())
                    .region(data.getRegion())
                    .salaryFrom(data.getSalaryFrom())
                    .salaryTo(data.getSalaryTo())
                    .positionsCount(data.getPositionsCount())
                    .status(VacancyStatus.DRAFT)
                    .moderationStatus(ModerationStatus.PENDING)
                    .source(source == GovSyncSource.ARGOS ? VacancySource.ARGOS : VacancySource.ISH_MEHNAT)
                    .build();
            vacancyRepository.save(vacancy);

            GovSyncLog syncLog = createLog(source, SyncDirection.IMPORT, "VACANCY", vacancy.getId(), idempotencyKey);
            syncLog.setSyncStatus(SyncStatus.SYNCED);
            syncLog.setSyncedAt(Instant.now());
            syncLogRepository.save(syncLog);
            count++;
        }

        log.info("Imported {} vacancies from {}", count, source);
        return count;
    }

    @Transactional
    public int retryFailed() {
        List<GovSyncLog> failed = syncLogRepository.findBySourceInAndSyncStatus(
                List.of(GovSyncSource.ARGOS, GovSyncSource.ENST, GovSyncSource.ISH_MEHNAT),
                SyncStatus.FAILED);

        int retried = 0;
        for (GovSyncLog entry : failed) {
            // Skip if already retried too many times (simple heuristic)
            if (entry.getErrorMessage() != null && entry.getErrorMessage().startsWith("RETRY_")) continue;

            entry.setSyncStatus(SyncStatus.PENDING);
            entry.setErrorMessage("RETRY_" + (entry.getErrorMessage() != null ? entry.getErrorMessage() : ""));
            syncLogRepository.save(entry);
            retried++;
        }
        return retried;
    }

    @Transactional(readOnly = true)
    public Page<GovSyncLog> getSyncHistory(GovSyncSource source, Pageable pageable) {
        return syncLogRepository.findBySourceOrderByCreatedAtDesc(source, pageable);
    }

    private GovSyncLog createLog(GovSyncSource source, SyncDirection direction, String entityType,
                                  UUID entityId, String idempotencyKey) {
        GovSyncLog syncLog = GovSyncLog.builder()
                .source(source)
                .direction(direction)
                .entityType(entityType)
                .entityId(entityId)
                .syncStatus(SyncStatus.PENDING)
                .idempotencyKey(idempotencyKey)
                .build();
        return syncLogRepository.save(syncLog);
    }

    private void updateLog(GovSyncLog syncLog, GovSyncResult result) {
        if (result.isSuccess()) {
            syncLog.setSyncStatus(SyncStatus.SYNCED);
            syncLog.setSyncedAt(Instant.now());
        } else {
            syncLog.setSyncStatus(SyncStatus.FAILED);
            syncLog.setErrorMessage(result.getErrorMessage());
        }
        syncLogRepository.save(syncLog);
    }
}
