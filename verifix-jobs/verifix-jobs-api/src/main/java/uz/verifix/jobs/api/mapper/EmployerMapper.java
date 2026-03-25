package uz.verifix.jobs.api.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import uz.verifix.jobs.api.dto.response.EmployerProfileResponse;
import uz.verifix.jobs.domain.entity.Employer;

@Mapper(componentModel = "spring")
public interface EmployerMapper {

    @Mapping(target = "latitude", expression = "java(employer.getLocation() != null ? employer.getLocation().getY() : null)")
    @Mapping(target = "longitude", expression = "java(employer.getLocation() != null ? employer.getLocation().getX() : null)")
    @Mapping(target = "status", expression = "java(employer.getStatus() != null ? employer.getStatus().name() : null)")
    @Mapping(target = "moderationStatus", expression = "java(employer.getModerationStatus() != null ? employer.getModerationStatus().name() : null)")
    @Mapping(target = "activeVacancies", source = "activeVacancies")
    EmployerProfileResponse toResponse(Employer employer, long activeVacancies);
}
