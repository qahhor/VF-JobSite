package uz.verifix.jobs.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "ai_agent_run")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AiAgentRun {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "employer_id", nullable = false)
    private UUID employerId;

    @Column(name = "agent_type", nullable = false, length = 50)
    private String agentType;

    @Builder.Default
    @Column(name = "status", length = 20)
    private String status = "RUNNING";

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "input_data", columnDefinition = "jsonb")
    private Map<String, Object> inputData;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "output_data", columnDefinition = "jsonb")
    private Map<String, Object> outputData;

    @Builder.Default
    @Column(name = "tokens_used")
    private Integer tokensUsed = 0;

    @Column(name = "duration_ms")
    private Long durationMs;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @PrePersist
    void prePersist() { if (createdAt == null) createdAt = Instant.now(); }

    public void complete(Map<String, Object> output, int tokens, long durationMs) {
        this.outputData = output;
        this.tokensUsed = tokens;
        this.durationMs = durationMs;
        this.status = "COMPLETED";
        this.completedAt = Instant.now();
    }

    public void fail(String error) {
        this.errorMessage = error;
        this.status = "FAILED";
        this.completedAt = Instant.now();
    }
}
