package uz.verifix.jobs.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import uz.verifix.jobs.api.security.SecurityUtils;
import uz.verifix.jobs.common.dto.PageResponse;
import uz.verifix.jobs.domain.entity.ActivityEvent;
import uz.verifix.jobs.domain.entity.EmployerTask;
import uz.verifix.jobs.domain.repository.EmployerTaskRepository;
import uz.verifix.jobs.service.dashboard.ActivityFeedService;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Employer Intelligence Dashboard — tasks, activity feed, SSE stream.
 */
@RestController
@RequestMapping("/api/v1/employer/dashboard")
@RequiredArgsConstructor
public class EmployerDashboardController {

    private final EmployerTaskRepository taskRepository;
    private final ActivityFeedService activityFeedService;

    // ==================== Task Inbox ====================

    @GetMapping("/tasks")
    public ResponseEntity<PageResponse<EmployerTask>> getTasks(
            Authentication auth,
            @RequestParam(defaultValue = "OPEN") String status,
            @PageableDefault(size = 20) Pageable pageable) {
        UUID employerId = SecurityUtils.extractEmployerId(auth);
        Page<EmployerTask> tasks = taskRepository.findByEmployerIdAndStatusOrderByCreatedAtDesc(employerId, status, pageable);
        return ResponseEntity.ok(PageResponse.of(tasks));
    }

    @GetMapping("/tasks/count")
    public ResponseEntity<Map<String, Long>> getTaskCounts(Authentication auth) {
        UUID employerId = SecurityUtils.extractEmployerId(auth);
        return ResponseEntity.ok(Map.of(
                "open", taskRepository.countByEmployerIdAndStatus(employerId, "OPEN"),
                "urgent", taskRepository.countByEmployerIdAndStatus(employerId, "URGENT")
        ));
    }

    @PatchMapping("/tasks/{taskId}")
    public ResponseEntity<EmployerTask> updateTask(@PathVariable UUID taskId, @RequestBody Map<String, String> body) {
        return taskRepository.findById(taskId).map(task -> {
            if (body.containsKey("status")) {
                task.setStatus(body.get("status"));
                if ("COMPLETED".equals(body.get("status"))) task.setCompletedAt(Instant.now());
            }
            return ResponseEntity.ok(taskRepository.save(task));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ==================== Activity Feed ====================

    @GetMapping("/feed")
    public ResponseEntity<PageResponse<ActivityEvent>> getFeed(
            Authentication auth, @PageableDefault(size = 30) Pageable pageable) {
        UUID employerId = SecurityUtils.extractEmployerId(auth);
        return ResponseEntity.ok(PageResponse.of(activityFeedService.getFeed(employerId, pageable)));
    }

    @GetMapping("/feed/recent")
    public ResponseEntity<List<ActivityEvent>> getRecentFeed(
            Authentication auth, @RequestParam(defaultValue = "24") int hours) {
        UUID employerId = SecurityUtils.extractEmployerId(auth);
        return ResponseEntity.ok(activityFeedService.getRecentFeed(employerId, hours));
    }

    /**
     * SSE endpoint for real-time activity feed.
     * Client connects and receives events as they happen.
     */
    @GetMapping(value = "/feed/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamFeed(Authentication auth) {
        UUID employerId = SecurityUtils.extractEmployerId(auth);
        SseEmitter emitter = new SseEmitter(30 * 60 * 1000L); // 30 min timeout

        // Initial events
        try {
            List<ActivityEvent> recent = activityFeedService.getRecentFeed(employerId, 1);
            for (ActivityEvent event : recent) {
                emitter.send(SseEmitter.event()
                        .name(event.getEventType())
                        .data(event));
            }
        } catch (Exception e) {
            emitter.completeWithError(e);
        }

        return emitter;
    }
}
