package uz.verifix.jobs.api.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import uz.verifix.jobs.api.dto.response.ApplicationDetailResponse;
import uz.verifix.jobs.api.dto.response.ApplicationResponse;
import uz.verifix.jobs.domain.entity.Application;
import uz.verifix.jobs.domain.entity.Candidate;
import uz.verifix.jobs.domain.entity.WorkHistory;

import java.util.List;

@Mapper(componentModel = "spring", uses = WorkHistoryMapper.class)
public interface ApplicationMapper {

    @Mapping(target = "vacancyId", source = "vacancy.id")
    @Mapping(target = "vacancyTitle", source = "vacancy.title")
    @Mapping(target = "candidateId", source = "candidate.id")
    @Mapping(target = "candidateName", expression = "java(formatCandidateName(application.getCandidate()))")
    @Mapping(target = "candidatePhone", source = "candidate.phone")
    @Mapping(target = "candidateCity", source = "candidate.city")
    @Mapping(target = "status", expression = "java(application.getStatus() != null ? application.getStatus().name() : null)")
    @Mapping(target = "source", expression = "java(application.getSource() != null ? application.getSource().name() : null)")
    ApplicationResponse toResponse(Application application);

    @Mapping(target = "status", expression = "java(application.getStatus() != null ? application.getStatus().name() : null)")
    @Mapping(target = "source", expression = "java(application.getSource() != null ? application.getSource().name() : null)")
    @Mapping(target = "vacancyId", source = "application.vacancy.id")
    @Mapping(target = "vacancyTitle", source = "application.vacancy.title")
    @Mapping(target = "candidateId", source = "application.candidate.id")
    @Mapping(target = "firstName", source = "application.candidate.firstName")
    @Mapping(target = "lastName", source = "application.candidate.lastName")
    @Mapping(target = "phone", source = "application.candidate.phone")
    @Mapping(target = "city", source = "application.candidate.city")
    @Mapping(target = "region", source = "application.candidate.region")
    @Mapping(target = "gender", expression = "java(application.getCandidate().getGender() != null ? application.getCandidate().getGender().name() : null)")
    @Mapping(target = "educationLevel", expression = "java(application.getCandidate().getEducationLevel() != null ? application.getCandidate().getEducationLevel().name() : null)")
    @Mapping(target = "birthDate", source = "application.candidate.birthDate")
    @Mapping(target = "skills", source = "application.candidate.skills")
    @Mapping(target = "workExperienceText", source = "application.candidate.workExperienceText")
    @Mapping(target = "workHistory", source = "histories")
    ApplicationDetailResponse toDetailResponse(Application application, List<WorkHistory> histories);

    default String formatCandidateName(Candidate candidate) {
        if (candidate == null) {
            return null;
        }

        String firstName = candidate.getFirstName() != null ? candidate.getFirstName() : "";
        String lastName = candidate.getLastName() != null ? candidate.getLastName() : "";
        String fullName = (firstName + " " + lastName).trim();
        return fullName.isEmpty() ? candidate.getPhone() : fullName;
    }
}
