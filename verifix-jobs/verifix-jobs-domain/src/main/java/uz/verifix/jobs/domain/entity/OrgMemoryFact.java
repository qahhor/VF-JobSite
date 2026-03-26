package uz.verifix.jobs.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "org_memory_fact")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OrgMemoryFact {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "employer_id", nullable = false)
    private UUID employerId;

    @Column(name = "fact_type", length = 50)
    private String factType;

    @Column(columnDefinition = "text", nullable = false)
    private String content;

    @Column(length = 50)
    private String source;

    @Column(name = "created_at")
    private Instant createdAt;

    @PrePersist
    void prePersist() { if (createdAt == null) createdAt = Instant.now(); if (source == null) source = "MANUAL"; }
}
