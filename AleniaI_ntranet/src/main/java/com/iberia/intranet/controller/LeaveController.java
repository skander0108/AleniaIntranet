package com.iberia.intranet.controller;

import com.iberia.intranet.dto.*;
import com.iberia.intranet.entity.LeaveStatus;
import com.iberia.intranet.service.LeaveService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/leaves")
@RequiredArgsConstructor
@Tag(name = "Leave Management", description = "Endpoints for managing leaves")
public class LeaveController {

    private final LeaveService leaveService;

    @GetMapping("/types")
    @Operation(summary = "Get all available leave types")
    public ResponseEntity<List<LeaveTypeDto>> getAllLeaveTypes() {
        return ResponseEntity.ok(leaveService.getAllLeaveTypes());
    }

    @GetMapping("/my-balances")
    @Operation(summary = "Get current user's leave balances")
    public ResponseEntity<List<LeaveBalanceDto>> getMyBalances() {
        return ResponseEntity.ok(leaveService.getMyBalances());
    }

    @PostMapping("/requests")
    @Operation(summary = "Submit a new leave request")
    public ResponseEntity<LeaveRequestDto> createRequest(@RequestBody LeaveRequestCreateDto createDto) {
        return ResponseEntity.ok(leaveService.createRequest(createDto));
    }

    @GetMapping("/requests")
    @Operation(summary = "Get current user's leave requests")
    public ResponseEntity<Page<LeaveRequestDto>> getMyRequests(Pageable pageable) {
        return ResponseEntity.ok(leaveService.getMyRequests(pageable));
    }

    @GetMapping("/requests/{id}")
    @Operation(summary = "Get a specific leave request")
    public ResponseEntity<LeaveRequestDto> getRequest(@PathVariable("id") UUID id) {
        return ResponseEntity.ok(leaveService.getRequest(id));
    }

    @PutMapping("/requests/{id}/cancel")
    @Operation(summary = "Cancel a leave request")
    public ResponseEntity<LeaveRequestDto> cancelRequest(@PathVariable("id") UUID id) {
        return ResponseEntity.ok(leaveService.cancelRequest(id));
    }

    // Manager / Admin Endpoints

    @GetMapping("/team/requests")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @Operation(summary = "Get team leave requests (Manager only)")
    public ResponseEntity<Page<LeaveRequestDto>> getTeamRequests(
            @RequestParam(required = false) LeaveStatus status,
            Pageable pageable) {
        return ResponseEntity.ok(leaveService.getTeamRequests(pageable, status));
    }

    @PutMapping("/requests/{id}/approve")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @Operation(summary = "Approve a leave request")
    public ResponseEntity<LeaveRequestDto> approveRequest(@PathVariable("id") UUID id) {
        return ResponseEntity.ok(leaveService.approveRequest(id));
    }

    @PutMapping("/requests/{id}/reject")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @Operation(summary = "Reject a leave request")
    public ResponseEntity<LeaveRequestDto> rejectRequest(@PathVariable("id") UUID id,
            @RequestBody Map<String, String> payload) {
        String reason = payload.get("reason");
        if (reason == null || reason.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(leaveService.rejectRequest(id, reason));
    }

    @GetMapping("/admin/users/{userId}/balances")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get specific user balances (Admin only)")
    public ResponseEntity<List<LeaveBalanceDto>> getUserBalances(@PathVariable("userId") UUID userId) {
        return ResponseEntity.ok(leaveService.getUserBalances(userId));
    }
}
