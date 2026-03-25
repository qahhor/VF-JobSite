package uz.verifix.jobs.service.geo;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.stereotype.Service;
import uz.verifix.jobs.domain.entity.GeoCity;
import uz.verifix.jobs.domain.entity.GeoCountry;
import uz.verifix.jobs.domain.entity.GeoDistrict;
import uz.verifix.jobs.domain.entity.GeoRegion;
import uz.verifix.jobs.domain.repository.GeoCityRepository;
import uz.verifix.jobs.domain.repository.GeoCountryRepository;
import uz.verifix.jobs.domain.repository.GeoDistrictRepository;
import uz.verifix.jobs.domain.repository.GeoRegionRepository;
import uz.verifix.jobs.integration.geo.NominatimClient;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class GeoService {

    private final GeoCityRepository geoCityRepository;
    private final GeoCountryRepository geoCountryRepository;
    private final GeoRegionRepository geoRegionRepository;
    private final GeoDistrictRepository geoDistrictRepository;
    private final NominatimClient nominatimClient;
    private static final GeometryFactory GEOMETRY_FACTORY = new GeometryFactory(new PrecisionModel(), 4326);

    public Point createPoint(double lat, double lon) {
        return GEOMETRY_FACTORY.createPoint(new Coordinate(lon, lat));
    }

    public List<GeoCity> searchCities(String query) {
        return geoCityRepository.searchByName(query);
    }

    public List<GeoCity> getCitiesByCountry(String country) {
        return geoCityRepository.findByCountryOrderByPopulationDesc(normalizeCode(country));
    }

    public List<GeoCountry> getCountries() {
        return geoCountryRepository.findAllByOrderByNameEnAsc();
    }

    public List<GeoRegion> getRegionsByCountry(String countryCode) {
        return geoRegionRepository.findByCountry_Iso2IgnoreCaseOrderByNameEnAsc(normalizeCode(countryCode));
    }

    public List<GeoDistrict> getDistricts(String countryCode, String regionCode) {
        String normalizedCountry = normalizeCode(countryCode);
        String normalizedRegion = normalizeCode(regionCode);
        if (normalizedRegion == null) {
            return geoDistrictRepository.findByCountry_Iso2IgnoreCaseOrderByNameEnAsc(normalizedCountry);
        }
        return geoDistrictRepository.findByCountry_Iso2IgnoreCaseAndRegion_CodeIgnoreCaseOrderByNameEnAsc(
                normalizedCountry, normalizedRegion);
    }

    public List<GeoCity> getCities(String countryCode, String region, String district) {
        return geoCityRepository.findByGeoScope(
                normalizeCode(countryCode),
                normalizeFilter(region),
                normalizeFilter(district)
        );
    }

    public List<GeoCity> findNearestCities(double lat, double lon, int limit) {
        return geoCityRepository.findNearestCities(lon, lat, limit);
    }

    public NominatimClient.GeocodingResult geocodeAddress(String address) {
        return nominatimClient.geocode(address);
    }

    public String reverseGeocode(double lat, double lon) {
        return nominatimClient.reverseGeocode(lat, lon);
    }

    public double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Earth radius in km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private String normalizeCode(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim().toUpperCase();
    }

    private String normalizeFilter(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
