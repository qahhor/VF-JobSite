package uz.verifix.jobs.service.ab;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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
        AbExperiment experiment = AbExperiment.builder()
                .name(name)
                .description(description)
                .active(true)
                .build();
        return experimentRepository.save(experiment);
    }

    @Transactional(readOnly = true)
    public List<AbExperiment> listExperiments() {
        return experimentRepository.findByActiveTrue();
    }

    @Transactional
    public String getVariant(UUID userId, String experimentName) {
        AbExperiment experiment = getExperiment(experimentName);

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
                    conversion.setConverted(true);
                    conversionRepository.save(conversion);
                    log.info("Conversion tracked for user {} in experiment {}", userId, experimentName);
                });
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getStats(String experimentName) {
        AbExperiment experiment = getExperiment(experimentName);

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("experiment", experimentName);
        stats.put("description", experiment.getDescription());
        stats.put("active", experiment.isActive());

        for (String variant : List.of("A", "B")) {
            long total = conversionRepository.countByExperimentAndVariant(experiment, variant);
            long converted = conversionRepository.countByExperimentAndVariantAndConvertedTrue(experiment, variant);
            double rate = total > 0 ? (double) converted / total : 0.0;

            Map<String, Object> variantStats = new LinkedHashMap<>();
            variantStats.put("total", total);
            variantStats.put("converted", converted);
            variantStats.put("conversionRate", Math.round(rate * 10000) / 100.0);
            stats.put(variant, variantStats);
        }

        return stats;
    }

    private AbExperiment getExperiment(String name) {
        return experimentRepository.findByName(name)
                .orElseThrow(() -> new ResourceNotFoundException("AbExperiment", name));
    }
}
