package uz.verifix.jobs.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import uz.verifix.jobs.domain.enums.PaymentGateway;

@Data
public class PurchaseRequest {

    @NotBlank
    private String planCode;

    @NotNull
    private PaymentGateway gateway;

    @NotBlank
    private String billingPeriod; // MONTHLY or ANNUAL

    private String returnUrl;
}
