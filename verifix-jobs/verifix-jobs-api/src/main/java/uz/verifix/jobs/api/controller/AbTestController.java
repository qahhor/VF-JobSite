package uz.verifix.jobs.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uz.verifix.jobs.domain.entity.AbExperiment;
import uz.verifix.jobs.service.ab.AbTestService;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/ab")
@RequiredArgsConstructor
public class AbTestController {

    private final AbTestService abTestService;

    @GetMapping("/experiments")
    public ResponseEntity<List<AbExperiment>> listExperiments() {
        return ResponseEntity.ok(abTestService.listExperiments());
    }

    @PostMapping("/experiments")
    public ResponseEntity<AbExperiment> createExperiment(@RequestBody Map<String, String> request) {
        AbExperiment experiment = abTestService.createExperiment(
                request.get("name"), request.get("description"));
        return ResponseEntity.ok(experiment);
    }

    @GetMapping("/experiments/{name}/stats")
    public ResponseEntity<Map<String, Object>> getStats(@PathVariable String name) {
        return ResponseEntity.ok(abTestService.getStats(name));
    }

    @PostMapping("/experiments/{name}/convert")
    public ResponseEntity<Map<String, String>> trackConversion(
            @PathVariable String name,
            @RequestParam UUID userId) {
        abTestService.trackConversion(userId, name);
        return ResponseEntity.ok(Map.of("status", "converted"));
    }

    @GetMapping("/experiments/{name}/variant")
    public ResponseEntity<Map<String, String>> getVariant(
            @PathVariable String name,
            @RequestParam UUID userId) {
        String variant = abTestService.getVariant(userId, name);
        return ResponseEntity.ok(Map.of("variant", variant));
    }
}
