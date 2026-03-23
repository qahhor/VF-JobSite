package uz.verifix.jobs.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uz.verifix.jobs.service.compliance.DataExportService;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/data")
@RequiredArgsConstructor
public class DataExportController {

    private final DataExportService dataExportService;

    @GetMapping("/export/candidate")
    public ResponseEntity<byte[]> exportCandidateData(@RequestParam UUID candidateId) {
        byte[] data = dataExportService.exportCandidateData(candidateId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=my_data.json")
                .contentType(MediaType.APPLICATION_JSON)
                .body(data);
    }

    @GetMapping("/export/employer")
    public ResponseEntity<byte[]> exportEmployerData(@RequestParam UUID employerId) {
        byte[] data = dataExportService.exportEmployerData(employerId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=employer_data.json")
                .contentType(MediaType.APPLICATION_JSON)
                .body(data);
    }

    @DeleteMapping("/account/candidate")
    public ResponseEntity<Map<String, String>> deleteCandidate(@RequestParam UUID candidateId) {
        dataExportService.deleteCandidate(candidateId);
        return ResponseEntity.ok(Map.of("status", "deleted", "message",
                "Your account has been deleted. Personal data has been anonymized."));
    }

    @DeleteMapping("/account/employer")
    public ResponseEntity<Map<String, String>> deleteEmployer(@RequestParam UUID employerId) {
        dataExportService.deleteEmployer(employerId);
        return ResponseEntity.ok(Map.of("status", "deleted", "message",
                "Employer account deleted. Vacancies unpublished. Branding page removed."));
    }
}
