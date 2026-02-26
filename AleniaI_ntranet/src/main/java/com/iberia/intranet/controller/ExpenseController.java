package com.iberia.intranet.controller;

import com.iberia.intranet.dto.*;
import com.iberia.intranet.entity.ExpenseStatus;
import com.iberia.intranet.service.ExpenseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
@Tag(name = "Travel & Expenses", description = "Endpoints for managing employee expense reports")
public class ExpenseController {

    private final ExpenseService expenseService;

    @GetMapping("/my")
    @Operation(summary = "Get current user's expense reports")
    public ResponseEntity<Page<ExpenseReportDto>> getMyExpenses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(expenseService.getMyExpenses(page, size));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a specific expense report by ID")
    public ResponseEntity<ExpenseReportDto> getExpenseById(@PathVariable UUID id) {
        return ResponseEntity.ok(expenseService.getExpenseById(id));
    }

    @PostMapping
    @Operation(summary = "Create a new draft expense report")
    public ResponseEntity<ExpenseReportDto> createExpenseReport(@Valid @RequestBody ExpenseReportCreateDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(expenseService.createExpenseReport(dto));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a draft expense report")
    public ResponseEntity<ExpenseReportDto> updateExpenseReport(
            @PathVariable UUID id,
            @Valid @RequestBody ExpenseReportCreateDto dto) {
        return ResponseEntity.ok(expenseService.updateExpenseReport(id, dto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a draft expense report")
    public ResponseEntity<Void> deleteExpenseReport(@PathVariable UUID id) {
        expenseService.deleteExpenseReport(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/lines")
    @Operation(summary = "Add an expense line to a draft report with an optional receipt")
    public ResponseEntity<ExpenseReportDto> addExpenseLine(
            @PathVariable UUID id,
            @Valid @RequestPart("expenseLine") ExpenseLineCreateDto dto,
            @RequestPart(value = "receipt", required = false) MultipartFile receipt) {
        return ResponseEntity.ok(expenseService.addExpenseLine(id, dto, receipt));
    }

    @DeleteMapping("/{id}/lines/{lineId}")
    @Operation(summary = "Delete an expense line from a draft report")
    public ResponseEntity<Void> deleteExpenseLine(@PathVariable UUID id, @PathVariable UUID lineId) {
        expenseService.deleteExpenseLine(id, lineId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/submit")
    @Operation(summary = "Submit a draft expense report for approval")
    public ResponseEntity<ExpenseReportDto> submitExpenseReport(@PathVariable UUID id) {
        return ResponseEntity.ok(expenseService.submitExpense(id));
    }

    // --- MANAGER & FINANCE ROUTES --- //

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @Operation(summary = "Get all submitted expenses awaiting approval (Manager/Admin only)")
    public ResponseEntity<Page<ExpenseReportDto>> getPendingExpenses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(expenseService.getExpensesByStatus(ExpenseStatus.SUBMITTED, page, size));
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @Operation(summary = "Approve an expense report (Manager/Admin only)")
    public ResponseEntity<ExpenseReportDto> approveExpenseReport(@PathVariable UUID id) {
        return ResponseEntity.ok(expenseService.approveExpense(id));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @Operation(summary = "Reject an expense report with a reason (Manager/Admin only)")
    public ResponseEntity<ExpenseReportDto> rejectExpenseReport(
            @PathVariable UUID id,
            @RequestBody String reason) {
        return ResponseEntity.ok(expenseService.rejectExpense(id, reason));
    }

    @PostMapping("/{id}/pay")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Mark an approved expense report as paid (Finance/Admin only)")
    public ResponseEntity<ExpenseReportDto> payExpenseReport(@PathVariable UUID id) {
        return ResponseEntity.ok(expenseService.payExpense(id));
    }

    @GetMapping("/{id}/audit")
    @Operation(summary = "Get the audit log of an expense report")
    public ResponseEntity<List<ExpenseAuditLogDto>> getAuditLogs(@PathVariable UUID id) {
        return ResponseEntity.ok(expenseService.getAuditLogs(id));
    }
}
