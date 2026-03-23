package uz.verifix.jobs.integration.geo;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
public class NominatimClient {

    private final WebClient webClient;

    public NominatimClient(
            @Value("${app.geo.nominatim-url:https://nominatim.openstreetmap.org}") String baseUrl,
            WebClient.Builder webClientBuilder
    ) {
        this.webClient = webClientBuilder
                .baseUrl(baseUrl)
                .defaultHeader("User-Agent", "VerifixJobs/1.0")
                .build();
    }

    public GeocodingResult geocode(String address) {
        try {
            List<Map> results = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/search")
                            .queryParam("q", address)
                            .queryParam("format", "json")
                            .queryParam("limit", 1)
                            .queryParam("countrycodes", "uz,kz,kg,tj,mn")
                            .build())
                    .retrieve()
                    .bodyToFlux(Map.class)
                    .collectList()
                    .block(Duration.ofSeconds(10));

            if (results != null && !results.isEmpty()) {
                Map result = results.get(0);
                double lat = Double.parseDouble(result.get("lat").toString());
                double lon = Double.parseDouble(result.get("lon").toString());
                String displayName = (String) result.get("display_name");
                log.debug("Geocoded '{}' to ({}, {})", address, lat, lon);
                return new GeocodingResult(lat, lon, displayName);
            }

            return null;
        } catch (Exception e) {
            log.error("Geocoding failed for '{}': {}", address, e.getMessage());
            return null;
        }
    }

    public String reverseGeocode(double lat, double lon) {
        try {
            Map result = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/reverse")
                            .queryParam("lat", lat)
                            .queryParam("lon", lon)
                            .queryParam("format", "json")
                            .build())
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block(Duration.ofSeconds(10));

            if (result != null) {
                return (String) result.get("display_name");
            }
            return null;
        } catch (Exception e) {
            log.error("Reverse geocoding failed for ({}, {}): {}", lat, lon, e.getMessage());
            return null;
        }
    }

    public record GeocodingResult(double latitude, double longitude, String displayName) {}
}
