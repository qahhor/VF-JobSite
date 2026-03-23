package uz.verifix.jobs.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CandidateProfileResponse {

    private UUID id;
    private String firstName;
    private String lastName;
    private String phone;
    private String city;
    private String region;
    private String gender;
    private String educationLevel;
    private LocalDate birthDate;
    private String[] skills;
    private String workExperienceText;
    private String avatarUrl;

    private List<WorkHistoryItem> workHistory;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WorkHistoryItem {
        private String jobTitle;
        private String companyName;
        private String employmentType;
        private LocalDate startDate;
        private LocalDate endDate;
        private String description;
    }
}
