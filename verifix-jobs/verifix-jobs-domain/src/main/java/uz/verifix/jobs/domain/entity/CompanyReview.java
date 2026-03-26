package uz.verifix.jobs.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "company_review")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CompanyReview {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "employer_id", nullable = false)
    private UUID employerId;

    @Column(name = "candidate_id")
    private UUID candidateId;

    @Column(name = "author_name", nullable = false)
    private String authorName;

    @Column(nullable = false)
    private Integer rating;

    private String title;

    @Column(columnDefinition = "text")
    private String pros;

    @Column(columnDefinition = "text")
    private String cons;

    @Column(name = "is_anonymous")
    private Boolean isAnonymous;

    @Column(length = 20)
    private String status;

    @Column(name = "created_at")
    private Instant createdAt;

    @PrePersist
    void prePersist() { if (createdAt == null) createdAt = Instant.now(); if (status == null) status = "PUBLISHED"; }
}
