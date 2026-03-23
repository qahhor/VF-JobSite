package uz.verifix.jobs.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import uz.verifix.jobs.api.security.SecurityUtils;
import uz.verifix.jobs.domain.repository.ManagerRepository;
import uz.verifix.jobs.integration.storage.FileStorageService;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/files")
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.minio.enabled", havingValue = "true", matchIfMissing = false)
public class FileUploadController {

    private final FileStorageService fileStorageService;
    private final ManagerRepository managerRepository;

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final java.util.Set<String> ALLOWED_TYPES = java.util.Set.of(
            "image/jpeg", "image/png", "image/webp", "application/pdf"
    );

    @PostMapping("/upload/logo")
    public ResponseEntity<Map<String, String>> uploadLogo(
            @RequestParam("file") MultipartFile file,
            Authentication auth) throws IOException {

        UUID employerId = SecurityUtils.extractEmployerId(auth, managerRepository);
        validateFile(file);

        String objectName = fileStorageService.upload(
                "logos/" + employerId,
                file.getOriginalFilename(),
                file.getInputStream(),
                file.getContentType(),
                file.getSize());

        String url = fileStorageService.getPresignedUrl(objectName);
        return ResponseEntity.ok(Map.of("objectName", objectName, "url", url));
    }

    @PostMapping("/upload/resume")
    public ResponseEntity<Map<String, String>> uploadResume(
            @RequestParam("file") MultipartFile file,
            Authentication auth) throws IOException {

        UUID userId = SecurityUtils.extractManagerId(auth);
        validateFile(file);

        String objectName = fileStorageService.upload(
                "resumes/" + userId,
                file.getOriginalFilename(),
                file.getInputStream(),
                file.getContentType(),
                file.getSize());

        String url = fileStorageService.getPresignedUrl(objectName);
        return ResponseEntity.ok(Map.of("objectName", objectName, "url", url));
    }

    @GetMapping("/url")
    public ResponseEntity<Map<String, String>> getUrl(@RequestParam String objectName) {
        String url = fileStorageService.getPresignedUrl(objectName);
        return ResponseEntity.ok(Map.of("url", url));
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds 10MB limit");
        }
        if (!ALLOWED_TYPES.contains(file.getContentType())) {
            throw new IllegalArgumentException("File type not allowed. Allowed: JPEG, PNG, WebP, PDF");
        }
    }
}
