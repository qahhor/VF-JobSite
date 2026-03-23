package uz.verifix.jobs.api.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import uz.verifix.jobs.api.dto.request.RejectRequest;
import uz.verifix.jobs.api.dto.response.ModerationQueueResponse;
import uz.verifix.jobs.common.dto.PageResponse;
import uz.verifix.jobs.domain.entity.ModerationQueue;
import uz.verifix.jobs.service.admin.AdminAuditService;
import uz.verifix.jobs.service.moderation.ModerationService;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/moderation")
@RequiredArgsConstructor
public class AdminModerationController {

    private final ModerationService moderationService;
    private final AdminAuditService adminAuditService;

    @GetMapping("/pending")
    public ResponseEntity<PageResponse<ModerationQueueResponse>> getPending(
            @PageableDefault(size = 20) Pageable pageable) {
        Page<ModerationQueue> page = moderationService.getPendingQueue(pageable);
        return ResponseEntity.ok(PageResponse.of(page.map(this::toResponse)));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<Void> approve(
            @PathVariable UUID id,
            Authentication auth,
            HttpServletRequest request) {

        UUID adminId = UUID.fromString(auth.getName());
        moderationService.approve(id, adminId);
        adminAuditService.log(adminId, "MODERATION_APPROVE", "ModerationQueue", id, null, request.getRemoteAddr());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<Void> reject(
            @PathVariable UUID id,
            @Valid @RequestBody RejectRequest rejectRequest,
            Authentication auth,
            HttpServletRequest request) {

        UUID adminId = UUID.fromString(auth.getName());
        moderationService.reject(id, adminId, rejectRequest.getReason());
        adminAuditService.log(adminId, "MODERATION_REJECT", "ModerationQueue", id,
                "{\"reason\":\"" + rejectRequest.getReason() + "\"}", request.getRemoteAddr());
        return ResponseEntity.ok().build();
    }

    private ModerationQueueResponse toResponse(ModerationQueue mq) {
        return ModerationQueueResponse.builder()
                .id(mq.getId())
                .entityType(mq.getEntityType().name())
                .entityId(mq.getEntityId())
                .status(mq.getStatus().name())
                .reason(mq.getReason())
                .decidedAt(mq.getDecidedAt())
                .createdAt(mq.getCreatedAt())
                .build();
    }
}
