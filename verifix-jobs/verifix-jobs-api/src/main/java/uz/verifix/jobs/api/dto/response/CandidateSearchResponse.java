package uz.verifix.jobs.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CandidateSearchResponse {
    private UUID id;
    private String firstName;
    private String lastName;
    private String city;
    private String[] skills;
    private String educationLevel;
    private String workExperienceSummary;
    private boolean myidVerified;
    private String avatarUrl;
}
