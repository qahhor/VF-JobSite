package uz.verifix.jobs.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationDetailResponse {

    private UUID id;
    private String status;
    private String source;
    private Instant appliedAt;
    private Instant viewedAt;
    private Instant invitedAt;
    private Instant rejectedAt;
    private Instant hiredAt;
    private String rejectionReason;
    private String recruiterNotes;

    // Vacancy info
    private UUID vacancyId;
    private String vacancyTitle;

    // Candidate info
    private UUID candidateId;
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

    // Work history
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
