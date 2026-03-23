package uz.verifix.jobs.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardOverviewResponse {

    private long activeVacancies;
    private long draftVacancies;
    private long pausedVacancies;
    private long closedVacancies;
    private long totalApplications;
    private long newApplications;
    private long hiredCount;
}
