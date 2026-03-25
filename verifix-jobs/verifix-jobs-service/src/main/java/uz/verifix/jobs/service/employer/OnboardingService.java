package uz.verifix.jobs.service.employer;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.verifix.jobs.domain.entity.Employer;
import uz.verifix.jobs.domain.enums.VacancyStatus;
import uz.verifix.jobs.domain.repository.EmployerRepository;
import uz.verifix.jobs.domain.repository.VacancyRepository;

import java.util.*;

/**
 * Employer onboarding — tracks setup progress and generates next steps.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OnboardingService {

    private final EmployerRepository employerRepository;
    private final VacancyRepository vacancyRepository;

    public record OnboardingStep(String key, String title, String description, boolean completed, int order) {}
    public record OnboardingProgress(int completedSteps, int totalSteps, int percentComplete, List<OnboardingStep> steps) {}

    @Transactional(readOnly = true)
    public OnboardingProgress getProgress(UUID employerId) {
        Employer employer = employerRepository.findById(employerId).orElse(null);
        if (employer == null) return new OnboardingProgress(0, 0, 0, List.of());

        boolean hasLogo = employer.getLogoUrl() != null;
        boolean hasDescription = employer.getDescription() != null;
        boolean hasCity = employer.getCity() != null;
        boolean isVerified = Boolean.TRUE.equals(employer.getIsVerified());
        boolean hasVacancy = vacancyRepository.countByEmployerIdAndStatus(employerId, VacancyStatus.ACTIVE) > 0;
        boolean hasBranding = !"BASIC".equals(employer.getBrandingTier());

        List<OnboardingStep> steps = List.of(
                new OnboardingStep("profile_name", "Kompaniya nomini kiriting", "Kompaniya nomi va rasmiy nomi", employer.getName() != null, 1),
                new OnboardingStep("profile_logo", "Logo yuklang", "Kompaniya logotipi nomzodlarga ishonch beradi", hasLogo, 2),
                new OnboardingStep("profile_description", "Kompaniya haqida yozing", "Qisqa tavsif nomzodlarni jalb qiladi", hasDescription, 3),
                new OnboardingStep("profile_city", "Shaharni ko'rsating", "Geo-qidiruv uchun kerak", hasCity, 4),
                new OnboardingStep("first_vacancy", "Birinchi vakansiyani yarating", "Nomzodlarni jalb qilishni boshlang", hasVacancy, 5),
                new OnboardingStep("verification", "Kompaniyani tasdiqlang", "MyID orqali verifikatsiya — ishonch x3", isVerified, 6),
                new OnboardingStep("branding", "Premium brendingni yoqing", "Professional kompaniya sahifasi", hasBranding, 7)
        );

        int completed = (int) steps.stream().filter(OnboardingStep::completed).count();
        int percent = steps.isEmpty() ? 0 : (completed * 100 / steps.size());

        return new OnboardingProgress(completed, steps.size(), percent, steps);
    }
}
