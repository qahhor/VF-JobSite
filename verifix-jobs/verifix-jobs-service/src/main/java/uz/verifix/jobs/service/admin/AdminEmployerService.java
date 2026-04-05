package uz.verifix.jobs.service.admin;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.verifix.jobs.common.exception.ResourceNotFoundException;
import uz.verifix.jobs.domain.entity.Employer;
import uz.verifix.jobs.domain.enums.EmployerStatus;
import uz.verifix.jobs.domain.enums.VacancyStatus;
import uz.verifix.jobs.domain.repository.EmployerRepository;
import uz.verifix.jobs.domain.repository.VacancyRepository;

import java.time.Instant;
import java.util.EnumSet;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminEmployerService {

    private static final Set<EmployerStatus> DEACTIVATED_STATUSES =
            EnumSet.of(EmployerStatus.BLOCKED, EmployerStatus.SUSPENDED, EmployerStatus.INACTIVE);

    private final EmployerRepository employerRepository;
    private final VacancyRepository vacancyRepository;

    // ── List ──────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<Employer> list(EmployerStatus status, String search, Pageable pageable) {
        boolean hasSearch = search != null && !search.isBlank();
        if (status != null && hasSearch) {
            return employerRepository.findByStatusAndNameContainingIgnoreCase(status, search.trim(), pageable);
        }
        if (status != null) {
            return employerRepository.findByStatus(status, pageable);
        }
        if (hasSearch) {
            return employerRepository.findByNameContainingIgnoreCase(search.trim(), pageable);
        }
        return employerRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Employer getById(UUID id) {
        return employerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employer", id.toString()));
    }

    public long countTotal(UUID employerId) {
        return vacancyRepository.countByEmployerId(employerId);
    }

    // ── Create ────────────────────────────────────────────────────────────────

    @Transactional
    public Employer create(String name, String inn, String legalName, String city, String region,
                           String industry, String websiteUrl, String employeeCountRange,
                           Integer foundedYear, String description,
                           EmployerStatus status, Boolean isVerified, String deactivationReason) {
        EmployerStatus initialStatus = status != null ? status : EmployerStatus.ACTIVE;
        Instant now = Instant.now();

        Employer.EmployerBuilder builder = Employer.builder()
                .name(name)
                .inn(inn)
                .legalName(legalName)
                .city(city)
                .region(region)
                .industry(industry)
                .websiteUrl(websiteUrl)
                .employeeCountRange(employeeCountRange)
                .foundedYear(foundedYear)
                .description(description)
                .status(initialStatus);

        if (Boolean.TRUE.equals(isVerified)) {
            builder.isVerified(true).verifiedAt(now);
        }
        if (DEACTIVATED_STATUSES.contains(initialStatus)) {
            builder.deactivatedAt(now).deactivationReason(deactivationReason);
        }

        Employer employer = builder.build();
        log.info("Admin created employer: {} (status={})", name, initialStatus);
        return employerRepository.save(employer);
    }

    // ── Update ────────────────────────────────────────────────────────────────

    @Transactional
    public Employer update(UUID id, String name, String inn, String legalName, String city, String region,
                           String industry, String websiteUrl, String employeeCountRange,
                           Integer foundedYear, String description,
                           EmployerStatus status, Boolean isVerified, String deactivationReason) {
        Employer employer = employerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employer", id.toString()));

        if (name != null)                  employer.setName(name);
        if (inn != null)                   employer.setInn(inn);
        if (legalName != null)             employer.setLegalName(legalName);
        if (city != null)                  employer.setCity(city);
        if (region != null)                employer.setRegion(region);
        if (industry != null)              employer.setIndustry(industry);
        if (websiteUrl != null)            employer.setWebsiteUrl(websiteUrl);
        if (employeeCountRange != null)    employer.setEmployeeCountRange(employeeCountRange);
        if (foundedYear != null)           employer.setFoundedYear(foundedYear);
        if (description != null)           employer.setDescription(description);

        // Status change with lifecycle timestamps
        if (status != null && status != employer.getStatus()) {
            applyStatusChange(employer, status, deactivationReason);
        }

        // Verification toggle
        if (isVerified != null) {
            boolean wasVerified = Boolean.TRUE.equals(employer.getIsVerified());
            employer.setIsVerified(isVerified);
            if (isVerified && !wasVerified) {
                employer.setVerifiedAt(Instant.now());
            } else if (!isVerified && wasVerified) {
                employer.setVerifiedAt(null);
            }
        }

        log.info("Admin updated employer {} (status={}, verified={})", id, employer.getStatus(), employer.getIsVerified());
        return employerRepository.save(employer);
    }

    // ── Delete ────────────────────────────────────────────────────────────────

    @Transactional
    public void delete(UUID id) {
        Employer employer = employerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employer", id.toString()));
        long activeCount = vacancyRepository.countByEmployerIdAndStatus(id, VacancyStatus.ACTIVE);
        if (activeCount > 0) {
            throw new IllegalStateException("Cannot delete employer with " + activeCount + " active vacancies");
        }
        employerRepository.delete(employer);
        log.info("Admin deleted employer {}", id);
    }

    // ── Status actions ────────────────────────────────────────────────────────

    @Transactional
    public Employer changeStatus(UUID employerId, EmployerStatus newStatus, String deactivationReason) {
        Employer employer = employerRepository.findById(employerId)
                .orElseThrow(() -> new ResourceNotFoundException("Employer", employerId.toString()));
        applyStatusChange(employer, newStatus, deactivationReason);
        log.info("Employer {} status changed to {}", employerId, newStatus);
        return employerRepository.save(employer);
    }

    /** @deprecated use changeStatus(id, status, reason) */
    @Transactional
    public Employer changeStatus(UUID employerId, EmployerStatus newStatus) {
        return changeStatus(employerId, newStatus, null);
    }

    @Transactional
    public Employer verify(UUID employerId) {
        Employer employer = employerRepository.findById(employerId)
                .orElseThrow(() -> new ResourceNotFoundException("Employer", employerId.toString()));
        employer.setIsVerified(true);
        employer.setVerifiedAt(Instant.now());
        if (employer.getStatus() == EmployerStatus.PENDING) {
            employer.setStatus(EmployerStatus.ACTIVE);
        }
        log.info("Employer {} verified at {}", employerId, employer.getVerifiedAt());
        return employerRepository.save(employer);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private void applyStatusChange(Employer employer, EmployerStatus newStatus, String reason) {
        employer.setStatus(newStatus);
        if (DEACTIVATED_STATUSES.contains(newStatus)) {
            employer.setDeactivatedAt(Instant.now());
            if (reason != null && !reason.isBlank()) {
                employer.setDeactivationReason(reason);
            }
        } else if (newStatus == EmployerStatus.ACTIVE) {
            // Clear deactivation data when re-activating
            employer.setDeactivatedAt(null);
            employer.setDeactivationReason(null);
        }
    }
}
