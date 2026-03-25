package uz.verifix.jobs.api.controller;

import lombok.RequiredArgsConstructor;
import org.locationtech.jts.geom.Point;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import uz.verifix.jobs.domain.entity.GeoCity;
import uz.verifix.jobs.domain.entity.GeoCountry;
import uz.verifix.jobs.domain.entity.GeoDistrict;
import uz.verifix.jobs.domain.entity.GeoRegion;
import uz.verifix.jobs.service.geo.GeoService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/geo")
@RequiredArgsConstructor
public class GeoReferenceController {

    private final GeoService geoService;

    @GetMapping("/countries")
    public ResponseEntity<List<GeoCountryResponse>> countries() {
        return ResponseEntity.ok(geoService.getCountries().stream()
                .map(this::toCountryResponse)
                .toList());
    }

    @GetMapping("/regions")
    public ResponseEntity<List<GeoRegionResponse>> regions(@RequestParam String country) {
        return ResponseEntity.ok(geoService.getRegionsByCountry(country).stream()
                .map(this::toRegionResponse)
                .toList());
    }

    @GetMapping("/districts")
    public ResponseEntity<List<GeoDistrictResponse>> districts(@RequestParam String country,
                                                               @RequestParam(required = false) String region) {
        return ResponseEntity.ok(geoService.getDistricts(country, region).stream()
                .map(this::toDistrictResponse)
                .toList());
    }

    @GetMapping("/cities")
    public ResponseEntity<List<GeoScopedCityResponse>> cities(@RequestParam(required = false) String country,
                                                              @RequestParam(required = false) String region,
                                                              @RequestParam(required = false) String district) {
        return ResponseEntity.ok(geoService.getCities(country, region, district).stream()
                .map(this::toCityResponse)
                .toList());
    }

    private GeoCountryResponse toCountryResponse(GeoCountry country) {
        return new GeoCountryResponse(
                country.getId().toString(),
                country.getIso2(),
                country.getIso3(),
                country.getM49(),
                country.getNameUzLat(),
                country.getNameRu(),
                country.getNameEn(),
                country.getCapital(),
                country.getPhoneCode(),
                country.getCurrencyCode(),
                country.getGeonameId()
        );
    }

    private GeoRegionResponse toRegionResponse(GeoRegion region) {
        return new GeoRegionResponse(
                region.getId().toString(),
                region.getCountry().getIso2(),
                region.getCode(),
                region.getFullCode(),
                region.getNameUzLat(),
                region.getNameRu(),
                region.getNameEn(),
                region.getGeonameId()
        );
    }

    private GeoDistrictResponse toDistrictResponse(GeoDistrict district) {
        return new GeoDistrictResponse(
                district.getId().toString(),
                district.getCountry().getIso2(),
                district.getRegion().getCode(),
                district.getCode(),
                district.getFullCode(),
                district.getNameUzLat(),
                district.getNameRu(),
                district.getNameEn(),
                district.getGeonameId()
        );
    }

    private GeoScopedCityResponse toCityResponse(GeoCity city) {
        Point location = city.getLocation();
        return new GeoScopedCityResponse(
                city.getId().toString(),
                city.getNameUzLat(),
                city.getNameRu(),
                city.getNameEn(),
                city.getRegion(),
                city.getRegionRef() != null ? city.getRegionRef().getCode() : null,
                city.getDistrict(),
                city.getDistrictRef() != null ? city.getDistrictRef().getCode() : null,
                city.getCountry(),
                city.getGeonameId(),
                location != null ? location.getY() : null,
                location != null ? location.getX() : null,
                city.getPopulation()
        );
    }

    record GeoCountryResponse(String id, String iso2, String iso3, String m49,
                              String nameUzLat, String nameRu, String nameEn,
                              String capital, String phoneCode, String currencyCode,
                              Long geonameId) {
    }

    record GeoRegionResponse(String id, String countryIso2, String code, String fullCode,
                             String nameUzLat, String nameRu, String nameEn,
                             Long geonameId) {
    }

    record GeoDistrictResponse(String id, String countryIso2, String regionCode, String code,
                               String fullCode, String nameUzLat, String nameRu,
                               String nameEn, Long geonameId) {
    }

    record GeoScopedCityResponse(String id, String nameUzLat, String nameRu, String nameEn,
                                 String region, String regionCode, String district,
                                 String districtCode, String country, Long geonameId,
                                 Double latitude, Double longitude, Integer population) {
    }
}
