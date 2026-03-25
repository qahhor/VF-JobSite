package uz.verifix.jobs.api.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import uz.verifix.jobs.api.dto.response.VacancyResponse;
import uz.verifix.jobs.domain.entity.Vacancy;

import java.util.Arrays;
import java.util.List;

@Mapper(componentModel = "spring")
public interface VacancyMapper {

    @Mapping(target = "employerId", source = "employer.id")
    @Mapping(target = "employerName", source = "employer.name")
    @Mapping(target = "latitude", expression = "java(vacancy.getLocation() != null ? vacancy.getLocation().getY() : null)")
    @Mapping(target = "longitude", expression = "java(vacancy.getLocation() != null ? vacancy.getLocation().getX() : null)")
    @Mapping(target = "employmentType", expression = "java(vacancy.getEmploymentType() != null ? vacancy.getEmploymentType().name() : null)")
    @Mapping(target = "shiftSchedule", expression = "java(vacancy.getShiftSchedule() != null ? vacancy.getShiftSchedule().name() : null)")
    @Mapping(target = "benefits", expression = "java(toList(vacancy.getBenefits()))")
    @Mapping(target = "status", expression = "java(vacancy.getStatus().name())")
    @Mapping(target = "moderationStatus", expression = "java(vacancy.getModerationStatus().name())")
    VacancyResponse toResponse(Vacancy vacancy);

    default List<String> toList(String[] values) {
        return values == null ? null : Arrays.asList(values);
    }
}
