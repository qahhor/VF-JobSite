package uz.verifix.jobs.api.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import uz.verifix.jobs.domain.enums.UserType;

import java.util.UUID;

@Data
public class VerificationInitRequest {

    @NotNull
    private UserType entityType;

    @NotNull
    private UUID entityId;
}
