package uz.verifix.jobs.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class GovStatsResponse {
    private Map<String, SourceStats> bySource;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class SourceStats {
        private long synced;
        private long pending;
        private long failed;
        private long total;
    }
}
