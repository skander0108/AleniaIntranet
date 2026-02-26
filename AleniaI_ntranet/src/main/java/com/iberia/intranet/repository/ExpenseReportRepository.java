package com.iberia.intranet.repository;

import com.iberia.intranet.entity.ExpenseReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ExpenseReportRepository extends JpaRepository<ExpenseReport, UUID> {
    Page<ExpenseReport> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    Page<ExpenseReport> findByStatusOrderByCreatedAtDesc(com.iberia.intranet.entity.ExpenseStatus status,
            Pageable pageable);
}
