package uz.verifix.jobs.service.notification;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import uz.verifix.jobs.domain.entity.SmsLog;
import uz.verifix.jobs.domain.enums.SmsProvider;
import uz.verifix.jobs.domain.enums.SmsStatus;
import uz.verifix.jobs.domain.repository.SmsLogRepository;
import uz.verifix.jobs.integration.sms.EskizSmsGateway;
import uz.verifix.jobs.integration.sms.PlayMobileSmsGateway;
import uz.verifix.jobs.integration.sms.SmsGateway;
import uz.verifix.jobs.integration.sms.SmsResult;

import java.time.Instant;

@Slf4j
@Service
public class SmsService {

    private final EskizSmsGateway eskizGateway;
    private final PlayMobileSmsGateway playMobileGateway;
    private final SmsLogRepository smsLogRepository;

    public SmsService(EskizSmsGateway eskizGateway, PlayMobileSmsGateway playMobileGateway,
                      SmsLogRepository smsLogRepository) {
        this.eskizGateway = eskizGateway;
        this.playMobileGateway = playMobileGateway;
        this.smsLogRepository = smsLogRepository;
    }

    public boolean send(String phone, String message) {
        // Try Eskiz first (primary)
        SmsResult result = trySend(eskizGateway, phone, message, SmsProvider.ESKIZ);

        // Fallback to PlayMobile
        if (!result.isSuccess()) {
            log.warn("Eskiz failed, falling back to PlayMobile for {}", phone);
            result = trySend(playMobileGateway, phone, message, SmsProvider.PLAYMOBILE);
        }

        return result.isSuccess();
    }

    private SmsResult trySend(SmsGateway gateway, String phone, String message, SmsProvider provider) {
        SmsResult result = gateway.send(phone, message);

        SmsLog smsLog = SmsLog.builder()
                .phone(phone)
                .messageText(message)
                .provider(provider)
                .status(result.isSuccess() ? SmsStatus.SENT : SmsStatus.FAILED)
                .externalId(result.getExternalId())
                .sentAt(result.isSuccess() ? Instant.now() : null)
                .build();
        smsLogRepository.save(smsLog);

        return result;
    }
}
