package com.iberia.intranet.service.impl;

import com.iberia.intranet.dto.*;
import com.iberia.intranet.entity.*;
import com.iberia.intranet.entity.RoleType;
import com.iberia.intranet.exception.NotFoundException;
import com.iberia.intranet.mapper.ExpenseMapper;
import com.iberia.intranet.repository.ExpenseAuditLogRepository;
import com.iberia.intranet.repository.ExpenseLineRepository;
import com.iberia.intranet.repository.ExpenseReportRepository;
import com.iberia.intranet.service.UserService;
import com.iberia.intranet.service.ExpenseService;
import com.iberia.intranet.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExpenseServiceImpl implements ExpenseService {

    private final ExpenseReportRepository expenseReportRepository;
    private final ExpenseLineRepository expenseLineRepository;
    private final ExpenseAuditLogRepository expenseAuditLogRepository;
    private final UserService userService;
    private final FileStorageService fileStorageService;

    @Override
    @Transactional(readOnly = true)
    public Page<ExpenseReportDto> getMyExpenses(int page, int size) {
        User currentUser = userService.getCurrentUser();
        Pageable pageable = PageRequest.of(page, size);
        return expenseReportRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId(), pageable)
                .map(ExpenseMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ExpenseReportDto> getExpensesByStatus(ExpenseStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return expenseReportRepository.findByStatusOrderByCreatedAtDesc(status, pageable)
                .map(ExpenseMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public ExpenseReportDto getExpenseById(UUID id) {
        ExpenseReport report = getReportOrThrow(id);
        verifyOwnershipOrManager(report);
        return ExpenseMapper.toDto(report);
    }

    @Override
    @Transactional
    public ExpenseReportDto createExpenseReport(ExpenseReportCreateDto dto) {
        User currentUser = userService.getCurrentUser();
        ExpenseReport report = ExpenseReport.builder()
                .user(currentUser)
                .missionName(dto.getMissionName())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .description(dto.getDescription())
                .status(ExpenseStatus.DRAFT)
                .totalAmount(BigDecimal.ZERO)
                .build();

        report = expenseReportRepository.save(report);
        logAction(report, currentUser, ExpenseAction.CREATED, "Created draft report");
        return ExpenseMapper.toDto(report);
    }

    @Override
    @Transactional
    public ExpenseReportDto updateExpenseReport(UUID id, ExpenseReportCreateDto dto) {
        ExpenseReport report = getReportOrThrow(id);
        verifyOwnership(report);
        ensureStatus(report, ExpenseStatus.DRAFT);

        report.setMissionName(dto.getMissionName());
        report.setStartDate(dto.getStartDate());
        report.setEndDate(dto.getEndDate());
        report.setDescription(dto.getDescription());

        return ExpenseMapper.toDto(expenseReportRepository.save(report));
    }

    @Override
    @Transactional
    public void deleteExpenseReport(UUID id) {
        ExpenseReport report = getReportOrThrow(id);
        verifyOwnership(report);
        ensureStatus(report, ExpenseStatus.DRAFT);
        expenseReportRepository.delete(report);
    }

    @Override
    @Transactional
    public ExpenseReportDto addExpenseLine(UUID reportId, ExpenseLineCreateDto dto, MultipartFile receipt) {
        ExpenseReport report = getReportOrThrow(reportId);
        verifyOwnership(report);
        ensureStatus(report, ExpenseStatus.DRAFT);

        String receiptUrl = null;
        if (receipt != null && !receipt.isEmpty()) {
            receiptUrl = fileStorageService.store(receipt);
        } else if (dto.getAmount().compareTo(new BigDecimal("10.0")) > 0) {
            throw new IllegalArgumentException("Receipt is required for expenses over 10 EUR.");
        }

        ExpenseLine line = ExpenseLine.builder()
                .expenseReport(report)
                .category(dto.getCategory())
                .amount(dto.getAmount())
                .currency(dto.getCurrency() != null ? dto.getCurrency() : "EUR")
                .expenseDate(dto.getExpenseDate())
                .vatAmount(dto.getVatAmount() != null ? dto.getVatAmount() : BigDecimal.ZERO)
                .comment(dto.getComment())
                .receiptUrl(receiptUrl)
                .build();

        line = expenseLineRepository.save(line);

        report.addLine(line);
        recalculateTotal(report);

        return ExpenseMapper.toDto(expenseReportRepository.save(report));
    }

    @Override
    @Transactional
    public void deleteExpenseLine(UUID reportId, UUID lineId) {
        ExpenseReport report = getReportOrThrow(reportId);
        verifyOwnership(report);
        ensureStatus(report, ExpenseStatus.DRAFT);

        ExpenseLine line = expenseLineRepository.findById(lineId)
                .orElseThrow(() -> new NotFoundException("ExpenseLine not found with id " + lineId));

        if (!line.getExpenseReport().getId().equals(report.getId())) {
            throw new IllegalArgumentException("Line does not belong to this report");
        }

        report.removeLine(line);
        expenseLineRepository.delete(line);
        recalculateTotal(report);
        expenseReportRepository.save(report);
    }

    @Override
    @Transactional
    public ExpenseReportDto submitExpense(UUID id) {
        ExpenseReport report = getReportOrThrow(id);
        verifyOwnership(report);
        ensureStatus(report, ExpenseStatus.DRAFT);

        if (report.getLines().isEmpty()) {
            throw new IllegalStateException("Cannot submit an empty expense report.");
        }

        report.setStatus(ExpenseStatus.SUBMITTED);
        report = expenseReportRepository.save(report);
        logAction(report, userService.getCurrentUser(), ExpenseAction.SUBMITTED, "Submitted for approval");
        return ExpenseMapper.toDto(report);
    }

    @Override
    @Transactional
    public ExpenseReportDto approveExpense(UUID id) {
        ExpenseReport report = getReportOrThrow(id);
        // Only managers or admins should approve
        report.setStatus(ExpenseStatus.APPROVED);
        report = expenseReportRepository.save(report);
        logAction(report, userService.getCurrentUser(), ExpenseAction.APPROVED, "Approved expense report");
        return ExpenseMapper.toDto(report);
    }

    @Override
    @Transactional
    public ExpenseReportDto rejectExpense(UUID id, String reason) {
        ExpenseReport report = getReportOrThrow(id);
        if (reason == null || reason.trim().isEmpty()) {
            throw new IllegalArgumentException("A reason is required when rejecting an expense report.");
        }
        report.setStatus(ExpenseStatus.REJECTED);
        report = expenseReportRepository.save(report);
        logAction(report, userService.getCurrentUser(), ExpenseAction.REJECTED, reason);
        return ExpenseMapper.toDto(report);
    }

    @Override
    @Transactional
    public ExpenseReportDto payExpense(UUID id) {
        ExpenseReport report = getReportOrThrow(id);
        ensureStatus(report, ExpenseStatus.APPROVED);
        report.setStatus(ExpenseStatus.PAID);
        report = expenseReportRepository.save(report);
        logAction(report, userService.getCurrentUser(), ExpenseAction.PAID, "Marked as paid");
        return ExpenseMapper.toDto(report);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExpenseAuditLogDto> getAuditLogs(UUID reportId) {
        ExpenseReport report = getReportOrThrow(reportId);
        verifyOwnershipOrManager(report);
        return expenseAuditLogRepository.findByExpenseReportIdOrderByCreatedAtAsc(reportId)
                .stream().map(ExpenseMapper::toDto).collect(Collectors.toList());
    }

    private ExpenseReport getReportOrThrow(UUID id) {
        return expenseReportRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("ExpenseReport not found with id " + id));
    }

    private void verifyOwnership(ExpenseReport report) {
        User currentUser = userService.getCurrentUser();
        if (!report.getUser().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You do not have permission to access this resource.");
        }
    }

    private void verifyOwnershipOrManager(ExpenseReport report) {
        User currentUser = userService.getCurrentUser();
        boolean isManagerOrAdmin = currentUser.getRoles().stream()
                .anyMatch(r -> r.getRole() == RoleType.MANAGER || r.getRole() == RoleType.ADMIN);

        if (!report.getUser().getId().equals(currentUser.getId()) && !isManagerOrAdmin) {
            throw new AccessDeniedException("You do not have permission to access this resource.");
        }
    }

    private void ensureStatus(ExpenseReport report, ExpenseStatus expectedStatus) {
        if (report.getStatus() != expectedStatus) {
            throw new IllegalStateException("Expense report is not in the correct status. Expected: " + expectedStatus
                    + " but was: " + report.getStatus());
        }
    }

    private void recalculateTotal(ExpenseReport report) {
        BigDecimal total = report.getLines().stream()
                .map(ExpenseLine::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        report.setTotalAmount(total);
    }

    private void logAction(ExpenseReport report, User actionBy, ExpenseAction action, String comment) {
        ExpenseAuditLog log = ExpenseAuditLog.builder()
                .expenseReport(report)
                .actionBy(actionBy)
                .action(action)
                .comment(comment)
                .build();
        expenseAuditLogRepository.save(log);
    }
}
