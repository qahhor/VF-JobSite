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
import uz.verifix.jobs.api.security.SecurityUtils;
import uz.verifix.jobs.common.dto.PageResponse;
import uz.verifix.jobs.domain.entity.ModerationQueue;
import uz.verifix.jobs.domain.entity.Vacancy;
import uz.verifix.jobs.domain.enums.ModerationEntityType;
import uz.verifix.jobs.domain.enums.ModerationStatus;
import uz.verifix.jobs.domain.repository.VacancyRepository;
import uz.verifix.jobs.service.admin.AdminAuditService;
import uz.verifix.jobs.service.moderation.ModerationService;

import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/moderation")
@RequiredArgsConstructor
public class AdminModerationController {

    private final ModerationService moderationService;
    private final AdminAuditService adminAuditService;
    private final VacancyRepository vacancyRepository;

    @GetMapping("/pending")
    @Transactional(readOnly = true)
    public ResponseEntity<PageResponse<ModerationQueueResponse>> getPending(
            @PageableDefault(size = 20) Pageable pageable) {
        Page<ModerationQueue> page = moderationService.getPendingQueue(pageable);
        return ResponseEntity.ok(PageResponse.of(page.map(this::toResponse)));
    }

    @GetMapping("/queue")
    @Transactional(readOnly = true)
    public ResponseEntity<PageResponse<ModerationQueueResponse>> getQueue(
            @RequestParam(required = false) ModerationStatus status,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<ModerationQueue> page = moderationService.getQueue(status, pageable);
        return ResponseEntity.ok(PageResponse.of(page.map(this::toResponse)));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<Void> approve(
            @PathVariable UUID id,
            Authentication auth,
            HttpServletRequest request) {

        UUID adminId = SecurityUtils.extractAdminId(auth);
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

        UUID adminId = SecurityUtils.extractAdminId(auth);
        moderationService.reject(id, adminId, rejectRequest.getReason());
        adminAuditService.log(adminId, "MODERATION_REJECT", "ModerationQueue", id,
                "{\"reason\":\"" + rejectRequest.getReason() + "\"}", request.getRemoteAddr());
        return ResponseEntity.ok().build();
    }

    private ModerationQueueResponse toResponse(ModerationQueue queue) {
        ModerationQueueResponse.ModerationQueueResponseBuilder builder = ModerationQueueResponse.builder()
                .id(queue.getId())
                .entityType(queue.getEntityType() != null ? queue.getEntityType().name() : null)
                .entityId(queue.getEntityId())
                .status(queue.getStatus() != null ? queue.getStatus().name() : null)
                .reason(queue.getReason())
                .decidedAt(queue.getDecidedAt())
                .createdAt(queue.getCreatedAt());

        if (queue.getEntityType() == ModerationEntityType.VACANCY) {
            vacancyRepository.findById(queue.getEntityId()).ifPresent(vacancy -> enrichVacancy(builder, vacancy));
        }

        return builder.build();
    }

    private void enrichVacancy(ModerationQueueResponse.ModerationQueueResponseBuilder builder, Vacancy vacancy) {
        builder.title(vacancy.getTitle())
                .subtitle(vacancy.getEmployer() != null ? vacancy.getEmployer().getName() : null)
                .previewText(vacancy.getDescription())
                .city(vacancy.getCity())
                .category(vacancy.getCategory())
                .salaryLabel(formatSalary(vacancy.getSalaryFrom(), vacancy.getSalaryTo(), vacancy.getCurrency()));
    }

    private String formatSalary(BigDecimal from, BigDecimal to, String currency) {
        if (from == null && to == null) {
            return null;
        }

        String effectiveCurrency = currency == null || currency.isBlank() ? "UZS" : currency;
        if (from != null && to != null) {
            return stripZeros(from) + " - " + stripZeros(to) + " " + effectiveCurrency;
        }

        BigDecimal value = from != null ? from : to;
        return "from " + stripZeros(value) + " " + effectiveCurrency;
    }

    private String stripZeros(BigDecimal value) {
        return value.stripTrailingZeros().toPlainString();
    }
}
