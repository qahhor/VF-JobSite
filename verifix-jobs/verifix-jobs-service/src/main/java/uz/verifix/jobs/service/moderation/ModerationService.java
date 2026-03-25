package uz.verifix.jobs.service.moderation;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.verifix.jobs.common.exception.ResourceNotFoundException;
import uz.verifix.jobs.domain.entity.ModerationQueue;
import uz.verifix.jobs.domain.entity.Vacancy;
import uz.verifix.jobs.domain.enums.EmployerStatus;
import uz.verifix.jobs.domain.enums.ModerationEntityType;
import uz.verifix.jobs.domain.enums.ModerationStatus;
import uz.verifix.jobs.domain.enums.VacancyStatus;
import uz.verifix.jobs.domain.repository.ModerationQueueRepository;
import uz.verifix.jobs.domain.repository.VacancyRepository;

import java.math.BigDecimal;
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
    private final ModerationProperties moderationProperties;

    @Transactional
    public ModerationQueue submitForModeration(UUID vacancyId) {
        Vacancy vacancy = vacancyRepository.findById(vacancyId)
                .orElseThrow(() -> new ResourceNotFoundException("Vacancy", vacancyId));

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

        String manualReviewReason = checkManualReview(vacancy);
        if (manualReviewReason != null) {
            vacancy.setModerationStatus(ModerationStatus.PENDING);
            vacancy.setModerationNote(manualReviewReason);
            vacancy.setStatus(VacancyStatus.PENDING_MODERATION);
            vacancyRepository.save(vacancy);

            ModerationQueue queue = createQueueEntry(vacancyId, ModerationStatus.PENDING, manualReviewReason);
            log.info("Vacancy {} queued for manual moderation by rule: {}", vacancyId, manualReviewReason);
            return queue;
        }

        if (shouldAutoApprove(vacancy)) {
            vacancy.setModerationStatus(ModerationStatus.APPROVED);
            vacancy.setStatus(VacancyStatus.ACTIVE);
            vacancyRepository.save(vacancy);

            ModerationQueue queue = createQueueEntry(vacancyId, ModerationStatus.APPROVED, "Auto-approved");
            log.info("Vacancy {} auto-approved", vacancyId);
            return queue;
        }

        vacancy.setModerationStatus(ModerationStatus.PENDING);
        vacancy.setModerationNote(null);
        vacancy.setStatus(VacancyStatus.PENDING_MODERATION);
        vacancyRepository.save(vacancy);

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
        String text = (vacancy.getTitle() + " " + (vacancy.getDescription() != null ? vacancy.getDescription() : "")).toLowerCase();
        for (Pattern pattern : blacklistedPatterns()) {
            if (pattern.matcher(text).find()) {
                return rejectReason(pattern);
            }
        }

        BigDecimal salary = vacancy.getSalaryTo() != null ? vacancy.getSalaryTo() : vacancy.getSalaryFrom();
        if (salary != null && salary.compareTo(moderationProperties.getMinimumWageUzs()) < 0) {
            return moderationProperties.getMinimumWageReason();
        }

        return null;
    }

    private String checkManualReview(Vacancy vacancy) {
        String text = vacancyText(vacancy);
        return moderationProperties.getManualReviewKeywords().stream()
                .filter(keyword -> keyword != null && !keyword.isBlank())
                .map(String::toLowerCase)
                .filter(text::contains)
                .findFirst()
                .map(keyword -> moderationProperties.getManualReviewReason() + ": " + keyword)
                .orElse(null);
    }

    private boolean shouldAutoApprove(Vacancy vacancy) {
        if (vacancy.getEmployer().getIsVerified() == null || !vacancy.getEmployer().getIsVerified()) {
            return false;
        }
        if (vacancy.getEmployer().getStatus() == EmployerStatus.SUSPENDED
                || vacancy.getEmployer().getModerationStatus() == ModerationStatus.REJECTED) {
            return false;
        }

        long approvedCount = vacancyRepository.countByEmployerIdAndModerationStatus(
                vacancy.getEmployer().getId(), ModerationStatus.APPROVED);
        long rejectedCount = vacancyRepository.countByEmployerIdAndModerationStatus(
                vacancy.getEmployer().getId(), ModerationStatus.REJECTED);
        long reviewedCount = vacancyRepository.countByEmployerIdAndModerationStatusIn(
                vacancy.getEmployer().getId(), List.of(ModerationStatus.APPROVED, ModerationStatus.REJECTED));
        double rejectionRate = reviewedCount == 0 ? 0.0d : (double) rejectedCount / reviewedCount;

        return approvedCount >= moderationProperties.getAutoApprove().getMinApproved()
                && rejectionRate <= moderationProperties.getAutoApprove().getMaxRejectionRate();
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

    private String vacancyText(Vacancy vacancy) {
        String title = vacancy.getTitle() != null ? vacancy.getTitle() : "";
        String description = vacancy.getDescription() != null ? vacancy.getDescription() : "";
        return (title + " " + description).toLowerCase();
    }

    private List<Pattern> blacklistedPatterns() {
        return moderationProperties.getRejectRules().stream()
                .filter(ModerationProperties.ContentRule::isEnabled)
                .map(this::compileRule)
                .toList();
    }

    private String rejectReason(Pattern matchedPattern) {
        return moderationProperties.getRejectRules().stream()
                .filter(ModerationProperties.ContentRule::isEnabled)
                .filter(rule -> compileRule(rule).pattern().equals(matchedPattern.pattern()))
                .map(ModerationProperties.ContentRule::getReason)
                .findFirst()
                .orElse("Content contains prohibited words");
    }

    private Pattern compileRule(ModerationProperties.ContentRule rule) {
        return switch (rule.getType()) {
            case REGEX -> Pattern.compile(rule.getPattern(), Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE);
            case TERM -> Pattern.compile(Pattern.quote(rule.getPattern()), Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE);
        };
    }
}
