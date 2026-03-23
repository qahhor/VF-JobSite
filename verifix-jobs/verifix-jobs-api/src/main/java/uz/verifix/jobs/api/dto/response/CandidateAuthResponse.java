package uz.verifix.jobs.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CandidateAuthResponse {

    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private UUID candidateId;
    private boolean newUser;
}
