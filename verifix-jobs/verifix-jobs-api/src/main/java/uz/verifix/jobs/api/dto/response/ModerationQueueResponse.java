package uz.verifix.jobs.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModerationQueueResponse {

    private UUID id;
    private String entityType;
    private UUID entityId;
    private String status;
    private String reason;
    private String title;
    private String subtitle;
    private String previewText;
    private String city;
    private String category;
    private String salaryLabel;
    private Instant decidedAt;
    private Instant createdAt;
}
