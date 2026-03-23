package uz.verifix.jobs.integration.verifix;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class EmployeeResult {
    private boolean success;
    private UUID employeeId;
    private String errorMessage;

    public static EmployeeResult ok(UUID employeeId) {
        return EmployeeResult.builder().success(true).employeeId(employeeId).build();
    }

    public static EmployeeResult fail(String error) {
        return EmployeeResult.builder().success(false).errorMessage(error).build();
    }
}
