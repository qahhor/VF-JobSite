package uz.verifix.jobs.domain.entity.branding;

import jakarta.persistence.*;
import lombok.*;
import uz.verifix.jobs.domain.entity.BaseEntity;

@Entity
@Table(name = "branding_testimonial")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BrandingTestimonial extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branding_id", nullable = false)
    private EmployerBranding branding;

    @Column(name = "employee_name", nullable = false, length = 200)
    private String employeeName;

    @Column(name = "employee_position", length = 200)
    private String employeePosition;

    @Column(name = "employee_photo_url", length = 1000)
    private String employeePhotoUrl;

    @Column(name = "text_uz", columnDefinition = "text")
    private String textUz;

    @Column(name = "text_ru", columnDefinition = "text")
    private String textRu;

    @Column(name = "verifix_employee_id", length = 100)
    private String verifixEmployeeId;

    @Column(name = "is_verified")
    @Builder.Default
    private Boolean isVerified = false;

    @Column(name = "sort_order")
    @Builder.Default
    private Integer sortOrder = 0;
}
