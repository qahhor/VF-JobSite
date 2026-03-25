package uz.verifix.jobs.service.automation;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.verifix.jobs.domain.entity.Application;
import uz.verifix.jobs.domain.enums.ApplicationStatus;
import uz.verifix.jobs.domain.repository.ApplicationRepository;
import uz.verifix.jobs.service.notification.DomainEvent;
import uz.verifix.jobs.service.notification.EventPublisher;
import uz.verifix.jobs.service.notification.NotificationService;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.*;

/**
 * Manages interview scheduling for the ATS pipeline.
 * Generates available time slots, books interviews, sends notifications.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class InterviewSchedulerService {

    private final ApplicationRepository applicationRepository;
    private final NotificationService notificationService;
    private final EventPublisher eventPublisher;

    private static final ZoneId TASHKENT = ZoneId.of("Asia/Tashkent");

    public record TimeSlot(LocalDate date, LocalTime startTime, LocalTime endTime, boolean available) {}
    public record InterviewBooking(UUID applicationId, Instant scheduledAt, String location, String notes) {}

    /**
     * Generate available time slots for the next N business days.
     * Default: 9:00-18:00, 1-hour slots, Mon-Fri.
     */
    public List<TimeSlot> getAvailableSlots(UUID employerId, int daysAhead, int slotDurationMinutes) {
        if (slotDurationMinutes <= 0) slotDurationMinutes = 60;
        if (daysAhead <= 0) daysAhead = 7;

        List<TimeSlot> slots = new ArrayList<>();
        LocalDate today = LocalDate.now(TASHKENT);

        for (int d = 1; d <= daysAhead; d++) {
            LocalDate date = today.plusDays(d);
            // Skip weekends
            if (date.getDayOfWeek().getValue() >= 6) continue;

            LocalTime time = LocalTime.of(9, 0);
            LocalTime endOfDay = LocalTime.of(18, 0);

            while (time.plusMinutes(slotDurationMinutes).isBefore(endOfDay) ||
                   time.plusMinutes(slotDurationMinutes).equals(endOfDay)) {
                LocalTime endTime = time.plusMinutes(slotDurationMinutes);
                slots.add(new TimeSlot(date, time, endTime, true));
                time = endTime;
            }
        }

        return slots;
    }

    /**
     * Book an interview for an application.
     * Changes application status to INTERVIEW and sends notification.
     */
    @Transactional
    public InterviewBooking bookInterview(UUID applicationId, UUID employerId,
                                           LocalDate date, LocalTime time,
                                           String location, String notes) {
        Application app = applicationRepository.findById(applicationId).orElse(null);
        if (app == null) return null;

        // Verify employer ownership
        if (!app.getVacancy().getEmployer().getId().equals(employerId)) return null;

        ZonedDateTime scheduledAt = ZonedDateTime.of(date, time, TASHKENT);
        Instant instant = scheduledAt.toInstant();

        // Update application
        app.setStatus(ApplicationStatus.INTERVIEW);
        app.setInvitedAt(Instant.now());
        String interviewNote = String.format("Suhbat: %s %s, %s. %s",
                date, time, location != null ? location : "Ofis", notes != null ? notes : "");
        app.setRecruiterNotes(
                (app.getRecruiterNotes() != null ? app.getRecruiterNotes() + "\n" : "") + interviewNote);
        applicationRepository.save(app);

        // Notify candidate
        String message = String.format("📅 Suhbatga taklif!\n\n📋 %s\n🏢 %s\n📆 %s %s\n📍 %s",
                app.getVacancy().getTitle(),
                app.getVacancy().getEmployer().getName(),
                date, time,
                location != null ? location : "Batafsil ma'lumot uchun aloqaga chiqamiz");

        notificationService.dispatch(
                uz.verifix.jobs.domain.enums.UserType.CANDIDATE,
                app.getCandidate().getId(), "interview.scheduled", message);

        // Publish event
        eventPublisher.publish(DomainEvent.APPLICATION_STATUS_CHANGED, applicationId, "APPLICATION", employerId, Map.of("applicationId", applicationId.toString(), "newStatus", "INTERVIEW", "employerId", employerId.toString(), "vacancyTitle", app.getVacancy().getTitle(), "candidateName", app.getCandidate().getFirstName())); // replaced builder

        log.info("Interview booked for application {} at {} {}", applicationId, date, time);
        return new InterviewBooking(applicationId, instant, location, notes);
    }
}
