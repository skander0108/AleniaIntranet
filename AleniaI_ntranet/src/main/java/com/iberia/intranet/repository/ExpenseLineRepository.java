package com.iberia.intranet.repository;

import com.iberia.intranet.entity.ExpenseLine;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ExpenseLineRepository extends JpaRepository<ExpenseLine, UUID> {
    List<ExpenseLine> findByExpenseReportId(UUID reportId);
}
