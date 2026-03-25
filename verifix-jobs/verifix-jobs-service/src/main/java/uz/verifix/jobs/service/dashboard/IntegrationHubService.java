package uz.verifix.jobs.service.dashboard;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import uz.verifix.jobs.domain.entity.Employer;
import uz.verifix.jobs.domain.repository.EmployerRepository;

import java.util.*;

@Service
@RequiredArgsConstructor
public class IntegrationHubService {

    private final EmployerRepository employerRepository;

    public record IntegrationStatus(String name, String category, boolean connected, String description) {}
    public record HubOverview(List<IntegrationStatus> integrations, int maturityLevel, String maturityLabel, int connectedCount) {}

    public HubOverview getStatus(UUID employerId) {
        Employer employer = employerRepository.findById(employerId).orElse(null);
        boolean hrmConnected = employer != null && employer.getHrmCompanyId() != null;
        boolean verified = employer != null && Boolean.TRUE.equals(employer.getIsVerified());

        List<IntegrationStatus> integrations = List.of(
                new IntegrationStatus("Verifix HRM", "HRM", hrmConnected, "Kadrlar tizimi bilan sinxronizatsiya"),
                new IntegrationStatus("MyID", "KYC", verified, "Identifikatsiya va verifikatsiya"),
                new IntegrationStatus("Telegram Bot", "Channel", true, "Telegram orqali nomzodlar bilan aloqa"),
                new IntegrationStatus("SMS (Eskiz)", "Notification", true, "SMS xabar yuborish"),
                new IntegrationStatus("Click.uz", "Payment", true, "To'lov qabul qilish"),
                new IntegrationStatus("Payme", "Payment", true, "To'lov qabul qilish"),
                new IntegrationStatus("ARGOS", "Government", false, "Davlat bandlik xizmati"),
                new IntegrationStatus("ish.mehnat.uz", "Government", false, "Mehnat vazirligi portali"),
                new IntegrationStatus("Elasticsearch", "Search", true, "Kengaytirilgan qidiruv"),
                new IntegrationStatus("AI (Claude)", "AI", true, "Sun'iy intellekt yordamchisi")
        );

        int connected = (int) integrations.stream().filter(IntegrationStatus::connected).count();
        int level = connected <= 3 ? 1 : connected <= 6 ? 2 : connected <= 8 ? 3 : 4;
        String label = switch (level) { case 1 -> "Boshlang'ich"; case 2 -> "O'sish"; case 3 -> "Rivojlangan"; default -> "Professional"; };

        return new HubOverview(integrations, level, label, connected);
    }
}
