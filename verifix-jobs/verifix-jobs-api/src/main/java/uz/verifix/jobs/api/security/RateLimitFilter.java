package uz.verifix.jobs.api.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import uz.verifix.jobs.common.exception.ErrorCode;
import uz.verifix.jobs.common.exception.ErrorResponse;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;

@Slf4j
@Component
@RequiredArgsConstructor
public class RateLimitFilter extends OncePerRequestFilter {

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    @Value("${app.rate-limit.general-requests-per-minute:100}")
    private int generalLimit;

    @Value("${app.rate-limit.employer-requests-per-minute:30}")
    private int employerLimit;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        if (isLimited(request, response)) {
            return;
        }
        filterChain.doFilter(request, response);
    }

    private boolean isLimited(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            String minuteBucket = DateTimeFormatter.ofPattern("yyyyMMddHHmm")
                    .withZone(ZoneOffset.UTC)
                    .format(Instant.now());

            if (generalLimit > 0) {
                String ipKey = "rl:ip:" + resolveIp(request) + ":" + minuteBucket;
                if (increment(ipKey, Duration.ofMinutes(2)) > generalLimit) {
                    writeRateLimitResponse(response, "IP rate limit exceeded");
                    return true;
                }
            }

            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof AuthenticatedUser user && user.employerId() != null) {
                String employerKey = "rl:employer:" + user.employerId() + ":" + minuteBucket;
                if (increment(employerKey, Duration.ofMinutes(2)) > employerLimit) {
                    writeRateLimitResponse(response, "Employer API rate limit exceeded");
                    return true;
                }
            }

            return false;
        } catch (Exception e) {
            log.warn("Rate limiting failed open: {}", e.getMessage());
            return false;
        }
    }

    private long increment(String key, Duration ttl) {
        Long count = redisTemplate.opsForValue().increment(key);
        if (count != null && count == 1) {
            redisTemplate.expire(key, ttl);
        }
        return count != null ? count : 0;
    }

    private void writeRateLimitResponse(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        ErrorResponse payload = ErrorResponse.builder()
                .error(ErrorCode.RATE_LIMITED.getCode())
                .message(message)
                .build();
        response.getWriter().write(objectMapper.writeValueAsString(payload));
    }

    private String resolveIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
