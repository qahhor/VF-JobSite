package uz.verifix.jobs.telegram.handler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import uz.verifix.jobs.domain.entity.Candidate;
import uz.verifix.jobs.domain.repository.CandidateRepository;

import java.util.Map;
import java.util.UUID;
import java.util.function.Consumer;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationConsumer {

    private final CandidateRepository candidateRepository;
    private Consumer<SendMessage> messageSender;

    public void setMessageSender(Consumer<SendMessage> sender) {
        this.messageSender = sender;
    }

    @KafkaListener(topics = "notifications.candidate", groupId = "telegram-bot",
            autoStartup = "${app.kafka.enabled:false}")
    public void handleCandidateNotification(Map<String, Object> event) {
        try {
            String type = (String) event.get("type");
            String candidateId = (String) event.get("candidateId");
            String message = (String) event.get("message");

            if (candidateId == null || message == null) return;

            candidateRepository.findById(UUID.fromString(candidateId))
                    .ifPresent(candidate -> {
                        if (candidate.getTelegramId() != null && messageSender != null) {
                            SendMessage msg = new SendMessage();
                            msg.setChatId(candidate.getTelegramId().toString());
                            msg.setText(message);
                            msg.setParseMode("HTML");
                            messageSender.accept(msg);
                            log.info("Notification sent to candidate {} via Telegram: {}", candidateId, type);
                        }
                    });
        } catch (Exception e) {
            log.error("Error processing notification: {}", e.getMessage());
        }
    }
}
