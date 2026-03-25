package uz.verifix.jobs.integration.verifix;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class HrmCandidateRequest {
    @JsonProperty("first_name")
    private String firstName;
    @JsonProperty("last_name")
    private String lastName;
    @JsonProperty("middle_name")
    private String middleName;
    private String gender;
    private String birthday;
    @JsonProperty("main_phone")
    private String mainPhone;
    private String email;
    private String address;
    @JsonProperty("wage_expectation")
    private BigDecimal wageExpectation;
    @JsonProperty("region_id")
    private Long regionId;
    @JsonProperty("job_ids")
    private List<Long> jobIds;
    @JsonProperty("candidate_skills")
    private String skills;
    @JsonProperty("channel_pcode")
    private String channelPcode;
    @JsonProperty("vacancy_id")
    private Long vacancyId;
    private String note;
    private String source;
}
