package uz.verifix.jobs.api.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import uz.verifix.jobs.domain.enums.ManagerRole;

@Data
public class ManagerRoleUpdateRequest {

    @NotNull
    private ManagerRole role;
}
