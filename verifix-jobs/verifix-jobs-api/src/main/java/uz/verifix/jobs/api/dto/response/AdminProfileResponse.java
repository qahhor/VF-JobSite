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
public class AdminProfileResponse {

    private UUID id;
    private String email;
    private String role;
    private boolean totpEnabled;
    private boolean mustChangePassword;
    private Instant createdAt;
    private Instant lastLoginAt;
    private Instant passwordChangedAt;
    private Instant inviteSentAt;
}
