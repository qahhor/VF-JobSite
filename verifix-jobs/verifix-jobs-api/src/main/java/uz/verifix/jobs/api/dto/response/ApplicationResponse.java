package uz.verifix.jobs.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationResponse {

    private UUID id;
    private UUID vacancyId;
    private String vacancyTitle;
    private UUID candidateId;
    private String candidateName;
    private String candidatePhone;
    private String candidateCity;
    private String status;
    private String source;
    private Instant appliedAt;
    private Instant viewedAt;
    private Instant invitedAt;
    private Instant rejectedAt;
    private Instant hiredAt;
    private String rejectionReason;
    private String recruiterNotes;
    private Instant createdAt;
}
