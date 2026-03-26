package uz.verifix.jobs.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import uz.verifix.jobs.api.security.SecurityUtils;
import uz.verifix.jobs.service.automation.AutomationRuleService;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/employer/automations")
@RequiredArgsConstructor
public class AutomationController {

    private final AutomationRuleService automationRuleService;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getRules(Authentication auth) {
        UUID employerId = SecurityUtils.extractEmployerId(auth);
        return ResponseEntity.ok(automationRuleService.getRules(employerId));
    }

    @PostMapping
    @SuppressWarnings("unchecked")
    public ResponseEntity<Map<String, Object>> createRule(Authentication auth, @RequestBody Map<String, Object> body) {
        UUID employerId = SecurityUtils.extractEmployerId(auth);
        return ResponseEntity.ok(automationRuleService.createRule(
                employerId,
                (String) body.get("name"),
                (String) body.get("triggerEvent"),
                (Map<String, Object>) body.get("conditions"),
                (String) body.get("actionType"),
                (Map<String, Object>) body.get("actionConfig")
        ));
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<Void> toggle(@PathVariable UUID id, @RequestParam boolean active) {
        automationRuleService.toggleRule(id, active);
        return ResponseEntity.ok().build();
    }
}
