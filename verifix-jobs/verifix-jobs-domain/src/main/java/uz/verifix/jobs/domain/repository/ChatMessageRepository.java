package uz.verifix.jobs.domain.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import uz.verifix.jobs.domain.entity.ChatMessage;

import java.util.List;
import java.util.UUID;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, UUID> {

    Page<ChatMessage> findByEmployerIdAndCandidateIdOrderByCreatedAtDesc(UUID employerId, UUID candidateId, Pageable pageable);

    @Query("SELECT DISTINCT m.candidateId FROM ChatMessage m WHERE m.employerId = ?1 ORDER BY m.candidateId")
    List<UUID> findDistinctCandidateIdsByEmployerId(UUID employerId);

    @Query("SELECT COUNT(m) FROM ChatMessage m WHERE m.employerId = ?1 AND m.senderType = 'CANDIDATE' AND m.isRead = false")
    long countUnreadByEmployer(UUID employerId);

    @Modifying
    @Query("UPDATE ChatMessage m SET m.isRead = true WHERE m.employerId = ?1 AND m.candidateId = ?2 AND m.senderType = 'CANDIDATE' AND m.isRead = false")
    void markAsRead(UUID employerId, UUID candidateId);
}
