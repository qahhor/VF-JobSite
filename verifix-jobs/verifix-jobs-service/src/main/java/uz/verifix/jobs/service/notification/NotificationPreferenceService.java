package uz.verifix.jobs.service.notification;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.verifix.jobs.common.exception.ForbiddenException;
import uz.verifix.jobs.common.exception.ResourceNotFoundException;
import uz.verifix.jobs.domain.entity.Candidate;
import uz.verifix.jobs.domain.entity.Manager;
import uz.verifix.jobs.domain.repository.CandidateRepository;
import uz.verifix.jobs.domain.repository.ManagerRepository;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationPreferenceService {

    private final CandidateRepository candidateRepository;
    private final ManagerRepository managerRepository;

    @Transactional
    public void updateCandidatePushSubscription(UUID candidateId, String subscriptionJson) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate", candidateId.toString()));
        candidate.setPushSubscriptionJson(normalize(subscriptionJson));
        candidateRepository.save(candidate);
    }

    @Transactional
    public void clearCandidatePushSubscription(UUID candidateId) {
        updateCandidatePushSubscription(candidateId, null);
    }

    @Transactional
    public void updateManagerPushSubscription(UUID managerId, UUID employerId, String subscriptionJson) {
        Manager manager = managerRepository.findById(managerId)
                .orElseThrow(() -> new ResourceNotFoundException("Manager", managerId.toString()));
        if (!manager.getEmployer().getId().equals(employerId)) {
            throw new ForbiddenException("Manager does not belong to this employer");
        }

        manager.setPushSubscriptionJson(normalize(subscriptionJson));
        managerRepository.save(manager);
    }

    @Transactional
    public void clearManagerPushSubscription(UUID managerId, UUID employerId) {
        updateManagerPushSubscription(managerId, employerId, null);
    }

    private String normalize(String subscriptionJson) {
        if (subscriptionJson == null || subscriptionJson.isBlank()) {
            return null;
        }
        return subscriptionJson.trim();
    }
}
