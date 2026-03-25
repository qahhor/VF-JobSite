package uz.verifix.jobs.api.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import uz.verifix.jobs.api.dto.response.ModerationQueueResponse;
import uz.verifix.jobs.domain.entity.ModerationQueue;

@Mapper(componentModel = "spring")
public interface ModerationQueueMapper {

    @Mapping(target = "entityType", expression = "java(queue.getEntityType() != null ? queue.getEntityType().name() : null)")
    @Mapping(target = "status", expression = "java(queue.getStatus() != null ? queue.getStatus().name() : null)")
    ModerationQueueResponse toResponse(ModerationQueue queue);
}
