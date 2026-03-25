package uz.verifix.jobs.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "ai_screening_result")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AiScreeningResult {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "application_id", nullable = false, unique = true)
    private UUID applicationId;

    @Column(name = "agent_run_id")
    private UUID agentRunId;

    @Column(name = "score")
    private Integer score;

    @Column(name = "recommendation", length = 20)
    private String recommendation;

    @Column(name = "summary", columnDefinition = "TEXT")
    private String summary;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "pros", columnDefinition = "jsonb")
    private List<String> pros;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "cons", columnDefinition = "jsonb")
    private List<String> cons;

    @Column(name = "created_at")
    private Instant createdAt;

    @PrePersist
    void prePersist() { if (createdAt == null) createdAt = Instant.now(); }
}
