package com.iberia.intranet.repository;

import com.iberia.intranet.entity.ItSupportAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ItSupportAuditLogRepository extends JpaRepository<ItSupportAuditLog, UUID> {
    List<ItSupportAuditLog> findByTicketIdOrderByTimestampDesc(UUID ticketId);
}
