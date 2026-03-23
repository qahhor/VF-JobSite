package uz.verifix.jobs.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationStatsResponse {

    private UUID vacancyId;
    private Map<String, Long> statusCounts;
    private long total;
}
