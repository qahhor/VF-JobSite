package uz.verifix.jobs.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RestController;
import uz.verifix.jobs.api.dto.request.PushSubscriptionRequest;
import uz.verifix.jobs.api.security.AuthenticatedUser;
import uz.verifix.jobs.api.security.SecurityUtils;
import uz.verifix.jobs.common.exception.ForbiddenException;
import uz.verifix.jobs.service.notification.NotificationPreferenceService;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications/preferences")
@RequiredArgsConstructor
public class NotificationPreferenceController {

    private final NotificationPreferenceService notificationPreferenceService;

    @PutMapping("/candidate/push")
    public ResponseEntity<Map<String, String>> updateCandidatePushSubscription(
            @Valid @RequestBody PushSubscriptionRequest request,
            Authentication auth) {
        requireCandidate(auth);
        UUID candidateId = SecurityUtils.extractUserId(auth);
        notificationPreferenceService.updateCandidatePushSubscription(candidateId, request.getSubscriptionJson());
        return ResponseEntity.ok(Map.of("message", "Candidate push subscription saved"));
    }

    @DeleteMapping("/candidate/push")
    public ResponseEntity<Void> clearCandidatePushSubscription(Authentication auth) {
        requireCandidate(auth);
        UUID candidateId = SecurityUtils.extractUserId(auth);
        notificationPreferenceService.clearCandidatePushSubscription(candidateId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/manager/push")
    public ResponseEntity<Map<String, String>> updateManagerPushSubscription(
            @Valid @RequestBody PushSubscriptionRequest request,
            Authentication auth) {
        requireEmployerUser(auth);
        UUID managerId = SecurityUtils.extractManagerId(auth);
        UUID employerId = SecurityUtils.extractEmployerId(auth);
        notificationPreferenceService.updateManagerPushSubscription(managerId, employerId, request.getSubscriptionJson());
        return ResponseEntity.ok(Map.of("message", "Manager push subscription saved"));
    }

    @DeleteMapping("/manager/push")
    public ResponseEntity<Void> clearManagerPushSubscription(Authentication auth) {
        requireEmployerUser(auth);
        UUID managerId = SecurityUtils.extractManagerId(auth);
        UUID employerId = SecurityUtils.extractEmployerId(auth);
        notificationPreferenceService.clearManagerPushSubscription(managerId, employerId);
        return ResponseEntity.noContent().build();
    }

    private void requireCandidate(Authentication auth) {
        if (!(auth.getPrincipal() instanceof AuthenticatedUser user) || !"CANDIDATE".equals(user.role())) {
            throw new ForbiddenException("Only candidates can update candidate push preferences");
        }
    }

    private void requireEmployerUser(Authentication auth) {
        if (!(auth.getPrincipal() instanceof AuthenticatedUser user) || user.employerId() == null) {
            throw new ForbiddenException("Only employer users can update manager push preferences");
        }
    }
}
