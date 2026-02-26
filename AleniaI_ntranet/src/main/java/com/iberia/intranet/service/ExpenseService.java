package com.iberia.intranet.service;

import com.iberia.intranet.dto.ExpenseAuditLogDto;
import com.iberia.intranet.dto.ExpenseLineCreateDto;
import com.iberia.intranet.dto.ExpenseReportCreateDto;
import com.iberia.intranet.dto.ExpenseReportDto;
import com.iberia.intranet.entity.ExpenseStatus;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface ExpenseService {
    Page<ExpenseReportDto> getMyExpenses(int page, int size);

    Page<ExpenseReportDto> getExpensesByStatus(ExpenseStatus status, int page, int size);

    ExpenseReportDto getExpenseById(UUID id);

    ExpenseReportDto createExpenseReport(ExpenseReportCreateDto dto);

    ExpenseReportDto updateExpenseReport(UUID id, ExpenseReportCreateDto dto);

    void deleteExpenseReport(UUID id);

    ExpenseReportDto addExpenseLine(UUID reportId, ExpenseLineCreateDto dto, MultipartFile receipt);

    void deleteExpenseLine(UUID reportId, UUID lineId);

    ExpenseReportDto submitExpense(UUID id);

    ExpenseReportDto approveExpense(UUID id);

    ExpenseReportDto rejectExpense(UUID id, String reason);

    ExpenseReportDto payExpense(UUID id);

    List<ExpenseAuditLogDto> getAuditLogs(UUID reportId);
}
