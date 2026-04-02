package uz.verifix.jobs.service.vacancy;

import org.springframework.http.HttpStatus;
import uz.verifix.jobs.common.exception.BusinessException;
import uz.verifix.jobs.common.exception.ErrorCode;
import uz.verifix.jobs.domain.enums.VacancyStatus;

import java.util.Map;
import java.util.Set;

public final class VacancyStatusMachine {

    private static final Map<VacancyStatus, Set<VacancyStatus>> TRANSITIONS = Map.of(
            VacancyStatus.DRAFT, Set.of(VacancyStatus.PENDING_MODERATION, VacancyStatus.ACTIVE),
            VacancyStatus.PENDING_MODERATION, Set.of(VacancyStatus.ACTIVE, VacancyStatus.DRAFT),
            VacancyStatus.ACTIVE, Set.of(VacancyStatus.PAUSED, VacancyStatus.CLOSED),
            VacancyStatus.PAUSED, Set.of(VacancyStatus.ACTIVE, VacancyStatus.CLOSED),
            VacancyStatus.CLOSED, Set.of(VacancyStatus.ARCHIVED),
            VacancyStatus.ARCHIVED, Set.of()
    );

    private VacancyStatusMachine() {}

    public static void validateTransition(VacancyStatus from, VacancyStatus to) {
        Set<VacancyStatus> allowed = TRANSITIONS.getOrDefault(from, Set.of());
        if (!allowed.contains(to)) {
            throw new BusinessException(ErrorCode.VACANCY_INVALID_STATUS, HttpStatus.BAD_REQUEST,
                    "Cannot transition from " + from + " to " + to);
        }
    }

    public static boolean canTransition(VacancyStatus from, VacancyStatus to) {
        return TRANSITIONS.getOrDefault(from, Set.of()).contains(to);
    }
}
