package uz.verifix.jobs.integration.gov;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class GovSyncResult {
    private boolean success;
    private String externalId;
    private String errorMessage;

    public static GovSyncResult ok(String externalId) {
        return GovSyncResult.builder().success(true).externalId(externalId).build();
    }

    public static GovSyncResult fail(String error) {
        return GovSyncResult.builder().success(false).errorMessage(error).build();
    }
}
