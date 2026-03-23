package uz.verifix.jobs.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkHistoryResponse {

    private UUID id;
    private String jobTitle;
    private String companyName;
    private String employmentType;
    private LocalDate startDate;
    private LocalDate endDate;
    private String description;
}
