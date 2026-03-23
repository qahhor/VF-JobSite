package uz.verifix.jobs.service.application;

import org.springframework.http.HttpStatus;
import uz.verifix.jobs.common.exception.BusinessException;
import uz.verifix.jobs.common.exception.ErrorCode;
import uz.verifix.jobs.domain.enums.ApplicationStatus;

import java.util.Map;
import java.util.Set;

public final class ApplicationStatusMachine {

    private static final Map<ApplicationStatus, Set<ApplicationStatus>> TRANSITIONS = Map.of(
            ApplicationStatus.NEW, Set.of(ApplicationStatus.VIEWED, ApplicationStatus.REJECTED),
            ApplicationStatus.VIEWED, Set.of(ApplicationStatus.SHORTLIST, ApplicationStatus.REJECTED),
            ApplicationStatus.SHORTLIST, Set.of(ApplicationStatus.INVITED, ApplicationStatus.REJECTED),
            ApplicationStatus.INVITED, Set.of(ApplicationStatus.INTERVIEW, ApplicationStatus.REJECTED, ApplicationStatus.WITHDRAWN),
            ApplicationStatus.INTERVIEW, Set.of(ApplicationStatus.OFFER, ApplicationStatus.REJECTED),
            ApplicationStatus.OFFER, Set.of(ApplicationStatus.HIRED, ApplicationStatus.REJECTED, ApplicationStatus.WITHDRAWN),
            ApplicationStatus.HIRED, Set.of(),
            ApplicationStatus.REJECTED, Set.of(),
            ApplicationStatus.WITHDRAWN, Set.of()
    );

    private ApplicationStatusMachine() {}

    public static void validateTransition(ApplicationStatus from, ApplicationStatus to) {
        Set<ApplicationStatus> allowed = TRANSITIONS.getOrDefault(from, Set.of());
        if (!allowed.contains(to)) {
            throw new BusinessException(ErrorCode.APPLICATION_INVALID_STATUS, HttpStatus.BAD_REQUEST,
                    "Cannot transition from " + from + " to " + to);
        }
    }

    public static boolean canTransition(ApplicationStatus from, ApplicationStatus to) {
        return TRANSITIONS.getOrDefault(from, Set.of()).contains(to);
    }
}
