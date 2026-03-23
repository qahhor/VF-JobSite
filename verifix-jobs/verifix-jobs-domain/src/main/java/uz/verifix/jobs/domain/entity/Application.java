package uz.verifix.jobs.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import uz.verifix.jobs.domain.enums.ApplicationSource;
import uz.verifix.jobs.domain.enums.ApplicationStatus;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "application", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"vacancy_id", "candidate_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Application extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vacancy_id", nullable = false)
    private Vacancy vacancy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private ApplicationStatus status = ApplicationStatus.NEW;

    @Enumerated(EnumType.STRING)
    @Column(name = "source")
    private ApplicationSource source;

    @Column(name = "applied_at")
    private Instant appliedAt;

    @Column(name = "viewed_at")
    private Instant viewedAt;

    @Column(name = "invited_at")
    private Instant invitedAt;

    @Column(name = "rejected_at")
    private Instant rejectedAt;

    @Column(name = "hired_at")
    private Instant hiredAt;

    @Column(name = "rejection_reason")
    private String rejectionReason;

    @Column(name = "recruiter_notes", columnDefinition = "text")
    private String recruiterNotes;

    @Column(name = "verifix_employee_id")
    private UUID verifixEmployeeId;
}
