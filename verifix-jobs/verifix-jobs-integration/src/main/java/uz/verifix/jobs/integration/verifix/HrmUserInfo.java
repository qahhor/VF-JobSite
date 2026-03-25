package uz.verifix.jobs.integration.verifix;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class HrmUserInfo {
    @JsonProperty("user_id")
    private Long userId;
    @JsonProperty("company_id")
    private Long companyId;
    @JsonProperty("company_code")
    private String companyCode;
    @JsonProperty("company_name")
    private String companyName;
    private String username;
    @JsonProperty("full_name")
    private String fullName;
    private String email;
    private String phone;
    @JsonProperty("filial_id")
    private Long filialId;
    private String role;
}
