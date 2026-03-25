package uz.verifix.jobs.service.hrm;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import uz.verifix.jobs.domain.entity.Employer;
import uz.verifix.jobs.domain.repository.EmployerRepository;
import uz.verifix.jobs.integration.verifix.*;

import java.util.List;
import java.util.UUID;

/**
 * Imports organizational structure from HRM for employer profile enrichment.
 * Provides divisions and jobs for vacancy creation wizard.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class HrmOrgSyncService {

    private final VerifixHrmClient hrmClient;
    private final EmployerRepository employerRepository;

    public record OrgStructure(List<HrmDivision> divisions, List<HrmJob> jobs) {}

    /**
     * Fetch full org structure from HRM for an employer.
     */
    public OrgStructure getOrgStructure(UUID employerId) {
        Employer employer = employerRepository.findById(employerId).orElse(null);
        if (employer == null || employer.getHrmCompanyId() == null) {
            return new OrgStructure(List.of(), List.of());
        }

        UUID hrmCompanyId = UUID.fromString(employer.getHrmCompanyId());
        List<HrmDivision> divisions = hrmClient.getDivisions(hrmCompanyId);
        List<HrmJob> jobs = hrmClient.getJobs(hrmCompanyId);

        log.info("Fetched org structure for employer {}: {} divisions, {} jobs",
                employerId, divisions.size(), jobs.size());
        return new OrgStructure(divisions, jobs);
    }

    /**
     * Get active divisions for vacancy creation dropdown.
     */
    public List<HrmDivision> getActiveDivisions(UUID employerId) {
        Employer employer = employerRepository.findById(employerId).orElse(null);
        if (employer == null || employer.getHrmCompanyId() == null) return List.of();

        return hrmClient.getDivisions(UUID.fromString(employer.getHrmCompanyId()))
                .stream()
                .filter(d -> "A".equals(d.getState()))
                .toList();
    }

    /**
     * Get active jobs for vacancy creation dropdown.
     */
    public List<HrmJob> getActiveJobs(UUID employerId) {
        Employer employer = employerRepository.findById(employerId).orElse(null);
        if (employer == null || employer.getHrmCompanyId() == null) return List.of();

        return hrmClient.getJobs(UUID.fromString(employer.getHrmCompanyId()))
                .stream()
                .filter(j -> "A".equals(j.getState()))
                .toList();
    }
}
