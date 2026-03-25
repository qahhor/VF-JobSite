package uz.verifix.jobs.api.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import uz.verifix.jobs.api.dto.response.CandidateSearchResponse;
import uz.verifix.jobs.domain.entity.Candidate;
import uz.verifix.jobs.domain.enums.MyIdStatus;

@Mapper(componentModel = "spring", imports = MyIdStatus.class)
public interface CandidateSearchMapper {

    @Mapping(target = "educationLevel", expression = "java(candidate.getEducationLevel() != null ? candidate.getEducationLevel().name() : null)")
    @Mapping(target = "workExperienceSummary", source = "workExperienceText")
    @Mapping(target = "myidVerified", expression = "java(candidate.getMyidStatus() == MyIdStatus.VERIFIED)")
    CandidateSearchResponse toResponse(Candidate candidate);
}
