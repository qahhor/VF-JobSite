package uz.verifix.jobs.api.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import uz.verifix.jobs.domain.enums.AdminRole;

@Data
public class AdminUpdateRoleRequest {

    @NotNull(message = "Role is required")
    private AdminRole role;
}
