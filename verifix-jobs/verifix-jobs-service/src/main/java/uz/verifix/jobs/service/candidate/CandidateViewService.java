package uz.verifix.jobs.service.candidate;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.verifix.jobs.common.exception.ForbiddenException;
import uz.verifix.jobs.common.exception.ResourceNotFoundException;
import uz.verifix.jobs.domain.entity.Candidate;
import uz.verifix.jobs.domain.entity.WorkHistory;
import uz.verifix.jobs.domain.repository.ApplicationRepository;
import uz.verifix.jobs.domain.repository.CandidateRepository;
import uz.verifix.jobs.domain.repository.WorkHistoryRepository;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CandidateViewService {

    private final CandidateRepository candidateRepository;
    private final ApplicationRepository applicationRepository;
    private final WorkHistoryRepository workHistoryRepository;

    @Transactional(readOnly = true)
    public Candidate viewCandidate(UUID candidateId, UUID employerId) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate", candidateId.toString()));

        // Privacy check: only allow viewing if candidate applied to employer's vacancy
        boolean hasApplied = applicationRepository.existsByCandidateIdAndVacancy_EmployerId(candidateId, employerId);
        if (!hasApplied) {
            throw new ForbiddenException("You can only view candidates who applied to your vacancies");
        }

        return candidate;
    }

    @Transactional(readOnly = true)
    public List<WorkHistory> getWorkHistory(UUID candidateId) {
        return workHistoryRepository.findByCandidateIdOrderByStartDateDesc(candidateId);
    }
}
