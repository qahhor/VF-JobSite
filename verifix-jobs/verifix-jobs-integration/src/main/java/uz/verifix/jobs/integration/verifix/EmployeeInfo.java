package uz.verifix.jobs.integration.verifix;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class EmployeeInfo {
    private UUID id;
    private String name;
    private String position;
    private String photoUrl;
    private String department;
    private String phone;
}
