package uz.verifix.jobs.api.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import uz.verifix.jobs.domain.enums.ManagerRole;

@Data
public class ManagerInviteRequest {

    @NotBlank
    @Email
    private String email;

    private String phone;

    @NotNull
    private ManagerRole role;
}
