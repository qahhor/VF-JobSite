package uz.verifix.jobs.api.dto.request.branding;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class ReorderRequest {
    @NotEmpty
    private List<UUID> orderedIds;
}
