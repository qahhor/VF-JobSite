package uz.verifix.jobs.api.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import uz.verifix.jobs.domain.enums.ConsentType;
import uz.verifix.jobs.domain.enums.UserType;

import java.util.UUID;

@Data
public class ConsentRequest {

    @NotNull
    private UserType userType;

    @NotNull
    private UUID userId;

    @NotNull
    private ConsentType consentType;

    private String version;
}
