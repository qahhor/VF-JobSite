package uz.verifix.jobs.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import uz.verifix.jobs.service.vacancy.VacancyImportService;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/vacancies/import")
@RequiredArgsConstructor
public class VacancyImportController {

    private final VacancyImportService importService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> importCsv(
            @RequestParam UUID employerId,
            @RequestParam MultipartFile file) throws IOException {

        VacancyImportService.ImportResult result = importService.importFromCsv(employerId, file.getInputStream());

        return ResponseEntity.ok(Map.of(
                "totalRows", result.totalRows(),
                "importedCount", result.importedCount(),
                "skippedCount", result.skippedCount(),
                "errors", result.errors()
        ));
    }

    @GetMapping("/template")
    public ResponseEntity<byte[]> downloadTemplate() {
        byte[] template = importService.getImportTemplate();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=vacancy_import_template.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(template);
    }
}
