package com.iberia.intranet.repository;

import com.iberia.intranet.entity.ExpenseAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ExpenseAuditLogRepository extends JpaRepository<ExpenseAuditLog, UUID> {
    List<ExpenseAuditLog> findByExpenseReportIdOrderByCreatedAtAsc(UUID reportId);
}
