package uz.verifix.jobs.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uz.verifix.jobs.api.dto.request.CandidateSearchRequest;
import uz.verifix.jobs.api.dto.response.CandidateSearchResponse;
import uz.verifix.jobs.api.dto.response.WorkHistoryResponse;
import uz.verifix.jobs.domain.entity.Candidate;
import uz.verifix.jobs.domain.entity.WorkHistory;
import uz.verifix.jobs.domain.enums.MyIdStatus;
import uz.verifix.jobs.service.candidate.CandidateSearchService;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/candidates")
@RequiredArgsConstructor
public class CandidateSearchController {

    private final CandidateSearchService searchService;

    @PostMapping("/search")
    public ResponseEntity<Page<CandidateSearchResponse>> search(
            @RequestParam UUID employerId,
            @RequestBody CandidateSearchRequest request) {

        Page<Candidate> results = searchService.searchCandidates(employerId,
                request.getCity(), request.getSkills(), request.getCategory(),
                request.getMinSalary(), request.getMaxSalary(),
                request.getEducationLevel(), request.getGender(), request.getMyidVerified(),
                PageRequest.of(request.getPage(), request.getSize()));

        return ResponseEntity.ok(results.map(this::toSearchResponse));
    }

    @GetMapping("/{id}/profile")
    public ResponseEntity<Map<String, Object>> getProfile(
            @RequestParam UUID employerId, @PathVariable UUID id) {

        Candidate c = searchService.getCandidateProfile(employerId, id);
        List<WorkHistory> history = searchService.getCandidateWorkHistory(id);

        return ResponseEntity.ok(Map.of(
                "candidate", toSearchResponse(c),
                "workHistory", history.stream().map(wh -> WorkHistoryResponse.builder()
                        .id(wh.getId()).jobTitle(wh.getJobTitle()).companyName(wh.getCompanyName())
                        .employmentType(wh.getEmploymentType()).startDate(wh.getStartDate())
                        .endDate(wh.getEndDate()).description(wh.getDescription()).build()).toList()
        ));
    }

    private CandidateSearchResponse toSearchResponse(Candidate c) {
        return CandidateSearchResponse.builder()
                .id(c.getId())
                .firstName(c.getFirstName())
                .lastName(c.getLastName())
                .city(c.getCity())
                .skills(c.getSkills())
                .educationLevel(c.getEducationLevel() != null ? c.getEducationLevel().name() : null)
                .workExperienceSummary(c.getWorkExperienceText())
                .myidVerified(c.getMyidStatus() == MyIdStatus.VERIFIED)
                .avatarUrl(c.getAvatarUrl())
                .build();
    }
}
