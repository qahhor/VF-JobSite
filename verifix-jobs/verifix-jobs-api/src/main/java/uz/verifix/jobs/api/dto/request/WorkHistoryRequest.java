package uz.verifix.jobs.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class WorkHistoryRequest {

    private UUID candidateId;

    @NotBlank
    private String jobTitle;

    @NotBlank
    private String companyName;

    private String employmentType;

    @NotNull
    private LocalDate startDate;

    private LocalDate endDate;

    private String description;
}
