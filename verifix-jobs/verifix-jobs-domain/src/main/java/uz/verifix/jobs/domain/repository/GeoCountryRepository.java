package uz.verifix.jobs.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.verifix.jobs.domain.entity.GeoCountry;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface GeoCountryRepository extends JpaRepository<GeoCountry, UUID> {

    List<GeoCountry> findAllByOrderByNameEnAsc();

    Optional<GeoCountry> findByIso2IgnoreCase(String iso2);
}
