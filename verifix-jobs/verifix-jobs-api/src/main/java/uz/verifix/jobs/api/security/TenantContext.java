package uz.verifix.jobs.api.security;

import java.util.UUID;

public final class TenantContext {

    private static final ThreadLocal<UUID> EMPLOYER_ID = new ThreadLocal<>();

    private TenantContext() {}

    public static void setEmployerId(UUID employerId) {
        EMPLOYER_ID.set(employerId);
    }

    public static UUID getEmployerId() {
        return EMPLOYER_ID.get();
    }

    public static void clear() {
        EMPLOYER_ID.remove();
    }
}
