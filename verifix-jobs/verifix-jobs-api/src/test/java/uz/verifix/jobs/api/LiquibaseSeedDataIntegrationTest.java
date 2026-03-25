package uz.verifix.jobs.api;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;
import uz.verifix.jobs.integration.storage.FileStorageService;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest(classes = VerifixJobsApplication.class, webEnvironment = SpringBootTest.WebEnvironment.NONE)
@Testcontainers(disabledWithoutDocker = true)
class LiquibaseSeedDataIntegrationTest {

    @MockBean
    private FileStorageService fileStorageService;

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>(
            DockerImageName.parse("postgis/postgis:16-3.4").asCompatibleSubstituteFor("postgres"))
            .withDatabaseName("verifix_jobs")
            .withUsername("verifix")
            .withPassword("verifix_secret");

    @Container
    static GenericContainer<?> redis = new GenericContainer<>("redis:7-alpine")
            .withExposedPorts(6379);

    @DynamicPropertySource
    static void registerProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.data.redis.host", redis::getHost);
        registry.add("spring.data.redis.port", () -> redis.getMappedPort(6379));
        registry.add("app.kafka.enabled", () -> false);
        registry.add("app.elasticsearch.enabled", () -> false);
        registry.add("app.minio.enabled", () -> false);
        registry.add("app.scheduling.enabled", () -> false);
        registry.add("app.jwt.secret", () -> "change-me-dev-secret");
    }

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void shouldSeedCentralAsiaGeoReferences() {
        Integer countryCount = jdbcTemplate.queryForObject("select count(*) from geo_country", Integer.class);
        Integer regionCount = jdbcTemplate.queryForObject("select count(*) from geo_region", Integer.class);
        Integer districtCount = jdbcTemplate.queryForObject("select count(*) from geo_district", Integer.class);
        Integer cityCount = jdbcTemplate.queryForObject("select count(*) from geo_city", Integer.class);
        Integer linkedCountryCount = jdbcTemplate.queryForObject("select count(*) from geo_city where country_id is not null", Integer.class);
        Integer mongoliaCount = jdbcTemplate.queryForObject("select count(*) from geo_city where country = 'MN'", Integer.class);
        Integer turkmenistanCityCount = jdbcTemplate.queryForObject("select count(*) from geo_city where country = 'TM'", Integer.class);

        assertEquals(5, countryCount);
        assertEquals(55, regionCount);
        assertEquals(633, districtCount);
        assertEquals(60, cityCount);
        assertEquals(cityCount, linkedCountryCount);
        assertEquals(0, mongoliaCount);
        assertEquals(10, turkmenistanCityCount);
    }
}
