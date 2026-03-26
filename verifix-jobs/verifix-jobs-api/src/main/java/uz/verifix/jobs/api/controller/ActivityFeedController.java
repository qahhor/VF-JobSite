package uz.verifix.jobs.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import uz.verifix.jobs.api.security.SecurityUtils;
import uz.verifix.jobs.domain.entity.ActivityEvent;
import uz.verifix.jobs.service.dashboard.ActivityFeedService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/employer/activity")
@RequiredArgsConstructor
public class ActivityFeedController {

    private final ActivityFeedService activityFeedService;

    @GetMapping
    public ResponseEntity<List<ActivityEvent>> getFeed(
            Authentication auth,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        UUID employerId = SecurityUtils.extractEmployerId(auth);
        return ResponseEntity.ok(activityFeedService.getFeed(employerId, PageRequest.of(page, size)).getContent());
    }

    @GetMapping("/recent")
    public ResponseEntity<List<ActivityEvent>> getRecent(
            Authentication auth,
            @RequestParam(defaultValue = "24") int hours) {
        UUID employerId = SecurityUtils.extractEmployerId(auth);
        return ResponseEntity.ok(activityFeedService.getRecentFeed(employerId, hours));
    }
}
