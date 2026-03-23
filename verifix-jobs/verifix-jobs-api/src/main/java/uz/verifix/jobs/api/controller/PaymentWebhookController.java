package uz.verifix.jobs.api.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uz.verifix.jobs.domain.enums.PaymentGateway;
import uz.verifix.jobs.service.billing.BillingService;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/webhooks")
@RequiredArgsConstructor
public class PaymentWebhookController {

    private final BillingService billingService;

    @PostMapping("/click")
    public ResponseEntity<Map<String, Object>> clickCallback(@RequestParam Map<String, String> params) {
        log.info("Click.uz webhook received: {}", params.keySet());
        try {
            billingService.handleCallback(PaymentGateway.CLICK, params);
            return ResponseEntity.ok(Map.of("error", 0, "error_note", "Success"));
        } catch (Exception e) {
            log.error("Click.uz webhook processing error: {}", e.getMessage());
            return ResponseEntity.ok(Map.of("error", -1, "error_note", e.getMessage()));
        }
    }

    @PostMapping("/payme")
    public ResponseEntity<Map<String, Object>> paymeCallback(
            @RequestBody Map<String, String> params,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        log.info("Payme webhook received: method={}", params.get("method"));
        try {
            if (authHeader != null) {
                params.put("authorization", authHeader);
            }
            billingService.handleCallback(PaymentGateway.PAYME, params);
            return ResponseEntity.ok(Map.of("result", Map.of("state", 2)));
        } catch (Exception e) {
            log.error("Payme webhook processing error: {}", e.getMessage());
            return ResponseEntity.ok(Map.of("error", Map.of("code", -31001, "message", e.getMessage())));
        }
    }
}
