package uz.verifix.jobs.api.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import uz.verifix.jobs.common.exception.ErrorCode;
import uz.verifix.jobs.common.exception.ErrorResponse;
import uz.verifix.jobs.domain.entity.AdminUser;
import uz.verifix.jobs.domain.repository.AdminUserRepository;

import java.io.IOException;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class AdminPasswordPolicyFilter extends OncePerRequestFilter {

    private static final Set<String> ALLOWED_PATHS = Set.of(
            "/api/v1/admin/auth/me",
            "/api/v1/admin/auth/change-password"
    );

    private final AdminUserRepository adminUserRepository;
    private final ObjectMapper objectMapper;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return HttpMethod.OPTIONS.matches(request.getMethod())
                || !path.startsWith("/api/v1/admin/")
                || "/api/v1/admin/auth/login".equals(path);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        Object principal = org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication() != null
                ? org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getPrincipal()
                : null;

        if (!(principal instanceof AuthenticatedUser user) || user.isEmployerUser()) {
            filterChain.doFilter(request, response);
            return;
        }

        AdminUser admin = adminUserRepository.findById(user.userId()).orElse(null);
        if (admin == null || !admin.isMustChangePassword() || ALLOWED_PATHS.contains(request.getRequestURI())) {
            filterChain.doFilter(request, response);
            return;
        }

        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        objectMapper.writeValue(response.getWriter(), ErrorResponse.builder()
                .error(ErrorCode.PASSWORD_CHANGE_REQUIRED.getCode())
                .message(ErrorCode.PASSWORD_CHANGE_REQUIRED.getDefaultMessage())
                .path(request.getRequestURI())
                .build());
    }
}
