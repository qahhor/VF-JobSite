package uz.verifix.jobs.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uz.verifix.jobs.api.dto.request.AbExperimentCreateRequest;
import uz.verifix.jobs.api.dto.response.AbExperimentResponse;
import uz.verifix.jobs.api.dto.response.AbExperimentStatsResponse;
import uz.verifix.jobs.common.dto.PageResponse;
import uz.verifix.jobs.domain.entity.AbExperiment;
import uz.verifix.jobs.service.ab.AbTestService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/ab")
@RequiredArgsConstructor
public class AbTestController {

    private final AbTestService abTestService;

    @GetMapping("/experiments")
    public ResponseEntity<PageResponse<AbExperimentResponse>> listExperiments(
            @PageableDefault(size = 20) Pageable pageable) {
        Page<AbExperimentResponse> page = abTestService.listAllExperiments(pageable)
                .map(this::toResponse);
        return ResponseEntity.ok(PageResponse.of(page));
    }

    @GetMapping("/experiments/active")
    public ResponseEntity<List<AbExperimentResponse>> listActiveExperiments() {
        List<AbExperimentResponse> experiments = abTestService.listActiveExperiments()
                .stream()
                .map(this::toResponse)
                .toList();
        return ResponseEntity.ok(experiments);
    }

    @PostMapping("/experiments")
    public ResponseEntity<AbExperimentResponse> createExperiment(
            @Valid @RequestBody AbExperimentCreateRequest request) {
        AbExperiment experiment = abTestService.createExperiment(request.getName(), request.getDescription());
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(experiment));
    }

    @GetMapping("/experiments/{name}")
    public ResponseEntity<AbExperimentResponse> getExperiment(@PathVariable String name) {
        AbExperiment experiment = abTestService.getExperimentByName(name);
        return ResponseEntity.ok(toResponse(experiment));
    }

    @GetMapping("/experiments/{name}/stats")
    public ResponseEntity<AbExperimentStatsResponse> getStats(@PathVariable String name) {
        AbTestService.ExperimentStats stats = abTestService.getStats(name);
        return ResponseEntity.ok(toStatsResponse(stats));
    }

    @PostMapping("/experiments/{name}/activate")
    public ResponseEntity<AbExperimentResponse> activateExperiment(@PathVariable String name) {
        AbExperiment experiment = abTestService.activateExperiment(name);
        return ResponseEntity.ok(toResponse(experiment));
    }

    @PostMapping("/experiments/{name}/deactivate")
    public ResponseEntity<AbExperimentResponse> deactivateExperiment(@PathVariable String name) {
        AbExperiment experiment = abTestService.deactivateExperiment(name);
        return ResponseEntity.ok(toResponse(experiment));
    }

    @DeleteMapping("/experiments/{name}")
    public ResponseEntity<Void> deleteExperiment(@PathVariable String name) {
        abTestService.deleteExperiment(name);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/experiments/{name}/convert")
    public ResponseEntity<Void> trackConversion(
            @PathVariable String name,
            @RequestParam UUID userId) {
        abTestService.trackConversion(userId, name);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/experiments/{name}/variant")
    public ResponseEntity<AbExperimentStatsResponse.VariantStats> getVariant(
            @PathVariable String name,
            @RequestParam UUID userId) {
        String variant = abTestService.getVariant(userId, name);
        AbExperimentStatsResponse.VariantStats response = AbExperimentStatsResponse.VariantStats.builder()
                .variant(variant)
                .build();
        return ResponseEntity.ok(response);
    }

    private AbExperimentResponse toResponse(AbExperiment experiment) {
        return AbExperimentResponse.builder()
                .id(experiment.getId())
                .name(experiment.getName())
                .description(experiment.getDescription())
                .active(experiment.isActive())
                .totalParticipants(abTestService.countParticipants(experiment))
                .totalConversions(abTestService.countConversions(experiment))
                .createdAt(experiment.getCreatedAt())
                .updatedAt(experiment.getUpdatedAt())
                .build();
    }

    private AbExperimentStatsResponse toStatsResponse(AbTestService.ExperimentStats stats) {
        return AbExperimentStatsResponse.builder()
                .id(stats.experiment().getId())
                .name(stats.experiment().getName())
                .description(stats.experiment().getDescription())
                .active(stats.experiment().isActive())
                .variantA(toVariantStats(stats.variantA()))
                .variantB(toVariantStats(stats.variantB()))
                .winner(stats.winner())
                .confidenceLevel(stats.confidenceLevel())
                .createdAt(stats.experiment().getCreatedAt())
                .build();
    }

    private AbExperimentStatsResponse.VariantStats toVariantStats(AbTestService.ExperimentStats.VariantStats stats) {
        return AbExperimentStatsResponse.VariantStats.builder()
                .variant(stats.variant())
                .total(stats.total())
                .converted(stats.converted())
                .conversionRate(stats.conversionRate())
                .build();
    }
}
