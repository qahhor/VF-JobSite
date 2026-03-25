package uz.verifix.jobs.integration.ats;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AtsAiScoringRequest {
    @JsonProperty("company_code")
    private String companyCode;
    @JsonProperty("vacancy_id")
    private String vacancyId;
    @JsonProperty("candidate_id")
    private String candidateId;
    @JsonProperty("filial_id")
    private String filialId;
    // Vacancy details for AI context
    @JsonProperty("vacancy_title")
    private String vacancyTitle;
    @JsonProperty("vacancy_description")
    private String vacancyDescription;
    @JsonProperty("vacancy_requirements")
    private List<String> vacancyRequirements;
    @JsonProperty("salary_from")
    private BigDecimal salaryFrom;
    @JsonProperty("salary_to")
    private BigDecimal salaryTo;
    // Candidate profile for AI evaluation
    @JsonProperty("candidate_name")
    private String candidateName;
    @JsonProperty("candidate_phone")
    private String candidatePhone;
    @JsonProperty("candidate_city")
    private String candidateCity;
    @JsonProperty("candidate_skills")
    private List<String> candidateSkills;
    @JsonProperty("candidate_education")
    private String candidateEducation;
    @JsonProperty("candidate_experience")
    private String candidateExperience;
}
