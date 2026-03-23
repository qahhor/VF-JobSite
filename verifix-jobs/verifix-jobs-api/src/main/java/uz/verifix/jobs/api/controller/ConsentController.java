package uz.verifix.jobs.api.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uz.verifix.jobs.api.dto.request.ConsentRequest;
import uz.verifix.jobs.api.dto.response.ConsentResponse;
import uz.verifix.jobs.domain.entity.ConsentLog;
import uz.verifix.jobs.domain.enums.ConsentType;
import uz.verifix.jobs.domain.enums.UserType;
import uz.verifix.jobs.service.consent.ConsentService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/consent")
@RequiredArgsConstructor
public class ConsentController {

    private final ConsentService consentService;

    @PostMapping
    public ResponseEntity<ConsentResponse> giveConsent(
            @Valid @RequestBody ConsentRequest request,
            HttpServletRequest httpRequest) {
        ConsentLog consent = consentService.giveConsent(
                request.getUserType(), request.getUserId(), request.getConsentType(),
                request.getVersion(), httpRequest.getRemoteAddr());
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(consent));
    }

    @DeleteMapping("/{consentType}")
    public ResponseEntity<Void> withdrawConsent(
            @PathVariable ConsentType consentType,
            @RequestParam UserType userType,
            @RequestParam UUID userId) {
        consentService.withdrawConsent(userType, userId, consentType);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<ConsentResponse>> getActive(
            @RequestParam UserType userType,
            @RequestParam UUID userId) {
        List<ConsentLog> consents = consentService.getActiveConsents(userType, userId);
        return ResponseEntity.ok(consents.stream().map(this::toResponse).toList());
    }

    private ConsentResponse toResponse(ConsentLog c) {
        return ConsentResponse.builder()
                .id(c.getId())
                .consentType(c.getConsentType().name())
                .version(c.getVersion())
                .givenAt(c.getGivenAt())
                .withdrawnAt(c.getWithdrawnAt())
                .build();
    }
}
