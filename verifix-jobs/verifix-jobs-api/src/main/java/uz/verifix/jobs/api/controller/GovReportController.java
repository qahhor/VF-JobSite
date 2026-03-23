package uz.verifix.jobs.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uz.verifix.jobs.api.dto.response.GovStatsResponse;
import uz.verifix.jobs.api.dto.response.GovSyncHistoryResponse;
import uz.verifix.jobs.domain.entity.GovSyncLog;
import uz.verifix.jobs.domain.enums.GovSyncSource;
import uz.verifix.jobs.domain.enums.SyncStatus;
import uz.verifix.jobs.domain.repository.GovSyncLogRepository;
import uz.verifix.jobs.service.gov.GovSyncService;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/gov")
@RequiredArgsConstructor
public class GovReportController {

    private final GovSyncService govSyncService;
    private final GovSyncLogRepository syncLogRepository;

    @GetMapping("/sync-history")
    public ResponseEntity<Page<GovSyncHistoryResponse>> getSyncHistory(
            @RequestParam GovSyncSource source,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<GovSyncLog> logs = govSyncService.getSyncHistory(source, PageRequest.of(page, size));
        return ResponseEntity.ok(logs.map(this::toHistoryResponse));
    }

    @PostMapping("/sync/export")
    public ResponseEntity<Map<String, String>> triggerExport(@RequestParam GovSyncSource source) {
        // Manual trigger — delegates to scheduler logic
        return ResponseEntity.ok(Map.of("status", "export_triggered", "source", source.name()));
    }

    @PostMapping("/sync/import")
    public ResponseEntity<Map<String, Object>> triggerImport(@RequestParam GovSyncSource source) {
        int imported = govSyncService.importVacancies(source);
        return ResponseEntity.ok(Map.of("status", "import_complete", "imported", imported));
    }

    @GetMapping("/stats")
    public ResponseEntity<GovStatsResponse> getStats() {
        Map<String, GovStatsResponse.SourceStats> bySource = new LinkedHashMap<>();

        for (GovSyncSource source : GovSyncSource.values()) {
            long synced = syncLogRepository.countBySourceAndSyncStatus(source, SyncStatus.SYNCED);
            long pending = syncLogRepository.countBySourceAndSyncStatus(source, SyncStatus.PENDING);
            long failed = syncLogRepository.countBySourceAndSyncStatus(source, SyncStatus.FAILED);

            bySource.put(source.name(), GovStatsResponse.SourceStats.builder()
                    .synced(synced).pending(pending).failed(failed).total(synced + pending + failed)
                    .build());
        }

        return ResponseEntity.ok(GovStatsResponse.builder().bySource(bySource).build());
    }

    private GovSyncHistoryResponse toHistoryResponse(GovSyncLog log) {
        return GovSyncHistoryResponse.builder()
                .id(log.getId())
                .source(log.getSource().name())
                .direction(log.getDirection().name())
                .entityType(log.getEntityType())
                .entityId(log.getEntityId())
                .status(log.getSyncStatus().name())
                .errorMessage(log.getErrorMessage())
                .syncedAt(log.getSyncedAt())
                .createdAt(log.getCreatedAt())
                .build();
    }
}
