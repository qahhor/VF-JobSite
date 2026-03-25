package uz.verifix.jobs.service.ab;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.verifix.jobs.common.exception.BusinessException;
import uz.verifix.jobs.common.exception.ErrorCode;
import uz.verifix.jobs.common.exception.ResourceNotFoundException;
import uz.verifix.jobs.domain.entity.AbConversion;
import uz.verifix.jobs.domain.entity.AbExperiment;
import uz.verifix.jobs.domain.repository.AbConversionRepository;
import uz.verifix.jobs.domain.repository.AbExperimentRepository;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AbTestService {

    private final AbExperimentRepository experimentRepository;
    private final AbConversionRepository conversionRepository;

    @Transactional
    public AbExperiment createExperiment(String name, String description) {
        experimentRepository.findByName(name).ifPresent(existing -> {
            throw new BusinessException(ErrorCode.DUPLICATE_RESOURCE,
                    org.springframework.http.HttpStatus.CONFLICT,
                    "Experiment with name '" + name + "' already exists");
        });

        AbExperiment experiment = AbExperiment.builder()
                .name(name)
                .description(description)
                .active(true)
                .build();
        log.info("Creating A/B experiment: {}", name);
        return experimentRepository.save(experiment);
    }

    @Transactional(readOnly = true)
    public List<AbExperiment> listActiveExperiments() {
        return experimentRepository.findByActiveTrue();
    }

    @Transactional(readOnly = true)
    public Page<AbExperiment> listAllExperiments(Pageable pageable) {
        return experimentRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public AbExperiment getExperimentByName(String name) {
        return getExperiment(name);
    }

    @Transactional
    public AbExperiment deactivateExperiment(String name) {
        AbExperiment experiment = getExperiment(name);
        experiment.setActive(false);
        log.info("Deactivated A/B experiment: {}", name);
        return experimentRepository.save(experiment);
    }

    @Transactional
    public AbExperiment activateExperiment(String name) {
        AbExperiment experiment = getExperiment(name);
        experiment.setActive(true);
        log.info("Activated A/B experiment: {}", name);
        return experimentRepository.save(experiment);
    }

    @Transactional
    public void deleteExperiment(String name) {
        AbExperiment experiment = getExperiment(name);
        experiment.softDelete();
        experimentRepository.save(experiment);
        log.info("Soft-deleted A/B experiment: {}", name);
    }

    @Transactional
    public String getVariant(UUID userId, String experimentName) {
        AbExperiment experiment = getExperiment(experimentName);

        if (!experiment.isActive()) {
            return conversionRepository.findByExperimentAndUserId(experiment, userId)
                    .map(AbConversion::getVariant)
                    .orElse("A");
        }

        return conversionRepository.findByExperimentAndUserId(experiment, userId)
                .map(AbConversion::getVariant)
                .orElseGet(() -> {
                    String variant = Math.abs((userId.toString() + experimentName).hashCode()) % 2 == 0 ? "A" : "B";
                    AbConversion conversion = AbConversion.builder()
                            .experiment(experiment)
                            .userId(userId)
                            .variant(variant)
                            .converted(false)
                            .build();
                    conversionRepository.save(conversion);
                    log.debug("Assigned variant {} to user {} for experiment {}", variant, userId, experimentName);
                    return variant;
                });
    }

    @Transactional
    public void trackConversion(UUID userId, String experimentName) {
        AbExperiment experiment = getExperiment(experimentName);
        conversionRepository.findByExperimentAndUserId(experiment, userId)
                .ifPresent(conversion -> {
                    if (!conversion.isConverted()) {
                        conversion.setConverted(true);
                        conversionRepository.save(conversion);
                        log.info("Conversion tracked for user {} in experiment {}", userId, experimentName);
                    }
                });
    }

    @Transactional(readOnly = true)
    public ExperimentStats getStats(String experimentName) {
        AbExperiment experiment = getExperiment(experimentName);

        ExperimentStats.VariantStats statsA = buildVariantStats(experiment, "A");
        ExperimentStats.VariantStats statsB = buildVariantStats(experiment, "B");

        String winner = determineWinner(statsA, statsB);
        double confidence = calculateConfidence(statsA, statsB);

        return new ExperimentStats(experiment, statsA, statsB, winner, confidence);
    }

    @Transactional(readOnly = true)
    public long countParticipants(AbExperiment experiment) {
        return conversionRepository.countByExperimentAndVariant(experiment, "A")
                + conversionRepository.countByExperimentAndVariant(experiment, "B");
    }

    @Transactional(readOnly = true)
    public long countConversions(AbExperiment experiment) {
        return conversionRepository.countByExperimentAndVariantAndConvertedTrue(experiment, "A")
                + conversionRepository.countByExperimentAndVariantAndConvertedTrue(experiment, "B");
    }

    private ExperimentStats.VariantStats buildVariantStats(AbExperiment experiment, String variant) {
        long total = conversionRepository.countByExperimentAndVariant(experiment, variant);
        long converted = conversionRepository.countByExperimentAndVariantAndConvertedTrue(experiment, variant);
        double rate = total > 0 ? Math.round((double) converted / total * 10000) / 100.0 : 0.0;
        return new ExperimentStats.VariantStats(variant, total, converted, rate);
    }

    private String determineWinner(ExperimentStats.VariantStats a, ExperimentStats.VariantStats b) {
        if (a.total() < 30 || b.total() < 30) return "INSUFFICIENT_DATA";
        if (a.conversionRate() > b.conversionRate()) return "A";
        if (b.conversionRate() > a.conversionRate()) return "B";
        return "TIE";
    }

    private double calculateConfidence(ExperimentStats.VariantStats a, ExperimentStats.VariantStats b) {
        if (a.total() < 30 || b.total() < 30) return 0.0;

        double pA = a.total() > 0 ? (double) a.converted() / a.total() : 0;
        double pB = b.total() > 0 ? (double) b.converted() / b.total() : 0;

        double seA = Math.sqrt(pA * (1 - pA) / a.total());
        double seB = Math.sqrt(pB * (1 - pB) / b.total());
        double seDiff = Math.sqrt(seA * seA + seB * seB);

        if (seDiff == 0) return 0.0;
        double zScore = Math.abs(pA - pB) / seDiff;

        // Approximate two-tailed p-value to confidence percentage
        if (zScore >= 2.576) return 99.0;
        if (zScore >= 1.960) return 95.0;
        if (zScore >= 1.645) return 90.0;
        if (zScore >= 1.282) return 80.0;
        return Math.round(zScore / 1.960 * 95 * 10) / 10.0;
    }

    private AbExperiment getExperiment(String name) {
        return experimentRepository.findByName(name)
                .orElseThrow(() -> new ResourceNotFoundException("AbExperiment", name));
    }

    public record ExperimentStats(
            AbExperiment experiment,
            VariantStats variantA,
            VariantStats variantB,
            String winner,
            double confidenceLevel
    ) {
        public record VariantStats(String variant, long total, long converted, double conversionRate) {}
    }
}
