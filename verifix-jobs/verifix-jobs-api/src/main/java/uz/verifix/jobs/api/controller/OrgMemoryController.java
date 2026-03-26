package uz.verifix.jobs.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import uz.verifix.jobs.api.security.SecurityUtils;
import uz.verifix.jobs.domain.entity.OrgMemoryFact;
import uz.verifix.jobs.domain.repository.OrgMemoryFactRepository;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/employer/org-memory")
@RequiredArgsConstructor
public class OrgMemoryController {

    private final OrgMemoryFactRepository factRepository;

    @GetMapping
    public ResponseEntity<List<OrgMemoryFact>> getFacts(Authentication auth) {
        UUID employerId = SecurityUtils.extractEmployerId(auth);
        return ResponseEntity.ok(factRepository.findByEmployerIdOrderByCreatedAtDesc(employerId));
    }

    @PostMapping
    public ResponseEntity<OrgMemoryFact> addFact(Authentication auth, @RequestBody Map<String, String> body) {
        UUID employerId = SecurityUtils.extractEmployerId(auth);
        OrgMemoryFact fact = OrgMemoryFact.builder()
                .employerId(employerId)
                .factType(body.getOrDefault("category", "NOTE"))
                .content(body.get("content"))
                .source(body.getOrDefault("source", "MANUAL"))
                .build();
        return ResponseEntity.ok(factRepository.save(fact));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeFact(@PathVariable UUID id) {
        factRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
