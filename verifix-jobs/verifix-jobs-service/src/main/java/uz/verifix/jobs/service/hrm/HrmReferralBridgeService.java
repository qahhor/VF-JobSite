package uz.verifix.jobs.service.hrm;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.verifix.jobs.domain.entity.Employer;
import uz.verifix.jobs.domain.repository.EmployerRepository;
import uz.verifix.jobs.integration.verifix.EmployeeInfo;
import uz.verifix.jobs.integration.verifix.VerifixHrmClient;

import java.util.List;
import java.util.UUID;

/**
 * Bridges HRM employees into the Jobs referral program.
 * Allows existing employees to refer candidates through the Jobs portal.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class HrmReferralBridgeService {

    private final VerifixHrmClient hrmClient;
    private final EmployerRepository employerRepository;

    public record ReferralEmployee(
            UUID hrmEmployeeId,
            String name,
            String position,
            String department,
            String photoUrl
    ) {}

    /**
     * Get employees eligible for the referral program from an employer's HRM.
     */
    @Transactional(readOnly = true)
    public List<ReferralEmployee> getEligibleEmployees(UUID employerId) {
        Employer employer = employerRepository.findById(employerId).orElse(null);
        if (employer == null || employer.getHrmCompanyId() == null) {
            return List.of();
        }

        List<EmployeeInfo> employees = hrmClient.getEmployeesByCompany(
                UUID.fromString(employer.getHrmCompanyId()));

        return employees.stream()
                .map(e -> new ReferralEmployee(
                        e.getId(),
                        e.getName(),
                        e.getPosition(),
                        e.getDepartment(),
                        e.getPhotoUrl()
                ))
                .toList();
    }

    /**
     * Verify that an employee ID belongs to the employer's HRM company.
     */
    public boolean verifyEmployee(UUID employerId, UUID employeeId) {
        Employer employer = employerRepository.findById(employerId).orElse(null);
        if (employer == null || employer.getHrmCompanyId() == null) return false;

        EmployeeInfo employee = hrmClient.getEmployee(employeeId);
        return employee != null;
    }
}
