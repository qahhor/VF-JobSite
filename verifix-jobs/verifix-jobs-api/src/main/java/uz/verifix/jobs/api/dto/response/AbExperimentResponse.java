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
public class AbExperimentResponse {

    private UUID id;
    private String name;
    private String description;
    private boolean active;
    private long totalParticipants;
    private long totalConversions;
    private Instant createdAt;
    private Instant updatedAt;
}
