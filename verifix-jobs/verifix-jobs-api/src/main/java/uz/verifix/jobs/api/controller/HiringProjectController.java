package uz.verifix.jobs.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import uz.verifix.jobs.api.security.SecurityUtils;
import uz.verifix.jobs.service.hiringproject.HiringProjectService;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/hiring-projects")
@RequiredArgsConstructor
public class HiringProjectController {

    private final HiringProjectService projectService;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getProjects(Authentication auth) {
        UUID employerId = SecurityUtils.extractEmployerId(auth);
        return ResponseEntity.ok(projectService.getProjects(employerId));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createProject(Authentication auth, @RequestBody Map<String, Object> body) {
        UUID employerId = SecurityUtils.extractEmployerId(auth);
        return ResponseEntity.ok(projectService.createProject(employerId,
                (String) body.get("name"), (String) body.get("description"),
                body.get("targetHires") != null ? ((Number) body.get("targetHires")).intValue() : null,
                body.get("deadline") != null ? LocalDate.parse((String) body.get("deadline")) : null));
    }

    @PostMapping("/{projectId}/vacancies")
    public ResponseEntity<Void> addVacancy(@PathVariable UUID projectId, @RequestBody Map<String, String> body) {
        projectService.addVacancyToProject(projectId, UUID.fromString(body.get("vacancyId")));
        return ResponseEntity.ok().build();
    }
}
