package uz.verifix.jobs.api.security;

import java.security.Principal;
import java.util.UUID;

public record AuthenticatedUser(
        UUID userId,
        String role,
        UUID employerId,
        String tokenType
) implements Principal {

    @Override
    public String getName() {
        return userId.toString();
    }

    public boolean isEmployerUser() {
        return employerId != null;
    }
}
