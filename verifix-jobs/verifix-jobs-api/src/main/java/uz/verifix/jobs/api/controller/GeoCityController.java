package uz.verifix.jobs.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uz.verifix.jobs.domain.entity.GeoCity;
import uz.verifix.jobs.service.geo.GeoService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/cities")
@RequiredArgsConstructor
public class GeoCityController {

    private final GeoService geoService;

    @GetMapping("/search")
    public ResponseEntity<List<GeoCityResponse>> search(@RequestParam String q) {
        return ResponseEntity.ok(geoService.searchCities(q).stream()
                .map(this::toResponse).toList());
    }

    @GetMapping("/country/{code}")
    public ResponseEntity<List<GeoCityResponse>> byCountry(@PathVariable String code) {
        return ResponseEntity.ok(geoService.getCitiesByCountry(code.toUpperCase()).stream()
                .map(this::toResponse).toList());
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<GeoCityResponse>> nearby(
            @RequestParam double lat, @RequestParam double lon,
            @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(geoService.findNearestCities(lat, lon, limit).stream()
                .map(this::toResponse).toList());
    }

    private GeoCityResponse toResponse(GeoCity city) {
        return new GeoCityResponse(
                city.getId().toString(),
                city.getNameUzLat(),
                city.getNameRu(),
                city.getNameEn(),
                city.getRegion(),
                city.getDistrict(),
                city.getCountry(),
                city.getGeonameId(),
                city.getLocation() != null ? city.getLocation().getY() : null,
                city.getLocation() != null ? city.getLocation().getX() : null,
                city.getPopulation()
        );
    }

    record GeoCityResponse(String id, String nameUzLat, String nameRu, String nameEn,
                           String region, String district, String country, Long geonameId,
                           Double latitude, Double longitude, Integer population) {}
}
