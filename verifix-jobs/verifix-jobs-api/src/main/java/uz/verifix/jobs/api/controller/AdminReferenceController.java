package uz.verifix.jobs.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;
import uz.verifix.jobs.common.dto.PageResponse;
import uz.verifix.jobs.domain.entity.GeoCity;
import uz.verifix.jobs.domain.entity.GeoCountry;
import uz.verifix.jobs.domain.entity.GeoRegion;
import uz.verifix.jobs.service.admin.AdminReferenceService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/references")
@RequiredArgsConstructor
public class AdminReferenceController {

    private final AdminReferenceService referenceService;

    // ── Cities ──────────────────────────────────────────────

    @GetMapping("/cities")
    public ResponseEntity<PageResponse<CityResponse>> listCities(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<CityResponse> page = referenceService.listCities(search, pageable).map(CityResponse::from);
        return ResponseEntity.ok(PageResponse.of(page));
    }

    @GetMapping("/cities/{id}")
    public ResponseEntity<CityResponse> getCity(@PathVariable UUID id) {
        return ResponseEntity.ok(CityResponse.from(referenceService.getCity(id)));
    }

    @PostMapping("/cities")
    public ResponseEntity<CityResponse> createCity(@RequestBody CityRequest req) {
        GeoCity city = GeoCity.builder()
                .nameUzLat(req.nameUzLat())
                .nameRu(req.nameRu())
                .nameEn(req.nameEn())
                .country(req.country())
                .region(req.region())
                .population(req.population())
                .build();
        return ResponseEntity.ok(CityResponse.from(referenceService.createCity(city)));
    }

    @PutMapping("/cities/{id}")
    public ResponseEntity<CityResponse> updateCity(@PathVariable UUID id, @RequestBody CityRequest req) {
        GeoCity updates = GeoCity.builder()
                .nameUzLat(req.nameUzLat())
                .nameRu(req.nameRu())
                .nameEn(req.nameEn())
                .country(req.country())
                .region(req.region())
                .population(req.population())
                .build();
        return ResponseEntity.ok(CityResponse.from(referenceService.updateCity(id, updates)));
    }

    @DeleteMapping("/cities/{id}")
    public ResponseEntity<Void> deleteCity(@PathVariable UUID id) {
        referenceService.deleteCity(id);
        return ResponseEntity.noContent().build();
    }

    // ── Regions ─────────────────────────────────────────────

    @GetMapping("/regions")
    public ResponseEntity<PageResponse<RegionResponse>> listRegions(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<RegionResponse> page = referenceService.listRegions(search, pageable).map(RegionResponse::from);
        return ResponseEntity.ok(PageResponse.of(page));
    }

    @GetMapping("/regions/by-country/{countryIso2}")
    public ResponseEntity<List<RegionResponse>> regionsByCountry(@PathVariable String countryIso2) {
        return ResponseEntity.ok(referenceService.regionsByCountry(countryIso2).stream().map(RegionResponse::from).toList());
    }

    @GetMapping("/cities/by-country/{countryIso2}")
    public ResponseEntity<List<CityResponse>> citiesByCountry(
            @PathVariable String countryIso2,
            @RequestParam(required = false) String region) {
        return ResponseEntity.ok(referenceService.citiesByScope(countryIso2, region).stream().map(CityResponse::from).toList());
    }

    @GetMapping("/regions/{id}")
    public ResponseEntity<RegionResponse> getRegion(@PathVariable UUID id) {
        return ResponseEntity.ok(RegionResponse.from(referenceService.getRegion(id)));
    }

    @PostMapping("/regions")
    public ResponseEntity<RegionResponse> createRegion(@RequestBody RegionRequest req) {
        return ResponseEntity.ok(RegionResponse.from(referenceService.createRegion(
                req.code(), req.fullCode(), req.nameUzLat(), req.nameRu(), req.nameEn(), req.countryIso2())));
    }

    @PutMapping("/regions/{id}")
    public ResponseEntity<RegionResponse> updateRegion(@PathVariable UUID id, @RequestBody RegionRequest req) {
        return ResponseEntity.ok(RegionResponse.from(referenceService.updateRegion(
                id, req.code(), req.fullCode(), req.nameUzLat(), req.nameRu(), req.nameEn(), req.countryIso2())));
    }

    @DeleteMapping("/regions/{id}")
    public ResponseEntity<Void> deleteRegion(@PathVariable UUID id) {
        referenceService.deleteRegion(id);
        return ResponseEntity.noContent().build();
    }

    // ── Countries ───────────────────────────────────────────

    @GetMapping("/countries")
    public ResponseEntity<List<CountryResponse>> listCountries() {
        return ResponseEntity.ok(referenceService.listCountries().stream().map(CountryResponse::from).toList());
    }

    @PutMapping("/countries/{id}")
    public ResponseEntity<CountryResponse> updateCountry(@PathVariable UUID id, @RequestBody CountryRequest req) {
        GeoCountry updates = new GeoCountry();
        updates.setNameUzLat(req.nameUzLat());
        updates.setNameRu(req.nameRu());
        updates.setNameEn(req.nameEn());
        updates.setCapital(req.capital());
        updates.setPhoneCode(req.phoneCode());
        return ResponseEntity.ok(CountryResponse.from(referenceService.updateCountry(id, updates)));
    }

    // ── DTOs ────────────────────────────────────────────────

    public record CityRequest(String nameUzLat, String nameRu, String nameEn, String country, String region, Integer population) {}
    public record CityResponse(UUID id, String nameUzLat, String nameRu, String nameEn, String country, String region, String countryIso2, UUID regionId, Integer population) {
        static CityResponse from(GeoCity c) {
            return new CityResponse(c.getId(), c.getNameUzLat(), c.getNameRu(), c.getNameEn(), c.getCountry(), c.getRegion(),
                    c.getCountryRef() != null ? c.getCountryRef().getIso2() : c.getCountry(),
                    c.getRegionRef() != null ? c.getRegionRef().getId() : null,
                    c.getPopulation());
        }
    }

    public record RegionRequest(String code, String fullCode, String nameUzLat, String nameRu, String nameEn, String countryIso2) {}
    public record RegionResponse(UUID id, String code, String fullCode, String nameUzLat, String nameRu, String nameEn, String countryIso2) {
        static RegionResponse from(GeoRegion r) {
            return new RegionResponse(r.getId(), r.getCode(), r.getFullCode(), r.getNameUzLat(), r.getNameRu(), r.getNameEn(),
                    r.getCountry() != null ? r.getCountry().getIso2() : null);
        }
    }

    public record CountryRequest(String nameUzLat, String nameRu, String nameEn, String capital, String phoneCode) {}
    public record CountryResponse(UUID id, String iso2, String nameUzLat, String nameRu, String nameEn, String capital, String phoneCode) {
        static CountryResponse from(GeoCountry c) {
            return new CountryResponse(c.getId(), c.getIso2(), c.getNameUzLat(), c.getNameRu(), c.getNameEn(), c.getCapital(), c.getPhoneCode());
        }
    }
}
