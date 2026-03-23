package uz.verifix.jobs.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import uz.verifix.jobs.api.dto.response.CandidateProfileResponse;
import uz.verifix.jobs.api.security.SecurityUtils;
import uz.verifix.jobs.domain.entity.Candidate;
import uz.verifix.jobs.domain.entity.WorkHistory;
import uz.verifix.jobs.domain.repository.ManagerRepository;
import uz.verifix.jobs.service.candidate.CandidateViewService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/candidates")
@RequiredArgsConstructor
public class CandidateViewController {

    private final CandidateViewService candidateViewService;
    private final ManagerRepository managerRepository;

    @GetMapping("/{id}")
    public ResponseEntity<CandidateProfileResponse> getCandidate(
            @PathVariable UUID id,
            Authentication auth) {

        UUID employerId = SecurityUtils.extractEmployerId(auth, managerRepository);
        Candidate candidate = candidateViewService.viewCandidate(id, employerId);
        List<WorkHistory> workHistory = candidateViewService.getWorkHistory(id);
        return ResponseEntity.ok(toResponse(candidate, workHistory));
    }

    private CandidateProfileResponse toResponse(Candidate c, List<WorkHistory> histories) {
        return CandidateProfileResponse.builder()
                .id(c.getId())
                .firstName(c.getFirstName())
                .lastName(c.getLastName())
                .phone(c.getPhone())
                .city(c.getCity())
                .region(c.getRegion())
                .gender(c.getGender() != null ? c.getGender().name() : null)
                .educationLevel(c.getEducationLevel() != null ? c.getEducationLevel().name() : null)
                .birthDate(c.getBirthDate())
                .skills(c.getSkills())
                .workExperienceText(c.getWorkExperienceText())
                .avatarUrl(c.getAvatarUrl())
                .workHistory(histories.stream().map(wh -> CandidateProfileResponse.WorkHistoryItem.builder()
                        .jobTitle(wh.getJobTitle())
                        .companyName(wh.getCompanyName())
                        .employmentType(wh.getEmploymentType() != null ? wh.getEmploymentType().name() : null)
                        .startDate(wh.getStartDate())
                        .endDate(wh.getEndDate())
                        .description(wh.getDescription())
                        .build()).toList())
                .build();
    }
}
