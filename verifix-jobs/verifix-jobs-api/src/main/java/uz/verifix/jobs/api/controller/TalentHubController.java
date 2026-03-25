package uz.verifix.jobs.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import uz.verifix.jobs.api.security.SecurityUtils;
import uz.verifix.jobs.service.talenthub.TalentHubService;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/talent-hub")
@RequiredArgsConstructor
public class TalentHubController {

    private final TalentHubService talentHub;

    @GetMapping("/lists")
    public ResponseEntity<List<Map<String, Object>>> getLists(Authentication auth) {
        UUID employerId = SecurityUtils.extractEmployerId(auth);
        return ResponseEntity.ok(talentHub.getLists(employerId));
    }

    @PostMapping("/lists")
    public ResponseEntity<Map<String, Object>> createList(Authentication auth, @RequestBody Map<String, String> body) {
        UUID employerId = SecurityUtils.extractEmployerId(auth);
        return ResponseEntity.ok(talentHub.createList(employerId, body.get("name"), body.get("description")));
    }

    @PostMapping("/lists/{listId}/candidates")
    public ResponseEntity<Void> addCandidate(@PathVariable UUID listId, @RequestBody Map<String, Object> body) {
        UUID candidateId = UUID.fromString((String) body.get("candidateId"));
        String notes = (String) body.get("notes");
        @SuppressWarnings("unchecked")
        List<String> tags = (List<String>) body.get("tags");
        talentHub.addCandidate(listId, candidateId, notes, tags);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/lists/{listId}/candidates/{candidateId}")
    public ResponseEntity<Void> removeCandidate(@PathVariable UUID listId, @PathVariable UUID candidateId) {
        talentHub.removeCandidate(listId, candidateId);
        return ResponseEntity.noContent().build();
    }
}
