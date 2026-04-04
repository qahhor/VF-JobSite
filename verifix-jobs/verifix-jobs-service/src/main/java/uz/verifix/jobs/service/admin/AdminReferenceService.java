package uz.verifix.jobs.service.admin;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.verifix.jobs.common.exception.ResourceNotFoundException;
import uz.verifix.jobs.domain.entity.GeoCity;
import uz.verifix.jobs.domain.entity.GeoCountry;
import uz.verifix.jobs.domain.entity.GeoRegion;
import uz.verifix.jobs.domain.repository.GeoCityRepository;
import uz.verifix.jobs.domain.repository.GeoCountryRepository;
import uz.verifix.jobs.domain.repository.GeoRegionRepository;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminReferenceService {

    private final GeoCityRepository cityRepository;
    private final GeoRegionRepository regionRepository;
    private final GeoCountryRepository countryRepository;

    // ── Cities ──────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<GeoCity> listCities(String search, Pageable pageable) {
        String q = (search == null || search.isBlank()) ? null : search.trim();
        return cityRepository.searchPaged(q, pageable);
    }

    @Transactional(readOnly = true)
    public GeoCity getCity(UUID id) {
        return cityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("GeoCity", id.toString()));
    }

    @Transactional
    public GeoCity createCity(GeoCity city) {
        GeoCity saved = cityRepository.save(city);
        log.info("City created: {} ({})", saved.getNameUzLat(), saved.getId());
        return saved;
    }

    @Transactional
    public GeoCity updateCity(UUID id, GeoCity updates) {
        GeoCity city = getCity(id);
        city.setNameUzLat(updates.getNameUzLat());
        city.setNameRu(updates.getNameRu());
        city.setNameEn(updates.getNameEn());
        city.setCountry(updates.getCountry());
        city.setRegion(updates.getRegion());
        city.setPopulation(updates.getPopulation());
        GeoCity saved = cityRepository.save(city);
        log.info("City updated: {} ({})", saved.getNameUzLat(), saved.getId());
        return saved;
    }

    @Transactional
    public void deleteCity(UUID id) {
        GeoCity city = getCity(id);
        cityRepository.delete(city);
        log.info("City deleted: {} ({})", city.getNameUzLat(), id);
    }

    // ── Regions ─────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<GeoRegion> listRegions(String search, Pageable pageable) {
        String q = (search == null || search.isBlank()) ? null : search.trim();
        return regionRepository.searchPaged(q, pageable);
    }

    @Transactional(readOnly = true)
    public GeoRegion getRegion(UUID id) {
        return regionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("GeoRegion", id.toString()));
    }

    @Transactional
    public GeoRegion createRegion(GeoRegion region) {
        GeoRegion saved = regionRepository.save(region);
        log.info("Region created: {} ({})", saved.getNameUzLat(), saved.getId());
        return saved;
    }

    @Transactional
    public GeoRegion updateRegion(UUID id, GeoRegion updates) {
        GeoRegion region = getRegion(id);
        region.setNameUzLat(updates.getNameUzLat());
        region.setNameRu(updates.getNameRu());
        region.setNameEn(updates.getNameEn());
        region.setCode(updates.getCode());
        region.setFullCode(updates.getFullCode());
        GeoRegion saved = regionRepository.save(region);
        log.info("Region updated: {} ({})", saved.getNameUzLat(), saved.getId());
        return saved;
    }

    @Transactional
    public void deleteRegion(UUID id) {
        GeoRegion region = getRegion(id);
        regionRepository.delete(region);
        log.info("Region deleted: {} ({})", region.getNameUzLat(), id);
    }

    // ── Countries ───────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<GeoCountry> listCountries() {
        return countryRepository.findAllByOrderByNameEnAsc();
    }

    @Transactional(readOnly = true)
    public GeoCountry getCountry(UUID id) {
        return countryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("GeoCountry", id.toString()));
    }

    @Transactional
    public GeoCountry updateCountry(UUID id, GeoCountry updates) {
        GeoCountry country = getCountry(id);
        country.setNameUzLat(updates.getNameUzLat());
        country.setNameRu(updates.getNameRu());
        country.setNameEn(updates.getNameEn());
        country.setCapital(updates.getCapital());
        country.setPhoneCode(updates.getPhoneCode());
        GeoCountry saved = countryRepository.save(country);
        log.info("Country updated: {} ({})", saved.getNameUzLat(), saved.getId());
        return saved;
    }
}
