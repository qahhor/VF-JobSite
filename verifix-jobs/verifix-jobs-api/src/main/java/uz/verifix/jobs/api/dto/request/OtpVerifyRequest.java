package uz.verifix.jobs.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OtpVerifyRequest {

    @NotBlank(message = "Phone is required")
    private String phone;

    @NotBlank(message = "OTP code is required")
    private String code;
}
