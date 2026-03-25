package uz.verifix.jobs.integration.ats;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AtsBroadcastToRequest {
    @JsonProperty("chat_ids")
    private List<Long> chatIds;
    private String method;
    private Map<String, Object> payload;
    @JsonProperty("company_code")
    private String companyCode;
}
