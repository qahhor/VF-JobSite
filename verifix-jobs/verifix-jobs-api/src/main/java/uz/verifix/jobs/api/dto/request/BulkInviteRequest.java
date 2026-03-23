package uz.verifix.jobs.api.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class BulkInviteRequest {
    @NotNull private UUID employerId;
    @NotEmpty private List<UUID> candidateIds;
    @NotNull private UUID vacancyId;
    private String message;
}
