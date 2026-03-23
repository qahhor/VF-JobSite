package uz.verifix.jobs.common.exception;

import org.springframework.http.HttpStatus;

public class ResourceNotFoundException extends BusinessException {

    public ResourceNotFoundException(String message) {
        super(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND, message);
    }

    public ResourceNotFoundException(String entity, Object id) {
        super(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                entity + " not found with id: " + id);
    }
}
