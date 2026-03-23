package uz.verifix.jobs.api.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import uz.verifix.jobs.domain.enums.ApplicationStatus;

import java.util.List;
import java.util.UUID;

@Data
public class BulkStatusRequest {

    @NotNull
    private UUID employerId;

    @NotEmpty
    private List<UUID> applicationIds;

    @NotNull
    private ApplicationStatus newStatus;
}
