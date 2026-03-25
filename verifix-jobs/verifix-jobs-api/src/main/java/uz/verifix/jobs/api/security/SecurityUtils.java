package uz.verifix.jobs.api.security;

import org.springframework.security.core.Authentication;
import uz.verifix.jobs.common.exception.ForbiddenException;
import uz.verifix.jobs.common.exception.ResourceNotFoundException;
import uz.verifix.jobs.domain.entity.Manager;
import uz.verifix.jobs.domain.enums.AdminRole;
import uz.verifix.jobs.domain.enums.ManagerRole;
import uz.verifix.jobs.domain.repository.ManagerRepository;

import java.util.UUID;

public final class SecurityUtils {

    private SecurityUtils() {}

    public static UUID extractUserId(Authentication auth) {
        if (auth.getPrincipal() instanceof AuthenticatedUser user) {
            return user.userId();
        }
        return UUID.fromString(auth.getName());
    }

    public static UUID extractManagerId(Authentication auth) {
        return extractUserId(auth);
    }

    public static UUID extractCandidateId(Authentication auth) {
        if (auth.getPrincipal() instanceof AuthenticatedUser user && "CANDIDATE".equals(user.role())) {
            return user.userId();
        }
        throw new ForbiddenException("Candidate authentication is required");
    }

    public static UUID extractEmployerId(Authentication auth) {
        if (auth.getPrincipal() instanceof AuthenticatedUser user && user.employerId() != null) {
            return user.employerId();
        }
        throw new ResourceNotFoundException("Employer", auth.getName());
    }

    public static UUID extractAdminId(Authentication auth) {
        if (auth.getPrincipal() instanceof AuthenticatedUser user && user.role() != null && user.employerId() == null) {
            try {
                AdminRole.valueOf(user.role());
                return user.userId();
            } catch (IllegalArgumentException ignored) {
            }
        }
        throw new ForbiddenException("Admin authentication is required");
    }

    public static UUID enforceCandidateAccess(Authentication auth, UUID candidateId) {
        UUID authenticatedCandidateId = extractCandidateId(auth);
        if (candidateId != null && !authenticatedCandidateId.equals(candidateId)) {
            throw new ForbiddenException("Candidate access is limited to your own profile");
        }
        return authenticatedCandidateId;
    }

    public static UUID enforceEmployerAccess(Authentication auth, UUID employerId) {
        UUID authenticatedEmployerId = extractEmployerId(auth);
        if (employerId != null && !authenticatedEmployerId.equals(employerId)) {
            throw new ForbiddenException("Employer access is limited to your own tenant");
        }
        return authenticatedEmployerId;
    }

    public static UUID extractEmployerId(Authentication auth, ManagerRepository managerRepository) {
        try {
            return extractEmployerId(auth);
        } catch (ResourceNotFoundException ignored) {
        }

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

    public static ManagerRole extractRole(Authentication auth) {
        if (auth.getPrincipal() instanceof AuthenticatedUser user && user.role() != null) {
            String normalized = user.role().startsWith("EMPLOYER_")
                    ? user.role().substring("EMPLOYER_".length())
                    : user.role();
            return ManagerRole.valueOf(normalized);
        }
        throw new ResourceNotFoundException("ManagerRole", auth.getName());
    }

    public static ManagerRole extractRole(Authentication auth, ManagerRepository managerRepository) {
        try {
            return extractRole(auth);
        } catch (IllegalArgumentException | ResourceNotFoundException ignored) {
        }
        return extractManager(auth, managerRepository).getRole();
    }
}
