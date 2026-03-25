package uz.verifix.jobs.api.mapper;

import org.mapstruct.Mapper;
import uz.verifix.jobs.api.dto.response.ApplicationDetailResponse;
import uz.verifix.jobs.api.dto.response.CandidateProfileResponse;
import uz.verifix.jobs.api.dto.response.WorkHistoryResponse;
import uz.verifix.jobs.domain.entity.WorkHistory;

@Mapper(componentModel = "spring")
public interface WorkHistoryMapper {

    WorkHistoryResponse toResponse(WorkHistory workHistory);

    CandidateProfileResponse.WorkHistoryItem toCandidateWorkHistoryItem(WorkHistory workHistory);

    ApplicationDetailResponse.WorkHistoryItem toApplicationWorkHistoryItem(WorkHistory workHistory);
}
