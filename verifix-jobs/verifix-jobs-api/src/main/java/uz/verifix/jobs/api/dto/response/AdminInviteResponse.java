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
public class AdminInviteResponse {

    private UUID id;
    private String email;
    private String role;
    private boolean mustChangePassword;
    private boolean emailSent;
    private String temporaryPassword;
    private Instant inviteSentAt;
}
