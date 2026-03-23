package uz.verifix.jobs.integration.gov;

import java.util.List;
import java.util.Map;

public interface GovSyncClient {

    GovSyncResult exportVacancy(Map<String, Object> vacancyData);

    GovSyncResult exportEmployer(Map<String, Object> employerData);

    GovSyncResult reportHiring(Map<String, Object> hiringData);

    List<GovVacancyData> importVacancies();

    String getProviderName();
}
