package uz.verifix.jobs.service.vacancy;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.verifix.jobs.common.exception.ForbiddenException;
import uz.verifix.jobs.common.exception.ResourceNotFoundException;
import uz.verifix.jobs.domain.entity.Employer;
import uz.verifix.jobs.domain.entity.Vacancy;
import uz.verifix.jobs.domain.enums.EmploymentType;
import uz.verifix.jobs.domain.enums.ModerationStatus;
import uz.verifix.jobs.domain.enums.ShiftSchedule;
import uz.verifix.jobs.domain.enums.VacancyStatus;
import uz.verifix.jobs.domain.repository.EmployerRepository;
import uz.verifix.jobs.domain.repository.VacancyRepository;
import uz.verifix.jobs.domain.specification.VacancySpecification;
import uz.verifix.jobs.service.billing.SubscriptionEnforcementService;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class VacancyService {

    private final VacancyRepository vacancyRepository;
    private final EmployerRepository employerRepository;
    private final SubscriptionEnforcementService subscriptionEnforcementService;
    private static final GeometryFactory GEOMETRY_FACTORY = new GeometryFactory(new PrecisionModel(), 4326);

    @Transactional
    public Vacancy create(UUID employerId, String title, String description, String category,
                          String city, String region, Double lat, Double lon,
                          BigDecimal salaryFrom, BigDecimal salaryTo, String currency,
                          String employmentType, String shiftSchedule, List<String> benefits,
                          Boolean isMassHiring, Integer positionsCount) {

        // Check subscription limits
        subscriptionEnforcementService.enforceVacancyLimit(employerId);

        Employer employer = employerRepository.findById(employerId)
                .orElseThrow(() -> new ResourceNotFoundException("Employer", employerId));

        Point location = null;
        if (lat != null && lon != null) {
            location = GEOMETRY_FACTORY.createPoint(new Coordinate(lon, lat));
        }

        Vacancy vacancy = Vacancy.builder()
                .employer(employer)
                .title(title)
                .description(description)
                .category(category)
                .city(city)
                .region(region)
                .location(location)
                .salaryFrom(salaryFrom)
                .salaryTo(salaryTo)
                .currency(currency != null ? currency : "UZS")
                .employmentType(employmentType != null ? EmploymentType.valueOf(employmentType) : null)
                .shiftSchedule(shiftSchedule != null ? ShiftSchedule.valueOf(shiftSchedule) : null)
                .benefits(benefits != null ? benefits.toArray(new String[0]) : null)
                .isMassHiring(isMassHiring != null ? isMassHiring : false)
                .positionsCount(positionsCount != null ? positionsCount : 1)
                .status(VacancyStatus.DRAFT)
                .expiresAt(Instant.now().plus(30, ChronoUnit.DAYS))
                .build();

        vacancy = vacancyRepository.save(vacancy);
        log.info("Vacancy created: {} for employer {}", vacancy.getId(), employerId);
        return vacancy;
    }

    @Transactional
    public Vacancy update(UUID vacancyId, UUID employerId, String title, String description,
                          String category, String city, BigDecimal salaryFrom, BigDecimal salaryTo) {
        Vacancy vacancy = getVacancyForEmployer(vacancyId, employerId);

        if (title != null) vacancy.setTitle(title);
        if (description != null) vacancy.setDescription(description);
        if (category != null) vacancy.setCategory(category);
        if (city != null) vacancy.setCity(city);
        if (salaryFrom != null) vacancy.setSalaryFrom(salaryFrom);
        if (salaryTo != null) vacancy.setSalaryTo(salaryTo);

        return vacancyRepository.save(vacancy);
    }

    @Transactional
    public Vacancy changeStatus(UUID vacancyId, UUID employerId, VacancyStatus newStatus) {
        Vacancy vacancy = getVacancyForEmployer(vacancyId, employerId);
        VacancyStatusMachine.validateTransition(vacancy.getStatus(), newStatus);
        vacancy.setStatus(newStatus);

        if (newStatus == VacancyStatus.PENDING_MODERATION) {
            vacancy.setModerationStatus(ModerationStatus.PENDING);
        }

        log.info("Vacancy {} status changed to {}", vacancyId, newStatus);
        return vacancyRepository.save(vacancy);
    }

    @Transactional(readOnly = true)
    public Vacancy getById(UUID vacancyId) {
        return vacancyRepository.findById(vacancyId)
                .orElseThrow(() -> new ResourceNotFoundException("Vacancy", vacancyId));
    }

    @Transactional(readOnly = true)
    public Page<Vacancy> findByEmployer(UUID employerId, Pageable pageable) {
        return vacancyRepository.findByEmployerId(employerId, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Vacancy> search(String city, String category, BigDecimal salaryFrom,
                                BigDecimal salaryTo, Pageable pageable) {
        Specification<Vacancy> spec = VacancySpecification.withFilters(
                city, category, salaryFrom, salaryTo, null, null);
        return vacancyRepository.findAll(spec, pageable);
    }

    @Transactional(readOnly = true)
    public List<Vacancy> findNearby(double lat, double lon, double radiusKm) {
        return vacancyRepository.findNearLocation(lon, lat, radiusKm * 1000);
    }

    @Transactional
    public void softDelete(UUID vacancyId, UUID employerId) {
        Vacancy vacancy = getVacancyForEmployer(vacancyId, employerId);
        vacancy.softDelete();
        vacancyRepository.save(vacancy);
        log.info("Vacancy {} soft deleted", vacancyId);
    }

    private Vacancy getVacancyForEmployer(UUID vacancyId, UUID employerId) {
        Vacancy vacancy = vacancyRepository.findById(vacancyId)
                .orElseThrow(() -> new ResourceNotFoundException("Vacancy", vacancyId));
        if (!vacancy.getEmployer().getId().equals(employerId)) {
            throw new ForbiddenException("You don't have access to this vacancy");
        }
        return vacancy;
    }
}
