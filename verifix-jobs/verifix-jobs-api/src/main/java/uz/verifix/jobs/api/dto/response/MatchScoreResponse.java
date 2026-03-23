package uz.verifix.jobs.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class MatchScoreResponse {
    private UUID candidateId;
    private UUID vacancyId;
    private BigDecimal matchScore;
    private Map<String, Object> factors;
    private String candidateName;
    private String candidateCity;
    private String vacancyTitle;
    private Instant scoredAt;
}
