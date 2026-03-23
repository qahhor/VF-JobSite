package uz.verifix.jobs.api.dto.request;

import lombok.Data;
import uz.verifix.jobs.domain.enums.EducationLevel;
import uz.verifix.jobs.domain.enums.Gender;

import java.math.BigDecimal;

@Data
public class CandidateSearchRequest {
    private String city;
    private String[] skills;
    private String category;
    private BigDecimal minSalary;
    private BigDecimal maxSalary;
    private EducationLevel educationLevel;
    private Gender gender;
    private Boolean myidVerified;
    private int page = 0;
    private int size = 20;
}
