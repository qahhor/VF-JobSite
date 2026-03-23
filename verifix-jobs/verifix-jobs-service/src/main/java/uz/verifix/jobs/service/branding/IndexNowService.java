package uz.verifix.jobs.service.branding;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Slf4j
@Service
public class IndexNowService {

    @Value("${app.base-url:https://jobs.verifix.uz}")
    private String baseUrl;

    private final WebClient webClient = WebClient.builder().build();

    @Async
    public void notifySearchEngines(String slug) {
        String url = baseUrl + "/company/" + slug;

        // Notify via IndexNow API (Yandex + Bing)
        try {
            webClient.post()
                    .uri("https://yandex.com/indexnow")
                    .bodyValue(Map.of(
                            "host", baseUrl.replace("https://", "").replace("http://", ""),
                            "urlList", new String[]{url}
                    ))
                    .retrieve()
                    .toBodilessMono()
                    .subscribe(
                            success -> log.info("IndexNow: Yandex notified for {}", url),
                            error -> log.warn("IndexNow: Yandex notification failed for {}: {}", url, error.getMessage())
                    );
        } catch (Exception e) {
            log.warn("IndexNow failed: {}", e.getMessage());
        }
    }
}
