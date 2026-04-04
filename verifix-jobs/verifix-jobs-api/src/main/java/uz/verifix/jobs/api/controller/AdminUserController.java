package uz.verifix.jobs.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import uz.verifix.jobs.api.dto.request.AdminCreateUserRequest;
import uz.verifix.jobs.api.dto.request.AdminInviteUserRequest;
import uz.verifix.jobs.api.dto.request.AdminResetPasswordRequest;
import uz.verifix.jobs.api.dto.request.AdminUpdateRoleRequest;
import uz.verifix.jobs.api.dto.response.AdminInviteResponse;
import uz.verifix.jobs.api.dto.response.AdminUserResponse;
import uz.verifix.jobs.api.security.SecurityUtils;
import uz.verifix.jobs.common.dto.PageResponse;
import uz.verifix.jobs.common.exception.ForbiddenException;
import uz.verifix.jobs.common.exception.ResourceNotFoundException;
import uz.verifix.jobs.domain.entity.AdminUser;
import uz.verifix.jobs.domain.entity.Candidate;
import uz.verifix.jobs.domain.entity.Employer;
import uz.verifix.jobs.domain.enums.AdminRole;
import uz.verifix.jobs.domain.enums.EmployerStatus;
import uz.verifix.jobs.domain.repository.AdminUserRepository;
import uz.verifix.jobs.domain.repository.CandidateRepository;
import uz.verifix.jobs.domain.repository.EmployerRepository;
import uz.verifix.jobs.service.admin.AdminAuditService;
import uz.verifix.jobs.service.admin.AdminAuthService;
import uz.verifix.jobs.service.admin.AdminEmployerService;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final CandidateRepository candidateRepository;
    private final EmployerRepository employerRepository;
    private final AdminUserRepository adminUserRepository;
    private final AdminEmployerService adminEmployerService;
    private final AdminAuthService adminAuthService;
    private final AdminAuditService adminAuditService;

    @GetMapping
    public ResponseEntity<PageResponse<Map<String, Object>>> getUsers(
            @RequestParam(defaultValue = "EMPLOYER") String type,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20) Pageable pageable,
            Authentication auth) {
        UUID currentAdminId = null;
        try {
            currentAdminId = SecurityUtils.extractAdminId(auth);
        } catch (Exception ignored) {
        }

        Page<Map<String, Object>> page = switch (type.toUpperCase(Locale.ROOT)) {
            case "CANDIDATE" -> getCandidatePage(search, pageable);
            case "ADMIN" -> getAdminPage(search, pageable, currentAdminId);
            default -> getEmployerPage(search, pageable);
        };
        return ResponseEntity.ok(PageResponse.of(page));
    }

    @PostMapping("/admins")
    public ResponseEntity<AdminUserResponse> createAdmin(
            @Valid @RequestBody AdminCreateUserRequest request,
            Authentication auth) {
        UUID actorId = requireSuperAdmin(auth);
        AdminUser admin = adminAuthService.createAdmin(request.getEmail(), request.getPassword(), request.getRole());
        adminAuditService.log(actorId, "ADMIN_CREATE", "AdminUser", admin.getId(),
                "{\"email\":\"" + admin.getEmail() + "\",\"role\":\"" + admin.getRole().name() + "\"}", null);
        return ResponseEntity.status(HttpStatus.CREATED).body(toAdminResponse(admin, actorId));
    }

    @PostMapping("/admins/invite")
    public ResponseEntity<AdminInviteResponse> inviteAdmin(
            @Valid @RequestBody AdminInviteUserRequest request,
            Authentication auth) {
        UUID actorId = requireSuperAdmin(auth);
        AdminAuthService.InviteResult result = adminAuthService.inviteAdmin(request.getEmail(), request.getRole(), actorId);
        AdminUser admin = result.admin();
        adminAuditService.log(actorId, "ADMIN_INVITE", "AdminUser", admin.getId(),
                "{\"email\":\"" + admin.getEmail() + "\",\"role\":\"" + admin.getRole().name() + "\",\"emailSent\":" + result.emailSent() + "}", null);
        return ResponseEntity.status(HttpStatus.CREATED).body(AdminInviteResponse.builder()
                .id(admin.getId())
                .email(admin.getEmail())
                .role(admin.getRole() != null ? admin.getRole().name() : null)
                .mustChangePassword(admin.isMustChangePassword())
                .emailSent(result.emailSent())
                .temporaryPassword(result.temporaryPassword())
                .inviteSentAt(admin.getInviteSentAt())
                .build());
    }

    @PatchMapping("/admins/{id}/role")
    public ResponseEntity<AdminUserResponse> updateRole(
            @PathVariable UUID id,
            @Valid @RequestBody AdminUpdateRoleRequest request,
            Authentication auth) {
        UUID actorId = requireSuperAdmin(auth);
        if (actorId.equals(id) && request.getRole() != AdminRole.SUPER_ADMIN) {
            throw new ForbiddenException("You cannot remove your own SUPER_ADMIN access");
        }

        AdminUser admin = adminAuthService.updateRole(id, request.getRole());
        adminAuditService.log(actorId, "ADMIN_ROLE_UPDATE", "AdminUser", id,
                "{\"role\":\"" + request.getRole().name() + "\"}", null);
        return ResponseEntity.ok(toAdminResponse(admin, actorId));
    }

    @PostMapping("/admins/{id}/reset-password")
    public ResponseEntity<AdminUserResponse> resetPassword(
            @PathVariable UUID id,
            @Valid @RequestBody AdminResetPasswordRequest request,
            Authentication auth) {
        UUID actorId = requireSuperAdmin(auth);
        AdminUser admin = adminAuthService.resetPassword(id, request.getPassword());
        adminAuditService.log(actorId, "ADMIN_PASSWORD_RESET", "AdminUser", id, null, null);
        return ResponseEntity.ok(toAdminResponse(admin, actorId));
    }

    @PutMapping("/{id}/suspend")
    public ResponseEntity<Map<String, Object>> suspend(@PathVariable UUID id) {
        Employer employer = employerRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Employer", id.toString()));
        return ResponseEntity.ok(toEmployerRow(adminEmployerService.changeStatus(employer.getId(), EmployerStatus.SUSPENDED)));
    }

    @PutMapping("/{id}/activate")
    public ResponseEntity<Map<String, Object>> activate(@PathVariable UUID id) {
        Employer employer = employerRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Employer", id.toString()));
        return ResponseEntity.ok(toEmployerRow(adminEmployerService.changeStatus(employer.getId(), EmployerStatus.ACTIVE)));
    }

    private Page<Map<String, Object>> getEmployerPage(String search, Pageable pageable) {
        Page<Employer> employers = (search != null && !search.isBlank())
                ? employerRepository.findByNameContainingIgnoreCase(search, pageable)
                : employerRepository.findAll(pageable);
        return employers.map(this::toEmployerRow);
    }

    private Page<Map<String, Object>> getCandidatePage(String search, Pageable pageable) {
        List<Candidate> filtered = candidateRepository.findAll().stream()
                .filter(candidate -> matchesSearch(search,
                        candidate.getFirstName(),
                        candidate.getLastName(),
                        candidate.getPhone(),
                        candidate.getCity()))
                .toList();
        return paginate(filtered, pageable).map(this::toCandidateRow);
    }

    private Page<Map<String, Object>> getAdminPage(String search, Pageable pageable, UUID currentAdminId) {
        Page<AdminUser> admins = (search != null && !search.isBlank())
                ? adminUserRepository.findByEmailContainingIgnoreCaseOrderByCreatedAtDesc(search.trim(), pageable)
                : adminUserRepository.findAllByOrderByCreatedAtDesc(pageable);
        return admins.map(admin -> toAdminRow(admin, currentAdminId));
    }

    private boolean matchesSearch(String search, String... values) {
        if (search == null || search.isBlank()) {
            return true;
        }
        String needle = search.toLowerCase(Locale.ROOT);
        for (String value : values) {
            if (value != null && value.toLowerCase(Locale.ROOT).contains(needle)) {
                return true;
            }
        }
        return false;
    }

    private <T> Page<T> paginate(List<T> items, Pageable pageable) {
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), items.size());
        List<T> content = start >= items.size() ? List.of() : items.subList(start, end);
        return new PageImpl<>(content, PageRequest.of(pageable.getPageNumber(), pageable.getPageSize()), items.size());
    }

    private Map<String, Object> toEmployerRow(Employer employer) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("id", employer.getId());
        data.put("name", employer.getName());
        data.put("email", employer.getInn());
        data.put("phone", null);
        data.put("status", employer.getStatus() != null ? employer.getStatus().name() : EmployerStatus.PENDING.name());
        data.put("createdAt", employer.getCreatedAt());
        data.put("type", "EMPLOYER");
        return data;
    }

    private Map<String, Object> toCandidateRow(Candidate candidate) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("id", candidate.getId());
        data.put("firstName", candidate.getFirstName());
        data.put("lastName", candidate.getLastName());
        data.put("phone", candidate.getPhone());
        data.put("status", "ACTIVE");
        data.put("createdAt", candidate.getCreatedAt());
        data.put("type", "CANDIDATE");
        return data;
    }

    private Map<String, Object> toAdminRow(AdminUser admin, UUID currentAdminId) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("id", admin.getId());
        data.put("name", admin.getEmail());
        data.put("email", admin.getEmail());
        data.put("status", "ACTIVE");
        data.put("role", admin.getRole() != null ? admin.getRole().name() : null);
        data.put("totpEnabled", admin.getTotpSecret() != null && !admin.getTotpSecret().isBlank());
        data.put("mustChangePassword", admin.isMustChangePassword());
        data.put("currentUser", currentAdminId != null && currentAdminId.equals(admin.getId()));
        data.put("createdAt", admin.getCreatedAt());
        data.put("lastLoginAt", admin.getLastLoginAt());
        data.put("inviteSentAt", admin.getInviteSentAt());
        data.put("passwordChangedAt", admin.getPasswordChangedAt());
        data.put("type", "ADMIN");
        return data;
    }

    private AdminUserResponse toAdminResponse(AdminUser admin, UUID currentAdminId) {
        return AdminUserResponse.builder()
                .id(admin.getId())
                .email(admin.getEmail())
                .role(admin.getRole() != null ? admin.getRole().name() : null)
                .totpEnabled(admin.getTotpSecret() != null && !admin.getTotpSecret().isBlank())
                .mustChangePassword(admin.isMustChangePassword())
                .currentUser(currentAdminId != null && currentAdminId.equals(admin.getId()))
                .createdAt(admin.getCreatedAt())
                .lastLoginAt(admin.getLastLoginAt())
                .inviteSentAt(admin.getInviteSentAt())
                .passwordChangedAt(admin.getPasswordChangedAt())
                .build();
    }

    private UUID requireSuperAdmin(Authentication auth) {
        UUID adminId = SecurityUtils.extractAdminId(auth);
        if (SecurityUtils.extractAdminRole(auth) != AdminRole.SUPER_ADMIN) {
            throw new ForbiddenException("Only SUPER_ADMIN can manage admin access");
        }
        return adminId;
    }
}
