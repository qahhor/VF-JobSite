package uz.verifix.jobs.service.gov;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.verifix.jobs.domain.entity.Application;
import uz.verifix.jobs.domain.enums.GovSyncSource;
import uz.verifix.jobs.domain.repository.ApplicationRepository;
import uz.verifix.jobs.integration.verifix.EmployeeInfo;
import uz.verifix.jobs.integration.verifix.EmployeeResult;
import uz.verifix.jobs.integration.verifix.VerifixHrmClient;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class HrmBridgeService {

    private final VerifixHrmClient hrmClient;
    private final ApplicationRepository applicationRepository;
    private final GovSyncService govSyncService;

    @Transactional
    public void onApplicationHired(Application application) {
        UUID employerId = application.getVacancy().getEmployer().getId();
        String candidateName = (application.getCandidate().getFirstName() != null
                ? application.getCandidate().getFirstName() : "") + " " +
                (application.getCandidate().getLastName() != null
                        ? application.getCandidate().getLastName() : "");
        String phone = application.getCandidate().getPhone();
        String position = application.getVacancy().getTitle();
        Instant hiredAt = application.getHiredAt() != null ? application.getHiredAt() : Instant.now();

        // Create employee in Verifix HRM
        EmployeeResult result = hrmClient.createEmployee(employerId, candidateName.trim(), phone, position, hiredAt);

        if (result.isSuccess() && result.getEmployeeId() != null) {
            application.setVerifixEmployeeId(result.getEmployeeId());
            applicationRepository.save(application);
            log.info("HRM bridge: employee {} created for application {}", result.getEmployeeId(), application.getId());
        } else {
            log.warn("HRM bridge: employee creation failed for application {}: {}",
                    application.getId(), result.getErrorMessage());
        }

        // Report hiring to ENST (employment registry)
        try {
            govSyncService.reportHiring(application, GovSyncSource.ENST);
        } catch (Exception e) {
            log.error("Failed to report hiring to ENST: {}", e.getMessage());
        }
    }

    public List<EmployeeInfo> getEmployeesForTestimonials(UUID employerId) {
        return hrmClient.getEmployeesByCompany(employerId);
    }
}
