package uz.verifix.jobs.integration.verifix;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class HrmDivision {
    private Long id;
    private String name;
    @JsonProperty("parent_id")
    private Long parentId;
    @JsonProperty("is_department")
    private boolean department;
    @JsonProperty("manager_name")
    private String managerName;
    private String state;
}
