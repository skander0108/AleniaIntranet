package com.iberia.intranet.service;

import com.iberia.intranet.dto.LeaveBalanceDto;
import com.iberia.intranet.dto.LeaveRequestCreateDto;
import com.iberia.intranet.dto.LeaveRequestDto;
import com.iberia.intranet.dto.LeaveTypeDto;
import com.iberia.intranet.entity.LeaveStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface LeaveService {

    // Leave Types
    List<LeaveTypeDto> getAllLeaveTypes();

    // Balances
    List<LeaveBalanceDto> getMyBalances();

    List<LeaveBalanceDto> getUserBalances(UUID userId);

    void initializeBalances(UUID userId, int year);

    // Requests
    LeaveRequestDto createRequest(LeaveRequestCreateDto createDto);

    LeaveRequestDto getRequest(UUID requestId);

    Page<LeaveRequestDto> getMyRequests(Pageable pageable);

    Page<LeaveRequestDto> getTeamRequests(Pageable pageable, LeaveStatus status);

    // Workflow
    LeaveRequestDto approveRequest(UUID requestId);

    LeaveRequestDto rejectRequest(UUID requestId, String reason);

    LeaveRequestDto cancelRequest(UUID requestId);

    // Calendar
    List<LeaveRequestDto> getMyTeamCalendar(int month, int year);
}
