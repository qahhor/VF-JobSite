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

    @Column(name = "fact_type", length = 50, nullable = false)
    private String factType;

    @Column(name = "fact_key", length = 200)
    private String factKey;

    @Column(name = "fact_value", columnDefinition = "text")
    private String content;

    @Column(columnDefinition = "jsonb")
    private String metadata;

    @Column(length = 50)
    private String source;

    @Column(name = "created_at")
    private Instant createdAt;

    @PrePersist
    void prePersist() { if (createdAt == null) createdAt = Instant.now(); if (source == null) source = "MANUAL"; }
}
