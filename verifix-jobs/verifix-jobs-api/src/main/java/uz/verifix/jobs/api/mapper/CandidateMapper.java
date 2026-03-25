package uz.verifix.jobs.api.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import uz.verifix.jobs.api.dto.response.CandidateProfileResponse;
import uz.verifix.jobs.domain.entity.Candidate;
import uz.verifix.jobs.domain.entity.WorkHistory;

import java.util.List;

@Mapper(componentModel = "spring", uses = WorkHistoryMapper.class)
public interface CandidateMapper {

    @Mapping(target = "gender", expression = "java(candidate.getGender() != null ? candidate.getGender().name() : null)")
    @Mapping(target = "educationLevel", expression = "java(candidate.getEducationLevel() != null ? candidate.getEducationLevel().name() : null)")
    @Mapping(target = "workHistory", source = "histories")
    CandidateProfileResponse toProfileResponse(Candidate candidate, List<WorkHistory> histories);
}
