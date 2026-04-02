package uz.verifix.jobs.service.admin;

import lombok.RequiredArgsConstructor;
import org.hibernate.Hibernate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.verifix.jobs.domain.entity.AdminAuditLog;
import uz.verifix.jobs.domain.entity.AdminUser;
import uz.verifix.jobs.domain.repository.AdminAuditLogRepository;
import uz.verifix.jobs.domain.repository.AdminUserRepository;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminAuditService {

    private final AdminAuditLogRepository auditLogRepository;
    private final AdminUserRepository adminUserRepository;

    @Transactional
    public void log(UUID adminId, String action, String entityType, UUID entityId, String details, String ipAddress) {
        AdminUser admin = adminUserRepository.getReferenceById(adminId);
        AdminAuditLog entry = AdminAuditLog.builder()
                .admin(admin)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .details(details)
                .ipAddress(ipAddress)
                .build();
        auditLogRepository.save(entry);
    }

    @Transactional(readOnly = true)
    public Page<AdminAuditLog> getByAdmin(UUID adminId, Pageable pageable) {
        Page<AdminAuditLog> page = auditLogRepository.findByAdminIdOrderByCreatedAtDesc(adminId, pageable);
        page.getContent().forEach(entry -> Hibernate.initialize(entry.getAdmin()));
        return page;
    }

    @Transactional(readOnly = true)
    public Page<AdminAuditLog> getAll(Pageable pageable) {
        Page<AdminAuditLog> page = auditLogRepository.findAll(pageable);
        page.getContent().forEach(entry -> Hibernate.initialize(entry.getAdmin()));
        return page;
    }
}
