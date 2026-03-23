package uz.verifix.jobs.service.candidate;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.verifix.jobs.common.exception.ForbiddenException;
import uz.verifix.jobs.common.exception.ResourceNotFoundException;
import uz.verifix.jobs.domain.entity.Candidate;
import uz.verifix.jobs.domain.entity.WorkHistory;
import uz.verifix.jobs.domain.repository.CandidateRepository;
import uz.verifix.jobs.domain.repository.WorkHistoryRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WorkHistoryService {

    private final WorkHistoryRepository workHistoryRepository;
    private final CandidateRepository candidateRepository;

    @Transactional
    public WorkHistory add(UUID candidateId, String jobTitle, String companyName,
                           String employmentType, LocalDate startDate, LocalDate endDate, String description) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate", candidateId.toString()));

        WorkHistory wh = WorkHistory.builder()
                .candidate(candidate)
                .jobTitle(jobTitle)
                .companyName(companyName)
                .employmentType(employmentType)
                .startDate(startDate)
                .endDate(endDate)
                .description(description)
                .build();

        return workHistoryRepository.save(wh);
    }

    @Transactional
    public WorkHistory update(UUID workHistoryId, UUID candidateId, String jobTitle, String companyName,
                              String employmentType, LocalDate startDate, LocalDate endDate, String description) {
        WorkHistory wh = getAndValidateOwnership(workHistoryId, candidateId);

        if (jobTitle != null) wh.setJobTitle(jobTitle);
        if (companyName != null) wh.setCompanyName(companyName);
        if (employmentType != null) wh.setEmploymentType(employmentType);
        if (startDate != null) wh.setStartDate(startDate);
        if (endDate != null) wh.setEndDate(endDate);
        if (description != null) wh.setDescription(description);

        return workHistoryRepository.save(wh);
    }

    @Transactional
    public void delete(UUID workHistoryId, UUID candidateId) {
        WorkHistory wh = getAndValidateOwnership(workHistoryId, candidateId);
        workHistoryRepository.delete(wh);
    }

    @Transactional(readOnly = true)
    public List<WorkHistory> getByCandidate(UUID candidateId) {
        return workHistoryRepository.findByCandidateIdOrderByStartDateDesc(candidateId);
    }

    private WorkHistory getAndValidateOwnership(UUID workHistoryId, UUID candidateId) {
        WorkHistory wh = workHistoryRepository.findById(workHistoryId)
                .orElseThrow(() -> new ResourceNotFoundException("WorkHistory", workHistoryId.toString()));
        if (!wh.getCandidate().getId().equals(candidateId)) {
            throw new ForbiddenException("Work history does not belong to this candidate");
        }
        return wh;
    }
}
