package uz.verifix.jobs.integration.verifix;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class HrmCandidateResult {
    private boolean success;
    private String candidateId;
    private String errorMessage;

    public static HrmCandidateResult ok(String candidateId) {
        return HrmCandidateResult.builder().success(true).candidateId(candidateId).build();
    }

    public static HrmCandidateResult fail(String error) {
        return HrmCandidateResult.builder().success(false).errorMessage(error).build();
    }
}
