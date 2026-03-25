package uz.verifix.jobs.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import uz.verifix.jobs.api.security.SecurityUtils;
import uz.verifix.jobs.domain.entity.VacancyTemplate;
import uz.verifix.jobs.service.automation.InterviewSchedulerService;
import uz.verifix.jobs.service.automation.ResumeParserService;
import uz.verifix.jobs.service.automation.VacancyTemplateService;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Recruiter automation endpoints — resume parsing, templates, interview scheduling.
 */
@RestController
@RequestMapping("/api/v1/automation")
@RequiredArgsConstructor
public class AutomationController {

    private final ResumeParserService resumeParser;
    private final VacancyTemplateService templateService;
    private final InterviewSchedulerService interviewScheduler;

    // ==================== Resume Parsing ====================

    @PostMapping("/resume/parse")
    public ResponseEntity<?> parseResume(@RequestBody Map<String, String> body) {
        String resumeText = body.get("text");
        if (resumeText == null || resumeText.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Resume text is required"));
        }

        ResumeParserService.ParsedResume result = resumeParser.parse(resumeText);
        if (result == null) {
            return ResponseEntity.status(503).body(Map.of("error", "AI service not available"));
        }
        return ResponseEntity.ok(result);
    }

    // ==================== Vacancy Templates ====================

    @GetMapping("/templates")
    public ResponseEntity<List<VacancyTemplate>> getTemplates(Authentication auth) {
        UUID employerId = SecurityUtils.extractEmployerId(auth);
        return ResponseEntity.ok(templateService.getTemplates(employerId));
    }

    @PostMapping("/templates")
    public ResponseEntity<VacancyTemplate> createTemplate(Authentication auth, @RequestBody Map<String, Object> body) {
        UUID employerId = SecurityUtils.extractEmployerId(auth);
        String name = (String) body.get("name");
        @SuppressWarnings("unchecked")
        Map<String, Object> templateData = (Map<String, Object>) body.get("templateData");
        return ResponseEntity.ok(templateService.createTemplate(employerId, name, templateData));
    }

    @PutMapping("/templates/{templateId}")
    public ResponseEntity<VacancyTemplate> updateTemplate(
            Authentication auth, @PathVariable UUID templateId, @RequestBody Map<String, Object> body) {
        UUID employerId = SecurityUtils.extractEmployerId(auth);
        String name = (String) body.get("name");
        @SuppressWarnings("unchecked")
        Map<String, Object> templateData = (Map<String, Object>) body.get("templateData");
        return ResponseEntity.ok(templateService.updateTemplate(templateId, employerId, name, templateData));
    }

    @DeleteMapping("/templates/{templateId}")
    public ResponseEntity<Void> deleteTemplate(Authentication auth, @PathVariable UUID templateId) {
        UUID employerId = SecurityUtils.extractEmployerId(auth);
        templateService.deleteTemplate(templateId, employerId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/templates/{templateId}/use")
    public ResponseEntity<Map<String, Object>> useTemplate(Authentication auth, @PathVariable UUID templateId) {
        UUID employerId = SecurityUtils.extractEmployerId(auth);
        Map<String, Object> data = templateService.useTemplate(templateId, employerId);
        return ResponseEntity.ok(data);
    }

    // ==================== Interview Scheduling ====================

    @GetMapping("/interviews/slots")
    public ResponseEntity<List<InterviewSchedulerService.TimeSlot>> getSlots(
            Authentication auth,
            @RequestParam(defaultValue = "7") int daysAhead,
            @RequestParam(defaultValue = "60") int slotMinutes) {
        UUID employerId = SecurityUtils.extractEmployerId(auth);
        return ResponseEntity.ok(interviewScheduler.getAvailableSlots(employerId, daysAhead, slotMinutes));
    }

    @PostMapping("/interviews/book")
    public ResponseEntity<?> bookInterview(Authentication auth, @RequestBody Map<String, String> body) {
        UUID employerId = SecurityUtils.extractEmployerId(auth);
        UUID applicationId = UUID.fromString(body.get("applicationId"));
        LocalDate date = LocalDate.parse(body.get("date"));
        LocalTime time = LocalTime.parse(body.get("time"));
        String location = body.get("location");
        String notes = body.get("notes");

        InterviewSchedulerService.InterviewBooking booking =
                interviewScheduler.bookInterview(applicationId, employerId, date, time, location, notes);

        if (booking == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Application not found or access denied"));
        }
        return ResponseEntity.ok(booking);
    }
}
