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

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminEmployerService {

    private final EmployerRepository employerRepository;
    private final VacancyRepository vacancyRepository;

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

    @Transactional
    public Employer create(String name, String inn, String legalName, String city, String region,
                           String industry, String websiteUrl, String employeeCountRange,
                           Integer foundedYear, String description) {
        Employer employer = Employer.builder()
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
                .status(EmployerStatus.ACTIVE)
                .build();
        log.info("Admin created employer: {}", name);
        return employerRepository.save(employer);
    }

    @Transactional
    public Employer update(UUID id, String name, String inn, String legalName, String city, String region,
                           String industry, String websiteUrl, String employeeCountRange,
                           Integer foundedYear, String description) {
        Employer employer = employerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employer", id.toString()));
        if (name != null) employer.setName(name);
        if (inn != null) employer.setInn(inn);
        if (legalName != null) employer.setLegalName(legalName);
        if (city != null) employer.setCity(city);
        if (region != null) employer.setRegion(region);
        if (industry != null) employer.setIndustry(industry);
        if (websiteUrl != null) employer.setWebsiteUrl(websiteUrl);
        if (employeeCountRange != null) employer.setEmployeeCountRange(employeeCountRange);
        if (foundedYear != null) employer.setFoundedYear(foundedYear);
        if (description != null) employer.setDescription(description);
        log.info("Admin updated employer {}", id);
        return employerRepository.save(employer);
    }

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

    @Transactional
    public Employer changeStatus(UUID employerId, EmployerStatus newStatus) {
        Employer employer = employerRepository.findById(employerId)
                .orElseThrow(() -> new ResourceNotFoundException("Employer", employerId.toString()));
        employer.setStatus(newStatus);
        log.info("Employer {} status changed to {}", employerId, newStatus);
        return employerRepository.save(employer);
    }

    @Transactional
    public Employer verify(UUID employerId) {
        Employer employer = employerRepository.findById(employerId)
                .orElseThrow(() -> new ResourceNotFoundException("Employer", employerId.toString()));
        employer.setIsVerified(true);
        employer.setStatus(EmployerStatus.ACTIVE);
        log.info("Employer {} verified", employerId);
        return employerRepository.save(employer);
    }
}
