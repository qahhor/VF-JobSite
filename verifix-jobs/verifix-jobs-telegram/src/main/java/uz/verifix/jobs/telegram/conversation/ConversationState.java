package uz.verifix.jobs.telegram.conversation;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationState implements Serializable {

    private Long chatId;
    private RegistrationStep currentStep;
    private String phone;
    private String firstName;
    private String lastName;
    private String city;
    private String referralCode;
    private String editField;
    private String language;

    public enum RegistrationStep {
        LANGUAGE,
        PHONE,
        FIRST_NAME,
        LAST_NAME,
        CITY,
        COMPLETED
    }
}
