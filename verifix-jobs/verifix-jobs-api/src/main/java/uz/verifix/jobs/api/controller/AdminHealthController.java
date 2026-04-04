package uz.verifix.jobs.api.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.net.HttpURLConnection;
import java.net.URI;
import java.sql.Connection;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Returns real health status of infrastructure services.
 * Each service is checked with a timeout-protected probe.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/admin/health")
@RequiredArgsConstructor
public class AdminHealthController {

    private final DataSource dataSource;
    private final RedisConnectionFactory redisConnectionFactory;

    @Value("${spring.elasticsearch.uris:http://localhost:9200}")
    private String elasticsearchUri;

    @Value("${spring.kafka.bootstrap-servers:localhost:9092}")
    private String kafkaBootstrapServers;

    @Value("${app.ml.base-url:http://localhost:8000}")
    private String mlServiceUrl;

    @Value("${app.minio.url:http://localhost:9000}")
    private String minioUrl;

    @GetMapping
    public ResponseEntity<Map<String, Boolean>> getHealth() {
        Map<String, Boolean> status = new LinkedHashMap<>();
        status.put("postgres", checkPostgres());
        status.put("redis", checkRedis());
        status.put("elasticsearch", checkHttp(elasticsearchUri, 2000));
        status.put("kafka", checkKafka());
        status.put("ml", checkHttp(mlServiceUrl + "/health", 3000));
        status.put("minio", checkHttp(minioUrl + "/minio/health/live", 2000));
        return ResponseEntity.ok(status);
    }

    private boolean checkPostgres() {
        try (Connection conn = dataSource.getConnection()) {
            return conn.isValid(2);
        } catch (Exception e) {
            log.warn("PostgreSQL health check failed: {}", e.getMessage());
            return false;
        }
    }

    private boolean checkRedis() {
        try {
            var conn = redisConnectionFactory.getConnection();
            String pong = conn.ping();
            conn.close();
            return "PONG".equals(pong);
        } catch (Exception e) {
            log.warn("Redis health check failed: {}", e.getMessage());
            return false;
        }
    }

    private boolean checkKafka() {
        try {
            String[] parts = kafkaBootstrapServers.split(",")[0].split(":");
            String host = parts[0];
            int port = parts.length > 1 ? Integer.parseInt(parts[1]) : 9092;
            try (var socket = new java.net.Socket()) {
                socket.connect(new java.net.InetSocketAddress(host, port), 2000);
                return true;
            }
        } catch (Exception e) {
            log.warn("Kafka health check failed: {}", e.getMessage());
            return false;
        }
    }

    private boolean checkHttp(String url, int timeoutMs) {
        try {
            HttpURLConnection conn = (HttpURLConnection) URI.create(url).toURL().openConnection();
            conn.setConnectTimeout(timeoutMs);
            conn.setReadTimeout(timeoutMs);
            conn.setRequestMethod("GET");
            int code = conn.getResponseCode();
            conn.disconnect();
            return code >= 200 && code < 400;
        } catch (Exception e) {
            log.debug("HTTP health check failed for {}: {}", url, e.getMessage());
            return false;
        }
    }
}
