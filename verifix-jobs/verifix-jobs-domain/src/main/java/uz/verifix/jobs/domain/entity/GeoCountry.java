package uz.verifix.jobs.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "geo_country", uniqueConstraints = {
        @UniqueConstraint(columnNames = "iso2"),
        @UniqueConstraint(columnNames = "iso3"),
        @UniqueConstraint(columnNames = "m49")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GeoCountry extends BaseEntity {

    @Column(name = "iso2", nullable = false, length = 2)
    private String iso2;

    @Column(name = "iso3", nullable = false, length = 3)
    private String iso3;

    @Column(name = "m49", nullable = false, length = 3)
    private String m49;

    @Column(name = "name_uz_lat", nullable = false)
    private String nameUzLat;

    @Column(name = "name_ru", nullable = false)
    private String nameRu;

    @Column(name = "name_en", nullable = false)
    private String nameEn;

    @Column(name = "capital")
    private String capital;

    @Column(name = "phone_code")
    private String phoneCode;

    @Column(name = "currency_code")
    private String currencyCode;

    @Column(name = "geoname_id")
    private Long geonameId;
}
