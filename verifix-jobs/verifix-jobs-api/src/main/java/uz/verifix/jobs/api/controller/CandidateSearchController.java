package uz.verifix.jobs.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import uz.verifix.jobs.api.dto.request.CandidateSearchRequest;
import uz.verifix.jobs.api.dto.response.CandidateSearchResponse;
import uz.verifix.jobs.api.mapper.CandidateSearchMapper;
import uz.verifix.jobs.api.mapper.WorkHistoryMapper;
import uz.verifix.jobs.api.security.SecurityUtils;
import uz.verifix.jobs.domain.entity.Candidate;
import uz.verifix.jobs.domain.entity.WorkHistory;
import uz.verifix.jobs.service.candidate.CandidateSearchService;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/candidates")
@RequiredArgsConstructor
public class CandidateSearchController {

    private final CandidateSearchService searchService;
    private final CandidateSearchMapper candidateSearchMapper;
    private final WorkHistoryMapper workHistoryMapper;

    @PostMapping("/search")
    public ResponseEntity<Page<CandidateSearchResponse>> search(
            @RequestParam(required = false) UUID employerId,
            Authentication auth,
            @RequestBody CandidateSearchRequest request) {
        UUID authenticatedEmployerId = SecurityUtils.enforceEmployerAccess(auth, employerId);

        Page<Candidate> results = searchService.searchCandidates(authenticatedEmployerId,
                request.getCity(), request.getSkills(), request.getCategory(),
                request.getMinSalary(), request.getMaxSalary(),
                request.getEducationLevel(), request.getGender(), request.getMyidVerified(),
                PageRequest.of(request.getPage(), request.getSize()));

        return ResponseEntity.ok(results.map(candidateSearchMapper::toResponse));
    }

    @GetMapping("/{id}/profile")
    public ResponseEntity<Map<String, Object>> getProfile(
            @RequestParam(required = false) UUID employerId,
            @PathVariable UUID id,
            Authentication auth) {
        UUID authenticatedEmployerId = SecurityUtils.enforceEmployerAccess(auth, employerId);

        Candidate c = searchService.getCandidateProfile(authenticatedEmployerId, id);
        List<WorkHistory> history = searchService.getCandidateWorkHistory(id);

        return ResponseEntity.ok(Map.of(
                "candidate", candidateSearchMapper.toResponse(c),
                "workHistory", history.stream().map(workHistoryMapper::toResponse).toList()
        ));
    }
}
