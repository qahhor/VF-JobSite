package uz.verifix.jobs.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "favorite_vacancy")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FavoriteVacancy {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "candidate_id", nullable = false)
    private UUID candidateId;

    @Column(name = "vacancy_id", nullable = false)
    private UUID vacancyId;

    @Column(name = "created_at")
    private Instant createdAt;

    @PrePersist
    void prePersist() { if (createdAt == null) createdAt = Instant.now(); }
}
