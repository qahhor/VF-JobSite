package uz.verifix.jobs.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class GovSyncHistoryResponse {
    private UUID id;
    private String source;
    private String direction;
    private String entityType;
    private UUID entityId;
    private String status;
    private String errorMessage;
    private Instant syncedAt;
    private Instant createdAt;
}
