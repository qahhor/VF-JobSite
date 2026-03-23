package uz.verifix.jobs.integration.gov;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import uz.verifix.jobs.domain.enums.GovSyncSource;

@Component
@RequiredArgsConstructor
public class GovClientRouter {

    private final ArgosClient argosClient;
    private final EnstClient enstClient;
    private final MehnatClient mehnatClient;

    public GovSyncClient getClient(GovSyncSource source) {
        return switch (source) {
            case ARGOS -> argosClient;
            case ENST -> enstClient;
            case ISH_MEHNAT -> mehnatClient;
        };
    }
}
