package uz.verifix.jobs.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uz.verifix.jobs.common.dto.PageResponse;
import uz.verifix.jobs.common.exception.ResourceNotFoundException;
import uz.verifix.jobs.domain.entity.AdminUser;
import uz.verifix.jobs.domain.entity.Candidate;
import uz.verifix.jobs.domain.entity.Employer;
import uz.verifix.jobs.domain.enums.EmployerStatus;
import uz.verifix.jobs.domain.repository.AdminUserRepository;
import uz.verifix.jobs.domain.repository.CandidateRepository;
import uz.verifix.jobs.domain.repository.EmployerRepository;
import uz.verifix.jobs.service.admin.AdminEmployerService;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final CandidateRepository candidateRepository;
    private final EmployerRepository employerRepository;
    private final AdminUserRepository adminUserRepository;
    private final AdminEmployerService adminEmployerService;

    @GetMapping
    public ResponseEntity<PageResponse<Map<String, Object>>> getUsers(
            @RequestParam(defaultValue = "EMPLOYER") String type,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<Map<String, Object>> page = switch (type.toUpperCase(Locale.ROOT)) {
            case "CANDIDATE" -> getCandidatePage(search, pageable);
            case "ADMIN" -> getAdminPage(search, pageable);
            default -> getEmployerPage(search, pageable);
        };
        return ResponseEntity.ok(PageResponse.of(page));
    }

    @PutMapping("/{id}/suspend")
    public ResponseEntity<Map<String, Object>> suspend(@PathVariable UUID id) {
        Employer employer = employerRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Employer", id.toString()));
        return ResponseEntity.ok(toEmployerRow(adminEmployerService.changeStatus(employer.getId(), EmployerStatus.SUSPENDED)));
    }

    @PutMapping("/{id}/activate")
    public ResponseEntity<Map<String, Object>> activate(@PathVariable UUID id) {
        Employer employer = employerRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Employer", id.toString()));
        return ResponseEntity.ok(toEmployerRow(adminEmployerService.changeStatus(employer.getId(), EmployerStatus.ACTIVE)));
    }

    private Page<Map<String, Object>> getEmployerPage(String search, Pageable pageable) {
        Page<Employer> employers = (search != null && !search.isBlank())
                ? employerRepository.findByNameContainingIgnoreCase(search, pageable)
                : employerRepository.findAll(pageable);
        return employers.map(this::toEmployerRow);
    }

    private Page<Map<String, Object>> getCandidatePage(String search, Pageable pageable) {
        List<Candidate> filtered = candidateRepository.findAll().stream()
                .filter(candidate -> matchesSearch(search,
                        candidate.getFirstName(),
                        candidate.getLastName(),
                        candidate.getPhone(),
                        candidate.getCity()))
                .toList();
        return paginate(filtered, pageable).map(this::toCandidateRow);
    }

    private Page<Map<String, Object>> getAdminPage(String search, Pageable pageable) {
        List<AdminUser> filtered = adminUserRepository.findAll().stream()
                .filter(admin -> matchesSearch(search, admin.getEmail(), admin.getRole() != null ? admin.getRole().name() : null))
                .toList();
        return paginate(filtered, pageable).map(this::toAdminRow);
    }

    private boolean matchesSearch(String search, String... values) {
        if (search == null || search.isBlank()) {
            return true;
        }
        String needle = search.toLowerCase(Locale.ROOT);
        for (String value : values) {
            if (value != null && value.toLowerCase(Locale.ROOT).contains(needle)) {
                return true;
            }
        }
        return false;
    }

    private <T> Page<T> paginate(List<T> items, Pageable pageable) {
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), items.size());
        List<T> content = start >= items.size() ? List.of() : items.subList(start, end);
        return new PageImpl<>(content, PageRequest.of(pageable.getPageNumber(), pageable.getPageSize()), items.size());
    }

    private Map<String, Object> toEmployerRow(Employer employer) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("id", employer.getId());
        data.put("name", employer.getName());
        data.put("email", employer.getInn());
        data.put("phone", null);
        data.put("status", employer.getStatus() != null ? employer.getStatus().name() : EmployerStatus.PENDING.name());
        data.put("createdAt", employer.getCreatedAt());
        data.put("type", "EMPLOYER");
        return data;
    }

    private Map<String, Object> toCandidateRow(Candidate candidate) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("id", candidate.getId());
        data.put("firstName", candidate.getFirstName());
        data.put("lastName", candidate.getLastName());
        data.put("phone", candidate.getPhone());
        data.put("status", "ACTIVE");
        data.put("createdAt", candidate.getCreatedAt());
        data.put("type", "CANDIDATE");
        return data;
    }

    private Map<String, Object> toAdminRow(AdminUser admin) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("id", admin.getId());
        data.put("name", admin.getEmail());
        data.put("email", admin.getEmail());
        data.put("status", "ACTIVE");
        data.put("createdAt", admin.getCreatedAt());
        data.put("type", "ADMIN");
        return data;
    }
}
