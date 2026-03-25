package uz.verifix.jobs.api.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import uz.verifix.jobs.api.dto.response.ManagerResponse;
import uz.verifix.jobs.domain.entity.Manager;

@Mapper(componentModel = "spring")
public interface ManagerMapper {

    @Mapping(target = "role", expression = "java(manager.getRole() != null ? manager.getRole().name() : null)")
    ManagerResponse toResponse(Manager manager);
}
