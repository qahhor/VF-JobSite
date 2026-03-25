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
@RequestMapping("/api/v1/automation/rules")
@RequiredArgsConstructor
public class AutomationRuleController {

    private final AutomationRuleService ruleService;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getRules(Authentication auth) {
        return ResponseEntity.ok(ruleService.getRules(SecurityUtils.extractEmployerId(auth)));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createRule(Authentication auth, @RequestBody Map<String, Object> body) {
        UUID employerId = SecurityUtils.extractEmployerId(auth);
        @SuppressWarnings("unchecked")
        Map<String, Object> conditions = (Map<String, Object>) body.get("conditions");
        @SuppressWarnings("unchecked")
        Map<String, Object> actionConfig = (Map<String, Object>) body.get("actionConfig");
        return ResponseEntity.ok(ruleService.createRule(employerId,
                (String) body.get("name"), (String) body.get("triggerEvent"),
                conditions, (String) body.get("actionType"), actionConfig));
    }

    @PostMapping("/{ruleId}/activate")
    public ResponseEntity<Void> activate(@PathVariable UUID ruleId) {
        ruleService.toggleRule(ruleId, true);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{ruleId}/deactivate")
    public ResponseEntity<Void> deactivate(@PathVariable UUID ruleId) {
        ruleService.toggleRule(ruleId, false);
        return ResponseEntity.ok().build();
    }
}
