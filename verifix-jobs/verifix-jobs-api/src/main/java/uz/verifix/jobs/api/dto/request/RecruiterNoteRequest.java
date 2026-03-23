package uz.verifix.jobs.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RecruiterNoteRequest {

    @NotBlank
    private String note;
}
