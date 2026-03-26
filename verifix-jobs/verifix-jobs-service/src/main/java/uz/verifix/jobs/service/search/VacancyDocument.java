package uz.verifix.jobs.service.search;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.DateFormat;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;
import org.springframework.data.elasticsearch.annotations.GeoPointField;
import org.springframework.data.elasticsearch.core.geo.GeoPoint;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(indexName = "vacancies")
public class VacancyDocument {

    @Id
    private String id;

    @Field(type = FieldType.Text, analyzer = "standard")
    private String title;

    @Field(type = FieldType.Text, analyzer = "standard")
    private String description;

    @Field(type = FieldType.Keyword)
    private String category;

    @Field(type = FieldType.Keyword)
    private String city;

    @Field(type = FieldType.Keyword)
    private String region;

    @GeoPointField
    private GeoPoint location;

    @Field(type = FieldType.Keyword)
    private String employerId;

    @Field(type = FieldType.Text)
    private String employerName;

    @Field(type = FieldType.Keyword)
    private String employerLogoUrl;

    @Field(type = FieldType.Double)
    private BigDecimal salaryFrom;

    @Field(type = FieldType.Double)
    private BigDecimal salaryTo;

    @Field(type = FieldType.Keyword)
    private String currency;

    @Field(type = FieldType.Keyword)
    private String employmentType;

    @Field(type = FieldType.Keyword)
    private String shiftSchedule;

    @Field(type = FieldType.Keyword)
    private String[] benefits;

    @Field(type = FieldType.Boolean)
    private Boolean isMassHiring;

    @Field(type = FieldType.Integer)
    private Integer positionsCount;

    @Field(type = FieldType.Integer)
    private Integer positionsFilled;

    @Field(type = FieldType.Date, format = DateFormat.epoch_millis)
    private Instant expiresAt;

    @Field(type = FieldType.Date, format = DateFormat.epoch_millis)
    private Instant createdAt;

    /** All translations of title, category, city for multilingual search */
    @Field(type = FieldType.Text, analyzer = "standard")
    private String searchKeywords;
}
