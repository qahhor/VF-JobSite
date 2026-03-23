package uz.verifix.jobs.api.security;

import org.springframework.security.core.Authentication;
import uz.verifix.jobs.common.exception.ResourceNotFoundException;
import uz.verifix.jobs.domain.entity.Manager;
import uz.verifix.jobs.domain.enums.ManagerRole;
import uz.verifix.jobs.domain.repository.ManagerRepository;

import java.util.UUID;

public final class SecurityUtils {

    private SecurityUtils() {}

    public static UUID extractManagerId(Authentication auth) {
        return UUID.fromString(auth.getName());
    }

    public static UUID extractEmployerId(Authentication auth, ManagerRepository managerRepository) {
        UUID managerId = extractManagerId(auth);
        return managerRepository.findById(managerId)
                .orElseThrow(() -> new ResourceNotFoundException("Manager", managerId.toString()))
                .getEmployer().getId();
    }

    public static Manager extractManager(Authentication auth, ManagerRepository managerRepository) {
        UUID managerId = extractManagerId(auth);
        return managerRepository.findById(managerId)
                .orElseThrow(() -> new ResourceNotFoundException("Manager", managerId.toString()));
    }

    public static ManagerRole extractRole(Authentication auth, ManagerRepository managerRepository) {
        return extractManager(auth, managerRepository).getRole();
    }
}
