package uz.verifix.jobs.common.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // General
    INTERNAL_ERROR("INTERNAL_ERROR", "Internal server error"),
    VALIDATION_ERROR("VALIDATION_ERROR", "Validation failed"),
    RESOURCE_NOT_FOUND("RESOURCE_NOT_FOUND", "Resource not found"),
    DUPLICATE_RESOURCE("DUPLICATE_RESOURCE", "Resource already exists"),
    ACCESS_DENIED("ACCESS_DENIED", "Access denied"),
    UNAUTHORIZED("UNAUTHORIZED", "Authentication required"),

    // Auth
    INVALID_CREDENTIALS("INVALID_CREDENTIALS", "Invalid email or password"),
    INVALID_TOKEN("INVALID_TOKEN", "Invalid or expired token"),
    INVALID_OTP("INVALID_OTP", "Invalid or expired OTP code"),
    INVALID_TOTP("INVALID_TOTP", "Invalid TOTP code"),
    TOTP_REQUIRED("TOTP_REQUIRED", "TOTP code is required"),
    PASSWORD_CHANGE_REQUIRED("PASSWORD_CHANGE_REQUIRED", "Password change is required before continuing"),
    OTP_RATE_LIMIT("OTP_RATE_LIMIT", "Too many OTP requests, try again later"),
    RATE_LIMITED("RATE_LIMITED", "Rate limit exceeded"),

    // Employer
    EMPLOYER_NOT_FOUND("EMPLOYER_NOT_FOUND", "Employer not found"),
    INN_ALREADY_REGISTERED("INN_ALREADY_REGISTERED", "INN is already registered"),

    // Vacancy
    VACANCY_NOT_FOUND("VACANCY_NOT_FOUND", "Vacancy not found"),
    VACANCY_INVALID_STATUS("VACANCY_INVALID_STATUS", "Invalid vacancy status transition"),

    // Candidate
    CANDIDATE_NOT_FOUND("CANDIDATE_NOT_FOUND", "Candidate not found"),
    PHONE_ALREADY_REGISTERED("PHONE_ALREADY_REGISTERED", "Phone number is already registered"),
    TELEGRAM_ALREADY_REGISTERED("TELEGRAM_ALREADY_REGISTERED", "Telegram account is already linked"),

    // Application
    APPLICATION_NOT_FOUND("APPLICATION_NOT_FOUND", "Application not found"),
    ALREADY_APPLIED("ALREADY_APPLIED", "Candidate has already applied for this vacancy"),
    APPLICATION_INVALID_STATUS("APPLICATION_INVALID_STATUS", "Invalid application status transition"),

    // Moderation
    MODERATION_REQUIRED("MODERATION_REQUIRED", "Content requires moderation approval"),

    // Payment
    PAYMENT_FAILED("PAYMENT_FAILED", "Payment processing failed"),

    // SMS
    SMS_SEND_FAILED("SMS_SEND_FAILED", "Failed to send SMS"),

    // Government Integration
    GOV_SYNC_FAILED("GOV_SYNC_FAILED", "Government sync operation failed"),
    HRM_BRIDGE_ERROR("HRM_BRIDGE_ERROR", "Verifix HRM bridge operation failed"),

    // Fraud
    FRAUD_DETECTED("FRAUD_DETECTED", "Suspicious activity detected");

    private final String code;
    private final String defaultMessage;
}
