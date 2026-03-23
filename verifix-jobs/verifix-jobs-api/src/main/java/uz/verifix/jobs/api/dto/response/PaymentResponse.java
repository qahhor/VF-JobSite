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
public class PaymentResponse {

    private UUID id;
    private String planCode;
    private String planName;
    private BigDecimal amount;
    private String currency;
    private String gateway;
    private String status;
    private Instant paidAt;
    private Instant createdAt;
}
