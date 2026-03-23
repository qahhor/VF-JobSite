package uz.verifix.jobs.common.exception;

import org.springframework.http.HttpStatus;

public class ForbiddenException extends BusinessException {

    public ForbiddenException(String message) {
        super(ErrorCode.ACCESS_DENIED, HttpStatus.FORBIDDEN, message);
    }

    public ForbiddenException() {
        super(ErrorCode.ACCESS_DENIED, HttpStatus.FORBIDDEN);
    }
}
