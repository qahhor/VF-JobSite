package uz.verifix.jobs.api.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class InviteCandidateRequest {

    @NotNull
    private UUID vacancyId;

    @NotNull
    private UUID candidateId;

    private String note;
}
