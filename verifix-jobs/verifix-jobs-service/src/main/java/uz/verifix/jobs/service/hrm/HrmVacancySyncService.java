package uz.verifix.jobs.service.hrm;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.verifix.jobs.domain.entity.*;
import uz.verifix.jobs.domain.enums.VacancySource;
import uz.verifix.jobs.domain.enums.VacancyStatus;
import uz.verifix.jobs.domain.repository.*;
import uz.verifix.jobs.integration.verifix.HrmVacancy;
import uz.verifix.jobs.integration.verifix.VerifixHrmClient;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Bidirectional vacancy sync between HRM (hrec_vacancies) and Jobs portal.
 * HRM → Jobs: imports open HRM vacancies as ACTIVE vacancies in Jobs.
 * Uses modified_id cursor for incremental sync.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class HrmVacancySyncService {

    private final VerifixHrmClient hrmClient;
    private final VacancyRepository vacancyRepository;
    private final EmployerRepository employerRepository;
    private final HrmVacancyMappingRepository mappingRepository;
    private final HrmSyncLogRepository syncLogRepository;

    @Scheduled(cron = "0 */30 * * * *", zone = "Asia/Tashkent")
    @SchedulerLock(name = "hrmVacancySync", lockAtLeastFor = "5m", lockAtMostFor = "25m")
    public void syncVacanciesFromHrm() {
        log.info("Starting HRM vacancy sync");

        List<Employer> hrmEmployers = employerRepository.findByHrmSyncEnabledTrue();
        int synced = 0;

        for (Employer employer : hrmEmployers) {
            if (employer.getHrmCompanyId() == null) continue;

            try {
                Long lastModifiedId = getLastModifiedId(employer.getHrmCompanyId());
                List<HrmVacancy> hrmVacancies = hrmClient.getOpenVacancies(
                        UUID.fromString(employer.getHrmCompanyId()), lastModifiedId);

                for (HrmVacancy hrmVac : hrmVacancies) {
                    synced += syncSingleVacancy(employer, hrmVac);
                }
            } catch (Exception e) {
                log.error("HRM vacancy sync failed for employer {}: {}", employer.getId(), e.getMessage());
                logSync("VACANCY_IMPORT", "IMPORT", "EMPLOYER", employer.getId(), null, "FAILED", e.getMessage());
            }
        }

        log.info("HRM vacancy sync completed: {} vacancies synced", synced);
    }

    @Transactional
    public int syncSingleVacancy(Employer employer, HrmVacancy hrmVac) {
        String hrmCompanyId = employer.getHrmCompanyId();

        if (mappingRepository.existsByHrmCompanyIdAndHrmVacancyId(hrmCompanyId, hrmVac.getVacancyId())) {
            // Update existing
            mappingRepository.findByHrmCompanyIdAndHrmVacancyId(hrmCompanyId, hrmVac.getVacancyId())
                    .ifPresent(mapping -> {
                        vacancyRepository.findById(mapping.getJobsVacancyId()).ifPresent(vacancy -> {
                            updateVacancyFromHrm(vacancy, hrmVac);
                            vacancyRepository.save(vacancy);
                            mapping.setLastModifiedId(hrmVac.getModifiedId());
                            mappingRepository.save(mapping);
                        });
                    });
            return 0;
        }

        // Create new vacancy
        Vacancy vacancy = Vacancy.builder()
                .employer(employer)
                .title(hrmVac.getName())
                .description(hrmVac.getDescriptionHtml() != null ? hrmVac.getDescriptionHtml() : hrmVac.getDescription())
                .category(mapJobCategory(hrmVac.getJobName()))
                .city(hrmVac.getRegionName())
                .salaryFrom(hrmVac.getWageFrom())
                .salaryTo(hrmVac.getWageTo())
                .currency("UZS")
                .positionsCount(hrmVac.getQuantity())
                .positionsFilled(0)
                .status(VacancyStatus.ACTIVE)
                .source(VacancySource.IMPORT)
                .isMassHiring(hrmVac.getQuantity() > 5)
                .build();

        if (hrmVac.getDeadline() != null) {
            vacancy.setExpiresAt(hrmVac.getDeadline().atStartOfDay(java.time.ZoneId.of("Asia/Tashkent")).toInstant());
        }

        vacancy = vacancyRepository.save(vacancy);

        HrmVacancyMapping mapping = HrmVacancyMapping.builder()
                .hrmCompanyId(hrmCompanyId)
                .hrmVacancyId(hrmVac.getVacancyId())
                .jobsVacancyId(vacancy.getId())
                .lastModifiedId(hrmVac.getModifiedId())
                .syncDirection("HRM_TO_JOBS")
                .build();
        mappingRepository.save(mapping);

        logSync("VACANCY_IMPORT", "IMPORT", "VACANCY", vacancy.getId(),
                hrmVac.getVacancyId().toString(), "SYNCED", null);

        log.info("Imported HRM vacancy '{}' as Jobs vacancy {}", hrmVac.getName(), vacancy.getId());
        return 1;
    }

    private void updateVacancyFromHrm(Vacancy vacancy, HrmVacancy hrmVac) {
        vacancy.setTitle(hrmVac.getName());
        if (hrmVac.getDescriptionHtml() != null) vacancy.setDescription(hrmVac.getDescriptionHtml());
        vacancy.setSalaryFrom(hrmVac.getWageFrom());
        vacancy.setSalaryTo(hrmVac.getWageTo());
        vacancy.setPositionsCount(hrmVac.getQuantity());
        if ("C".equals(hrmVac.getStatus())) {
            vacancy.setStatus(VacancyStatus.CLOSED);
        }
    }

    private Long getLastModifiedId(String hrmCompanyId) {
        return mappingRepository.findAll().stream()
                .filter(m -> hrmCompanyId.equals(m.getHrmCompanyId()))
                .map(HrmVacancyMapping::getLastModifiedId)
                .filter(java.util.Objects::nonNull)
                .max(Long::compare)
                .orElse(null);
    }

    private String mapJobCategory(String hrmJobName) {
        if (hrmJobName == null) return "OTHER";
        String lower = hrmJobName.toLowerCase();
        if (lower.contains("oshpaz") || lower.contains("cook") || lower.contains("повар")) return "COOK";
        if (lower.contains("haydovchi") || lower.contains("driver") || lower.contains("водитель")) return "DRIVER";
        if (lower.contains("sotuvchi") || lower.contains("sales") || lower.contains("продавец")) return "SALES";
        if (lower.contains("quruvchi") || lower.contains("builder") || lower.contains("строитель")) return "BUILDER";
        if (lower.contains("elektrik") || lower.contains("electrician")) return "ELECTRICIAN";
        if (lower.contains("santexnik") || lower.contains("plumber")) return "PLUMBER";
        if (lower.contains("qorovul") || lower.contains("security") || lower.contains("охранник")) return "SECURITY";
        return "OTHER";
    }

    private void logSync(String syncType, String direction, String entityType,
                         UUID jobsEntityId, String hrmEntityId, String status, String error) {
        syncLogRepository.save(HrmSyncLog.builder()
                .syncType(syncType).direction(direction).entityType(entityType)
                .jobsEntityId(jobsEntityId).hrmEntityId(hrmEntityId)
                .syncStatus(status).errorMessage(error).build());
    }
}
