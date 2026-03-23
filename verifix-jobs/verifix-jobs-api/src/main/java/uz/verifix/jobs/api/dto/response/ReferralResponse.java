package uz.verifix.jobs.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReferralResponse {

    private UUID id;
    private String refereeFirstName;
    private String refereeLastName;
    private String status;
    private String rewardStatus;
    private BigDecimal rewardAmount;
    private Instant createdAt;
}
