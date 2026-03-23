package uz.verifix.jobs.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class SalaryPredictionResponse {
    private BigDecimal p25;
    private BigDecimal median;
    private BigDecimal p75;
    private long sampleSize;
    private String category;
    private String city;
    private String currency;
}
