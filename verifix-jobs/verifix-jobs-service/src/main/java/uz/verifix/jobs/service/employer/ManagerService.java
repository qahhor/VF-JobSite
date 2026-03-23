package uz.verifix.jobs.service.employer;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.verifix.jobs.common.exception.BusinessException;
import uz.verifix.jobs.common.exception.DuplicateResourceException;
import uz.verifix.jobs.common.exception.ErrorCode;
import uz.verifix.jobs.common.exception.ForbiddenException;
import uz.verifix.jobs.common.exception.ResourceNotFoundException;
import uz.verifix.jobs.domain.entity.Employer;
import uz.verifix.jobs.domain.entity.Manager;
import uz.verifix.jobs.domain.enums.ManagerRole;
import uz.verifix.jobs.domain.repository.EmployerRepository;
import uz.verifix.jobs.domain.repository.ManagerRepository;

import java.security.SecureRandom;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ManagerService {

    private final ManagerRepository managerRepository;
    private final EmployerRepository employerRepository;
    private final PasswordEncoder passwordEncoder;

    private static final SecureRandom RANDOM = new SecureRandom();

    @Transactional(readOnly = true)
    public List<Manager> getTeam(UUID employerId) {
        return managerRepository.findByEmployerId(employerId);
    }

    @Transactional
    public Manager invite(UUID employerId, String email, String phone, ManagerRole role) {
        if (managerRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("Email " + email + " is already registered");
        }

        Employer employer = employerRepository.findById(employerId)
                .orElseThrow(() -> new ResourceNotFoundException("Employer", employerId.toString()));

        String tempPassword = generateTempPassword();

        Manager manager = Manager.builder()
                .employer(employer)
                .email(email)
                .phone(phone)
                .passwordHash(passwordEncoder.encode(tempPassword))
                .role(role)
                .build();

        manager = managerRepository.save(manager);
        log.info("Manager invited: {} with role {} for employer {}", email, role, employerId);

        // TODO: send invitation email/SMS with temp password

        return manager;
    }

    @Transactional
    public Manager updateRole(UUID managerId, UUID employerId, ManagerRole newRole) {
        Manager manager = getManagerInEmployer(managerId, employerId);
        manager.setRole(newRole);
        log.info("Manager {} role updated to {} by employer {}", managerId, newRole, employerId);
        return managerRepository.save(manager);
    }

    @Transactional
    public void remove(UUID managerId, UUID employerId) {
        Manager manager = getManagerInEmployer(managerId, employerId);

        // Prevent removing the last ADMIN
        if (manager.getRole() == ManagerRole.ADMIN) {
            long adminCount = managerRepository.findByEmployerId(employerId).stream()
                    .filter(m -> m.getRole() == ManagerRole.ADMIN)
                    .count();
            if (adminCount <= 1) {
                throw new BusinessException(ErrorCode.ACCESS_DENIED, HttpStatus.BAD_REQUEST,
                        "Cannot remove the last admin manager");
            }
        }

        managerRepository.delete(manager);
        log.info("Manager {} removed from employer {}", managerId, employerId);
    }

    private Manager getManagerInEmployer(UUID managerId, UUID employerId) {
        Manager manager = managerRepository.findById(managerId)
                .orElseThrow(() -> new ResourceNotFoundException("Manager", managerId.toString()));
        if (!manager.getEmployer().getId().equals(employerId)) {
            throw new ForbiddenException("Manager does not belong to this employer");
        }
        return manager;
    }

    private String generateTempPassword() {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
        StringBuilder sb = new StringBuilder(10);
        for (int i = 0; i < 10; i++) {
            sb.append(chars.charAt(RANDOM.nextInt(chars.length())));
        }
        return sb.toString();
    }
}
