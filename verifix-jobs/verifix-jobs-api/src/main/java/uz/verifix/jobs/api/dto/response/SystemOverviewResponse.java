package uz.verifix.jobs.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemOverviewResponse {

    private long totalEmployers;
    private long totalCandidates;
    private long totalVacancies;
    private long activeVacancies;
    private long totalApplications;
    private long totalHired;
    private long newCandidatesLast7Days;
    private long newVacanciesLast7Days;
}
