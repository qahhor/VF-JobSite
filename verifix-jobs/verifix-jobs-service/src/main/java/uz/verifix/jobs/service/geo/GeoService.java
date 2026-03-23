package uz.verifix.jobs.service.geo;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.stereotype.Service;
import uz.verifix.jobs.domain.entity.GeoCity;
import uz.verifix.jobs.domain.repository.GeoCityRepository;
import uz.verifix.jobs.integration.geo.NominatimClient;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class GeoService {

    private final GeoCityRepository geoCityRepository;
    private final NominatimClient nominatimClient;
    private static final GeometryFactory GEOMETRY_FACTORY = new GeometryFactory(new PrecisionModel(), 4326);

    public Point createPoint(double lat, double lon) {
        return GEOMETRY_FACTORY.createPoint(new Coordinate(lon, lat));
    }

    public List<GeoCity> searchCities(String query) {
        return geoCityRepository.searchByName(query);
    }

    public List<GeoCity> getCitiesByCountry(String country) {
        return geoCityRepository.findByCountryOrderByPopulationDesc(country);
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
}
