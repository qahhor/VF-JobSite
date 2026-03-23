package uz.verifix.jobs.service.moderation;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.verifix.jobs.common.exception.ResourceNotFoundException;
import uz.verifix.jobs.domain.entity.ModerationQueue;

import java.math.BigDecimal;
import uz.verifix.jobs.domain.entity.Vacancy;
import uz.verifix.jobs.domain.enums.ModerationEntityType;
import uz.verifix.jobs.domain.enums.ModerationStatus;
import uz.verifix.jobs.domain.enums.VacancyStatus;
import uz.verifix.jobs.domain.repository.ModerationQueueRepository;
import uz.verifix.jobs.domain.repository.VacancyRepository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class ModerationService {

    private final ModerationQueueRepository moderationQueueRepository;
    private final VacancyRepository vacancyRepository;

    private static final List<Pattern> BLACKLISTED_PATTERNS = List.of(
            Pattern.compile("(?i)(scam|fraud|мошенник|обман)"),
            Pattern.compile("(?i)(18\\+|adult|xxx)")
    );

    private static final java.math.BigDecimal MIN_WAGE_UZS = new java.math.BigDecimal("920000");

    @Transactional
    public ModerationQueue submitForModeration(UUID vacancyId) {
        Vacancy vacancy = vacancyRepository.findById(vacancyId)
                .orElseThrow(() -> new ResourceNotFoundException("Vacancy", vacancyId));

        // Auto-reject checks
        String autoRejectReason = checkAutoReject(vacancy);
        if (autoRejectReason != null) {
            vacancy.setModerationStatus(ModerationStatus.REJECTED);
            vacancy.setModerationNote(autoRejectReason);
            vacancy.setStatus(VacancyStatus.DRAFT);
            vacancyRepository.save(vacancy);

            ModerationQueue queue = createQueueEntry(vacancyId, ModerationStatus.REJECTED, autoRejectReason);
            log.info("Vacancy {} auto-rejected: {}", vacancyId, autoRejectReason);
            return queue;
        }

        // Auto-approve for verified employers with good history
        if (shouldAutoApprove(vacancy)) {
            vacancy.setModerationStatus(ModerationStatus.APPROVED);
            vacancy.setStatus(VacancyStatus.ACTIVE);
            vacancyRepository.save(vacancy);

            ModerationQueue queue = createQueueEntry(vacancyId, ModerationStatus.APPROVED, "Auto-approved");
            log.info("Vacancy {} auto-approved", vacancyId);
            return queue;
        }

        // Manual moderation needed
        ModerationQueue queue = createQueueEntry(vacancyId, ModerationStatus.PENDING, null);
        log.info("Vacancy {} queued for manual moderation", vacancyId);
        return queue;
    }

    @Transactional
    public void approve(UUID queueId, UUID moderatorId) {
        ModerationQueue queue = moderationQueueRepository.findById(queueId)
                .orElseThrow(() -> new ResourceNotFoundException("ModerationQueue", queueId));

        queue.setStatus(ModerationStatus.APPROVED);
        queue.setDecidedAt(Instant.now());
        moderationQueueRepository.save(queue);

        if (queue.getEntityType() == ModerationEntityType.VACANCY) {
            Vacancy vacancy = vacancyRepository.findById(queue.getEntityId())
                    .orElseThrow(() -> new ResourceNotFoundException("Vacancy", queue.getEntityId()));
            vacancy.setModerationStatus(ModerationStatus.APPROVED);
            vacancy.setStatus(VacancyStatus.ACTIVE);
            vacancyRepository.save(vacancy);
        }

        log.info("Moderation {} approved by {}", queueId, moderatorId);
    }

    @Transactional
    public void reject(UUID queueId, UUID moderatorId, String reason) {
        ModerationQueue queue = moderationQueueRepository.findById(queueId)
                .orElseThrow(() -> new ResourceNotFoundException("ModerationQueue", queueId));

        queue.setStatus(ModerationStatus.REJECTED);
        queue.setReason(reason);
        queue.setDecidedAt(Instant.now());
        moderationQueueRepository.save(queue);

        if (queue.getEntityType() == ModerationEntityType.VACANCY) {
            Vacancy vacancy = vacancyRepository.findById(queue.getEntityId())
                    .orElseThrow(() -> new ResourceNotFoundException("Vacancy", queue.getEntityId()));
            vacancy.setModerationStatus(ModerationStatus.REJECTED);
            vacancy.setModerationNote(reason);
            vacancy.setStatus(VacancyStatus.DRAFT);
            vacancyRepository.save(vacancy);
        }

        log.info("Moderation {} rejected by {}: {}", queueId, moderatorId, reason);
    }

    @Transactional(readOnly = true)
    public Page<ModerationQueue> getPendingQueue(Pageable pageable) {
        return moderationQueueRepository.findByStatusOrderByCreatedAtAsc(ModerationStatus.PENDING, pageable);
    }

    private String checkAutoReject(Vacancy vacancy) {
        // Check blacklisted words
        String text = (vacancy.getTitle() + " " + (vacancy.getDescription() != null ? vacancy.getDescription() : "")).toLowerCase();
        for (Pattern pattern : BLACKLISTED_PATTERNS) {
            if (pattern.matcher(text).find()) {
                return "Content contains prohibited words";
            }
        }

        // Check minimum wage
        if (vacancy.getSalaryTo() != null && vacancy.getSalaryTo().compareTo(MIN_WAGE_UZS) < 0) {
            return "Salary below minimum wage";
        }

        return null;
    }

    private boolean shouldAutoApprove(Vacancy vacancy) {
        if (vacancy.getEmployer().getIsVerified() == null || !vacancy.getEmployer().getIsVerified()) {
            return false;
        }
        long approvedCount = vacancyRepository.countByEmployerIdAndStatus(
                vacancy.getEmployer().getId(), VacancyStatus.ACTIVE);
        return approvedCount >= 10;
    }

    private ModerationQueue createQueueEntry(UUID entityId, ModerationStatus status, String reason) {
        ModerationQueue queue = ModerationQueue.builder()
                .entityType(ModerationEntityType.VACANCY)
                .entityId(entityId)
                .status(status)
                .reason(reason)
                .decidedAt(status != ModerationStatus.PENDING ? Instant.now() : null)
                .build();
        return moderationQueueRepository.save(queue);
    }

}
