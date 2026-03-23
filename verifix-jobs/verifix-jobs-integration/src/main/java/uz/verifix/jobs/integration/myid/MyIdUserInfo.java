package uz.verifix.jobs.integration.myid;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MyIdUserInfo {

    private String passportSeries;
    private String firstName;
    private String lastName;
    private String middleName;
    private String birthDate;
    private String gender;
    private String address;
    private String photoBase64;
    private boolean verified;
}
