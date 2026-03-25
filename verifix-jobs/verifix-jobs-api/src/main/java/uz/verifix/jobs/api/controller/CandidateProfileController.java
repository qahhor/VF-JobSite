package uz.verifix.jobs.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import uz.verifix.jobs.api.security.SecurityUtils;
import uz.verifix.jobs.domain.entity.Candidate;
import uz.verifix.jobs.domain.entity.FavoriteVacancy;
import uz.verifix.jobs.domain.repository.CandidateRepository;
import uz.verifix.jobs.service.marketplace.PublicVacancyService;

import java.util.Map;
import java.util.UUID;

/**
 * Candidate profile REST API.
 */
@RestController
@RequestMapping("/api/v1/candidates/profile")
@RequiredArgsConstructor
public class CandidateProfileController {

    private final CandidateRepository candidateRepository;
    private final PublicVacancyService publicVacancyService;

    @GetMapping
    public ResponseEntity<Candidate> getProfile(Authentication auth) {
        UUID candidateId = SecurityUtils.extractUserId(auth);
        return candidateRepository.findById(candidateId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping
    public ResponseEntity<Candidate> updateProfile(Authentication auth, @RequestBody Map<String, Object> body) {
        UUID candidateId = SecurityUtils.extractUserId(auth);
        Candidate candidate = candidateRepository.findById(candidateId).orElse(null);
        if (candidate == null) return ResponseEntity.notFound().build();

        if (body.containsKey("firstName")) candidate.setFirstName((String) body.get("firstName"));
        if (body.containsKey("lastName")) candidate.setLastName((String) body.get("lastName"));
        if (body.containsKey("city")) candidate.setCity((String) body.get("city"));
        if (body.containsKey("preferredSalary") && body.get("preferredSalary") != null) {
            candidate.setPreferredSalary(new java.math.BigDecimal(body.get("preferredSalary").toString()));
        }
        if (body.containsKey("skills") && body.get("skills") instanceof java.util.List) {
            @SuppressWarnings("unchecked")
            java.util.List<String> skills = (java.util.List<String>) body.get("skills");
            candidate.setSkills(skills.toArray(new String[0]));
        }
        if (body.containsKey("preferredCategories") && body.get("preferredCategories") instanceof java.util.List) {
            @SuppressWarnings("unchecked")
            java.util.List<String> cats = (java.util.List<String>) body.get("preferredCategories");
            candidate.setPreferredCategories(cats.toArray(new String[0]));
        }

        return ResponseEntity.ok(candidateRepository.save(candidate));
    }

    // Favorites
    @PostMapping("/favorites/{vacancyId}")
    public ResponseEntity<Void> addFavorite(Authentication auth, @PathVariable UUID vacancyId) {
        UUID candidateId = SecurityUtils.extractUserId(auth);
        publicVacancyService.addFavorite(candidateId, vacancyId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/favorites/{vacancyId}")
    public ResponseEntity<Void> removeFavorite(Authentication auth, @PathVariable UUID vacancyId) {
        UUID candidateId = SecurityUtils.extractUserId(auth);
        publicVacancyService.removeFavorite(candidateId, vacancyId);
        return ResponseEntity.noContent().build();
    }
}
