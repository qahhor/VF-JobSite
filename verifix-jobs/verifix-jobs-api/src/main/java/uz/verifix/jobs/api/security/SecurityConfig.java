package uz.verifix.jobs.api.security;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final TenantContextFilter tenantContextFilter;
    private final RateLimitFilter rateLimitFilter;

    @Value("${app.cors.allowed-origins:http://localhost:4200,http://localhost:4201}")
    private String allowedOriginsConfig;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        .requestMatchers("/api/v1/admin/auth/login").permitAll()
                        .requestMatchers("/api/v1/otp/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/vacancies/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/cities/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/subscription/plans").permitAll()
                        .requestMatchers("/api/v1/webhooks/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/search/**").permitAll()
                        .requestMatchers("/api/v1/miniapp/auth").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/referrals/leaderboard").permitAll()
                        .requestMatchers("/api/v1/verification/callback").permitAll()
                        // HRM SSO
                        .requestMatchers("/api/v1/hrm/sso/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/hrm/salary/benchmarks").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/company/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/company/events").permitAll()
                        .requestMatchers(HttpMethod.GET, "/sitemap.xml").permitAll()
                        // Public Marketplace & Intelligence
                        .requestMatchers(HttpMethod.GET, "/api/v1/public/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/public/apply").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/public/favorites").permitAll()
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/public/favorites").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/public/saved-searches").permitAll()
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/public/saved-searches/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/public/companies/*/reviews").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/salary/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/intelligence/salary/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/partner/**").permitAll()
                        // Swagger UI
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()
                        // Health and metrics
                        .requestMatchers("/actuator/health", "/actuator/prometheus").permitAll()
                        // Everything else requires auth
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterAfter(tenantContextFilter, JwtAuthenticationFilter.class)
                .addFilterAfter(rateLimitFilter, TenantContextFilter.class)
                .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.asList(allowedOriginsConfig.split(",")));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept", "X-Requested-With", "X-Telegram-Init-Data"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
