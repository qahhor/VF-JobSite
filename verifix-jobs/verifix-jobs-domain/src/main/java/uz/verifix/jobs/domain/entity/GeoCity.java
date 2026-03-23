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
import org.locationtech.jts.geom.Point;

@Entity
@Table(name = "geo_city", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"name_uz_lat", "country"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GeoCity extends BaseEntity {

    @Column(name = "name_uz_lat", nullable = false)
    private String nameUzLat;

    @Column(name = "name_uz_cyr")
    private String nameUzCyr;

    @Column(name = "name_ru")
    private String nameRu;

    @Column(name = "name_en")
    private String nameEn;

    @Column(name = "region")
    private String region;

    @Column(name = "country", nullable = false)
    private String country;

    @Column(name = "location", columnDefinition = "geometry(Point,4326)")
    private Point location;

    @Column(name = "population")
    private Integer population;
}
