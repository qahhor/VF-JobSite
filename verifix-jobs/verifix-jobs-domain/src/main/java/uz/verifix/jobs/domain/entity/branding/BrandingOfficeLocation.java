package uz.verifix.jobs.domain.entity.branding;

import jakarta.persistence.*;
import lombok.*;
import org.locationtech.jts.geom.Point;
import uz.verifix.jobs.domain.entity.BaseEntity;
import uz.verifix.jobs.domain.enums.OfficeLocationType;

@Entity
@Table(name = "branding_office_location")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BrandingOfficeLocation extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branding_id", nullable = false)
    private EmployerBranding branding;

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Column(name = "address", length = 500)
    private String address;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "location", columnDefinition = "geometry(Point,4326)")
    private Point location;

    @Enumerated(EnumType.STRING)
    @Column(name = "type")
    private OfficeLocationType type;
}
