package uz.verifix.jobs.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import uz.verifix.jobs.api.security.SecurityUtils;
import uz.verifix.jobs.service.dashboard.ResponseInboxService;
import uz.verifix.jobs.service.dashboard.VacancyBoardService;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/employer")
@RequiredArgsConstructor
public class VacancyBoardController {

    private final VacancyBoardService boardService;
    private final ResponseInboxService inboxService;

    @GetMapping("/vacancy-board")
    public ResponseEntity<List<VacancyBoardService.BoardItem>> getBoard(
            Authentication auth, @RequestParam(required = false) String status) {
        UUID employerId = SecurityUtils.extractEmployerId(auth);
        return ResponseEntity.ok(boardService.getBoard(employerId, status));
    }

    @GetMapping("/response-inbox")
    public ResponseEntity<List<ResponseInboxService.InboxGroup>> getInbox(Authentication auth) {
        UUID employerId = SecurityUtils.extractEmployerId(auth);
        return ResponseEntity.ok(inboxService.getInbox(employerId));
    }

    @PostMapping("/response-inbox/bulk")
    public ResponseEntity<Map<String, Object>> bulkAction(Authentication auth, @RequestBody Map<String, Object> body) {
        UUID employerId = SecurityUtils.extractEmployerId(auth);
        @SuppressWarnings("unchecked")
        List<String> ids = (List<String>) body.get("applicationIds");
        List<UUID> appIds = ids.stream().map(UUID::fromString).toList();
        String status = (String) body.get("status");
        String note = (String) body.get("note");
        int count = inboxService.bulkAction(employerId, appIds,
                uz.verifix.jobs.domain.enums.ApplicationStatus.valueOf(status), note);
        return ResponseEntity.ok(Map.of("processed", count));
    }
}
