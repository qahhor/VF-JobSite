package uz.verifix.jobs.integration.sms;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SmsResult {

    private boolean success;
    private String externalId;
    private String errorMessage;

    public static SmsResult ok(String externalId) {
        return SmsResult.builder().success(true).externalId(externalId).build();
    }

    public static SmsResult fail(String errorMessage) {
        return SmsResult.builder().success(false).errorMessage(errorMessage).build();
    }
}
