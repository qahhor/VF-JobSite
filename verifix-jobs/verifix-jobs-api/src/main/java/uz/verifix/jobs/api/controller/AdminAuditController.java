package uz.verifix.jobs.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import uz.verifix.jobs.common.dto.PageResponse;
import uz.verifix.jobs.domain.entity.AdminAuditLog;
import uz.verifix.jobs.service.admin.AdminAuditService;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/audit")
@RequiredArgsConstructor
public class AdminAuditController {

    private final AdminAuditService adminAuditService;

    @GetMapping
    public ResponseEntity<PageResponse<Map<String, Object>>> getAuditLogs(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<Map<String, Object>> page = adminAuditService.getAll(pageable).map(this::toResponse);
        return ResponseEntity.ok(PageResponse.of(page));
    }

    private Map<String, Object> toResponse(AdminAuditLog log) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("id", log.getId());
        data.put("createdAt", log.getCreatedAt());
        data.put("adminId", log.getAdmin() != null ? log.getAdmin().getId() : null);
        data.put("adminEmail", log.getAdmin() != null ? log.getAdmin().getEmail() : null);
        data.put("action", log.getAction());
        data.put("entityType", log.getEntityType());
        data.put("entityId", log.getEntityId());
        data.put("details", log.getDetails());
        data.put("ipAddress", log.getIpAddress());
        return data;
    }
}
