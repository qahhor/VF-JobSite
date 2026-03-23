package uz.verifix.jobs.service.employer;

import lombok.RequiredArgsConstructor;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.verifix.jobs.common.exception.ResourceNotFoundException;
import uz.verifix.jobs.domain.entity.Employer;
import uz.verifix.jobs.domain.enums.VacancyStatus;
import uz.verifix.jobs.domain.repository.ApplicationRepository;
import uz.verifix.jobs.domain.repository.EmployerRepository;
import uz.verifix.jobs.domain.repository.VacancyRepository;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EmployerProfileService {

    private final EmployerRepository employerRepository;
    private final VacancyRepository vacancyRepository;
    private final GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);

    @Transactional(readOnly = true)
    public Employer getProfile(UUID employerId) {
        return employerRepository.findById(employerId)
                .orElseThrow(() -> new ResourceNotFoundException("Employer", employerId.toString()));
    }

    @Transactional(readOnly = true)
    public long getActiveVacancyCount(UUID employerId) {
        return vacancyRepository.countByEmployerIdAndStatus(employerId, VacancyStatus.ACTIVE);
    }

    @Transactional
    public Employer updateProfile(UUID employerId, String name, String legalName, String industry,
                                  String city, String region, Double lat, Double lon) {
        Employer employer = getProfile(employerId);

        if (name != null) employer.setName(name);
        if (legalName != null) employer.setLegalName(legalName);
        if (industry != null) employer.setIndustry(industry);
        if (city != null) employer.setCity(city);
        if (region != null) employer.setRegion(region);

        if (lat != null && lon != null) {
            employer.setLocation(geometryFactory.createPoint(new Coordinate(lon, lat)));
        }

        return employerRepository.save(employer);
    }

    @Transactional
    public Employer updateLogo(UUID employerId, String logoUrl) {
        Employer employer = getProfile(employerId);
        employer.setLogoUrl(logoUrl);
        return employerRepository.save(employer);
    }
}
