package uz.verifix.jobs.service.vacancy;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.verifix.jobs.common.exception.ResourceNotFoundException;
import uz.verifix.jobs.domain.entity.Employer;
import uz.verifix.jobs.domain.entity.Vacancy;
import uz.verifix.jobs.domain.enums.EmploymentType;
import uz.verifix.jobs.domain.enums.ModerationStatus;
import uz.verifix.jobs.domain.enums.VacancySource;
import uz.verifix.jobs.domain.enums.VacancyStatus;
import uz.verifix.jobs.domain.repository.EmployerRepository;
import uz.verifix.jobs.domain.repository.VacancyRepository;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class VacancyImportService {

    private static final String CSV_HEADER = "title,description,category,city,salaryFrom,salaryTo,employmentType,positionsCount";

    private final VacancyRepository vacancyRepository;
    private final EmployerRepository employerRepository;

    @Transactional
    public ImportResult importFromCsv(UUID employerId, InputStream csvStream) {
        Employer employer = employerRepository.findById(employerId)
                .orElseThrow(() -> new ResourceNotFoundException("Employer", employerId.toString()));

        int totalRows = 0;
        int imported = 0;
        List<String> errors = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(csvStream, StandardCharsets.UTF_8))) {
            String headerLine = reader.readLine();
            if (headerLine == null) {
                return new ImportResult(0, 0, 0, List.of("Empty file"));
            }

            String line;
            while ((line = reader.readLine()) != null) {
                totalRows++;
                if (line.isBlank()) {
                    continue;
                }

                try {
                    String[] cols = parseCsvLine(line);
                    if (cols.length < 4) {
                        errors.add("Row " + totalRows + ": insufficient columns (need at least title, description, category, city)");
                        continue;
                    }

                    String title = cols[0].trim();
                    String description = cols.length > 1 ? cols[1].trim() : "";
                    String category = cols.length > 2 ? cols[2].trim() : "";
                    String city = cols.length > 3 ? cols[3].trim() : "";

                    if (title.isBlank()) {
                        errors.add("Row " + totalRows + ": title is required");
                        continue;
                    }

                    Vacancy vacancy = Vacancy.builder()
                            .employer(employer)
                            .title(title)
                            .description(description.isBlank() ? null : description)
                            .category(category.isBlank() ? null : category)
                            .city(city.isBlank() ? null : city)
                            .status(VacancyStatus.DRAFT)
                            .moderationStatus(ModerationStatus.PENDING)
                            .source(VacancySource.IMPORT)
                            .build();

                    if (cols.length > 4 && !cols[4].isBlank()) {
                        vacancy.setSalaryFrom(new BigDecimal(cols[4].trim()));
                    }
                    if (cols.length > 5 && !cols[5].isBlank()) {
                        vacancy.setSalaryTo(new BigDecimal(cols[5].trim()));
                    }
                    if (cols.length > 6 && !cols[6].isBlank()) {
                        try {
                            vacancy.setEmploymentType(EmploymentType.valueOf(cols[6].trim().toUpperCase()));
                        } catch (IllegalArgumentException ignored) {
                        }
                    }
                    if (cols.length > 7 && !cols[7].isBlank()) {
                        vacancy.setPositionsCount(Integer.parseInt(cols[7].trim()));
                    }

                    vacancyRepository.save(vacancy);
                    imported++;
                } catch (Exception e) {
                    errors.add("Row " + totalRows + ": " + e.getMessage());
                }
            }
        } catch (Exception e) {
            log.error("CSV import failed: {}", e.getMessage());
            errors.add("File read error: " + e.getMessage());
        }

        log.info("CSV import for employer {}: {} imported, {} skipped out of {} rows",
                employerId, imported, errors.size(), totalRows);
        return new ImportResult(totalRows, imported, totalRows - imported, errors);
    }

    public byte[] getImportTemplate() {
        String template = CSV_HEADER + "\n"
                + "Cook,Experienced restaurant cook,Hospitality,Tashkent,3000000,5000000,FULL_TIME,2\n"
                + "Driver,Category B driver,Logistics,Samarkand,4000000,,FULL_TIME,5\n";
        return template.getBytes(StandardCharsets.UTF_8);
    }

    private String[] parseCsvLine(String line) {
        List<String> fields = new ArrayList<>();
        boolean inQuotes = false;
        StringBuilder current = new StringBuilder();

        for (char c : line.toCharArray()) {
            if (c == '"') {
                inQuotes = !inQuotes;
            } else if (c == ',' && !inQuotes) {
                fields.add(current.toString());
                current = new StringBuilder();
            } else {
                current.append(c);
            }
        }
        fields.add(current.toString());
        return fields.toArray(new String[0]);
    }

    public record ImportResult(int totalRows, int importedCount, int skippedCount, List<String> errors) {
    }
}
