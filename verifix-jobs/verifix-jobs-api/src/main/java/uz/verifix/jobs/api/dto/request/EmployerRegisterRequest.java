package uz.verifix.jobs.api.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class EmployerRegisterRequest {

    @NotBlank(message = "Company name is required")
    private String companyName;

    @NotBlank(message = "INN is required")
    private String inn;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    @NotBlank(message = "Phone is required")
    private String phone;

    private String city;
    private String industry;
}
