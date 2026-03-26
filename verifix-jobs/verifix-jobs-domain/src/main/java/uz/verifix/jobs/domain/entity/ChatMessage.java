package uz.verifix.jobs.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "chat_message")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "employer_id", nullable = false)
    private UUID employerId;

    @Column(name = "candidate_id", nullable = false)
    private UUID candidateId;

    @Column(name = "vacancy_id")
    private UUID vacancyId;

    @Column(name = "sender_type", nullable = false, length = 20)
    private String senderType; // EMPLOYER or CANDIDATE

    @Column(nullable = false, columnDefinition = "text")
    private String message;

    @Column(name = "is_read")
    private Boolean isRead;

    @Column(name = "created_at")
    private Instant createdAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = Instant.now();
        if (isRead == null) isRead = false;
    }
}
