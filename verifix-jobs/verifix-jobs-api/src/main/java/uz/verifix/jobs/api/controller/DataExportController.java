package uz.verifix.jobs.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import uz.verifix.jobs.api.security.SecurityUtils;
import uz.verifix.jobs.service.compliance.DataExportService;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/data")
@RequiredArgsConstructor
public class DataExportController {

    private final DataExportService dataExportService;

    @GetMapping("/export/candidate")
    public ResponseEntity<byte[]> exportCandidateData(
            @RequestParam(required = false) UUID candidateId,
            Authentication auth) {
        byte[] data = dataExportService.exportCandidateData(SecurityUtils.enforceCandidateAccess(auth, candidateId));
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=my_data.json")
                .contentType(MediaType.APPLICATION_JSON)
                .body(data);
    }

    @GetMapping("/export/employer")
    public ResponseEntity<byte[]> exportEmployerData(
            @RequestParam(required = false) UUID employerId,
            Authentication auth) {
        byte[] data = dataExportService.exportEmployerData(SecurityUtils.enforceEmployerAccess(auth, employerId));
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=employer_data.json")
                .contentType(MediaType.APPLICATION_JSON)
                .body(data);
    }

    @DeleteMapping("/account/candidate")
    public ResponseEntity<Map<String, String>> deleteCandidate(
            @RequestParam(required = false) UUID candidateId,
            Authentication auth) {
        dataExportService.deleteCandidate(SecurityUtils.enforceCandidateAccess(auth, candidateId));
        return ResponseEntity.ok(Map.of("status", "deleted", "message",
                "Your account has been deleted. Personal data has been anonymized."));
    }

    @DeleteMapping("/account/employer")
    public ResponseEntity<Map<String, String>> deleteEmployer(
            @RequestParam(required = false) UUID employerId,
            Authentication auth) {
        dataExportService.deleteEmployer(SecurityUtils.enforceEmployerAccess(auth, employerId));
        return ResponseEntity.ok(Map.of("status", "deleted", "message",
                "Employer account deleted. Vacancies unpublished. Branding page removed."));
    }
}
