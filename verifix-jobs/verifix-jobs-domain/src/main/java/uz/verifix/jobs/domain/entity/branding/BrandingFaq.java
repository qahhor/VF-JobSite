package uz.verifix.jobs.domain.entity.branding;

import jakarta.persistence.*;
import lombok.*;
import uz.verifix.jobs.domain.entity.BaseEntity;

@Entity
@Table(name = "branding_faq")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BrandingFaq extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branding_id", nullable = false)
    private EmployerBranding branding;

    @Column(name = "question_uz", length = 500)
    private String questionUz;

    @Column(name = "question_ru", length = 500)
    private String questionRu;

    @Column(name = "answer_uz", columnDefinition = "text")
    private String answerUz;

    @Column(name = "answer_ru", columnDefinition = "text")
    private String answerRu;

    @Column(name = "sort_order")
    @Builder.Default
    private Integer sortOrder = 0;
}
