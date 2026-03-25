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
public class AbExperimentStatsResponse {

    private UUID id;
    private String name;
    private String description;
    private boolean active;
    private VariantStats variantA;
    private VariantStats variantB;
    private String winner;
    private double confidenceLevel;
    private Instant createdAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VariantStats {
        private String variant;
        private long total;
        private long converted;
        private double conversionRate;
    }
}
