package uz.verifix.jobs.service.notification;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Email notification channel. Sends transactional emails for:
 * - Application status updates
 * - Employer notifications
 * - Password reset
 * - Weekly digests
 */
@Slf4j
@Service
@ConditionalOnProperty(name = "spring.mail.host")
public class EmailNotificationService {

    private final JavaMailSender mailSender;
    private final String fromAddress;

    public EmailNotificationService(JavaMailSender mailSender,
                                     @Value("${spring.mail.from:noreply@jobs.verifix.uz}") String fromAddress) {
        this.mailSender = mailSender;
        this.fromAddress = fromAddress;
    }

    @Async
    public boolean send(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Email sent to {}: {}", to, subject);
            return true;
        } catch (Exception e) {
            log.error("Email sending failed to {}: {}", to, e.getMessage());
            return false;
        }
    }

    @Async
    public void sendApplicationUpdate(String email, String candidateName, String vacancyTitle, String status) {
        String subject = "Verifix Jobs — Ariza holati yangilandi";
        String body = String.format("Hurmatli %s,\n\n" +
                        "\"%s\" vakansiyasi bo'yicha arizangiz holati o'zgardi: %s\n\n" +
                        "Batafsil: https://jobs.verifix.uz/my-applications\n\n" +
                        "Hurmat bilan,\nVerifix Jobs jamoasi",
                candidateName, vacancyTitle, status);
        send(email, subject, body);
    }

    @Async
    public void sendWelcomeEmail(String email, String name) {
        String subject = "Verifix Jobs — Xush kelibsiz!";
        String body = String.format("Hurmatli %s,\n\n" +
                "Verifix Jobs platformasiga xush kelibsiz!\n" +
                "Endi siz minglab vakansiyalarni ko'rib, ariza topshirishingiz mumkin.\n\n" +
                "Boshlash: https://jobs.verifix.uz\n\n" +
                "Hurmat bilan,\nVerifix Jobs jamoasi", name);
        send(email, subject, body);
    }
}
