package uz.verifix.jobs.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import uz.verifix.jobs.api.dto.request.ManagerInviteRequest;
import uz.verifix.jobs.api.dto.request.ManagerRoleUpdateRequest;
import uz.verifix.jobs.api.dto.response.ManagerResponse;
import uz.verifix.jobs.api.security.SecurityUtils;
import uz.verifix.jobs.common.exception.ForbiddenException;
import uz.verifix.jobs.domain.entity.Manager;
import uz.verifix.jobs.domain.enums.ManagerRole;
import uz.verifix.jobs.domain.repository.ManagerRepository;
import uz.verifix.jobs.service.employer.ManagerService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/managers")
@RequiredArgsConstructor
public class ManagerController {

    private final ManagerService managerService;
    private final ManagerRepository managerRepository;

    @GetMapping
    public ResponseEntity<List<ManagerResponse>> getTeam(Authentication auth) {
        UUID employerId = SecurityUtils.extractEmployerId(auth, managerRepository);
        List<Manager> managers = managerService.getTeam(employerId);
        return ResponseEntity.ok(managers.stream().map(this::toResponse).toList());
    }

    @PostMapping
    public ResponseEntity<ManagerResponse> invite(
            @Valid @RequestBody ManagerInviteRequest request,
            Authentication auth) {

        requireAdmin(auth);
        UUID employerId = SecurityUtils.extractEmployerId(auth, managerRepository);
        Manager manager = managerService.invite(employerId, request.getEmail(), request.getPhone(), request.getRole());
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(manager));
    }

    @PatchMapping("/{id}/role")
    public ResponseEntity<ManagerResponse> updateRole(
            @PathVariable UUID id,
            @Valid @RequestBody ManagerRoleUpdateRequest request,
            Authentication auth) {

        requireAdmin(auth);
        UUID employerId = SecurityUtils.extractEmployerId(auth, managerRepository);
        Manager manager = managerService.updateRole(id, employerId, request.getRole());
        return ResponseEntity.ok(toResponse(manager));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remove(
            @PathVariable UUID id,
            Authentication auth) {

        requireAdmin(auth);
        UUID employerId = SecurityUtils.extractEmployerId(auth, managerRepository);
        managerService.remove(id, employerId);
        return ResponseEntity.noContent().build();
    }

    private void requireAdmin(Authentication auth) {
        ManagerRole role = SecurityUtils.extractRole(auth, managerRepository);
        if (role != ManagerRole.ADMIN) {
            throw new ForbiddenException("Only ADMIN managers can perform this action");
        }
    }

    private ManagerResponse toResponse(Manager m) {
        return ManagerResponse.builder()
                .id(m.getId())
                .email(m.getEmail())
                .phone(m.getPhone())
                .role(m.getRole().name())
                .createdAt(m.getCreatedAt())
                .build();
    }
}
