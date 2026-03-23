package uz.verifix.jobs.service.candidate;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.verifix.jobs.common.exception.ResourceNotFoundException;
import uz.verifix.jobs.domain.entity.Candidate;
import uz.verifix.jobs.domain.entity.WorkHistory;
import uz.verifix.jobs.domain.enums.EducationLevel;
import uz.verifix.jobs.domain.enums.Gender;
import uz.verifix.jobs.domain.repository.CandidateRepository;
import uz.verifix.jobs.domain.repository.WorkHistoryRepository;
import uz.verifix.jobs.domain.specification.CandidateSpecification;
import uz.verifix.jobs.service.billing.SubscriptionEnforcementService;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CandidateSearchService {

    private final CandidateRepository candidateRepository;
    private final WorkHistoryRepository workHistoryRepository;
    private final SubscriptionEnforcementService subscriptionEnforcement;

    @Transactional(readOnly = true)
    public Page<Candidate> searchCandidates(UUID employerId, String city, String[] skills,
                                             String category, BigDecimal minSalary, BigDecimal maxSalary,
                                             EducationLevel educationLevel, Gender gender,
                                             Boolean myidVerified, Pageable pageable) {
        subscriptionEnforcement.enforceResumeSearch(employerId);

        return candidateRepository.findAll(
                CandidateSpecification.withFilters(city, skills, category, minSalary, maxSalary,
                        educationLevel, gender, myidVerified),
                pageable);
    }

    @Transactional(readOnly = true)
    public Candidate getCandidateProfile(UUID employerId, UUID candidateId) {
        subscriptionEnforcement.enforceResumeSearch(employerId);

        return candidateRepository.findById(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate", candidateId.toString()));
    }

    @Transactional(readOnly = true)
    public List<WorkHistory> getCandidateWorkHistory(UUID candidateId) {
        return workHistoryRepository.findByCandidateIdOrderByStartDateDesc(candidateId);
    }
}
