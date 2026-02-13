package com.iberia.intranet.service.impl;

import com.iberia.intranet.dto.LeaveBalanceDto;
import com.iberia.intranet.dto.LeaveRequestCreateDto;
import com.iberia.intranet.dto.LeaveRequestDto;
import com.iberia.intranet.dto.LeaveTypeDto;
import com.iberia.intranet.entity.*;
import com.iberia.intranet.mapper.LeaveMapper;
import com.iberia.intranet.repository.*;
import com.iberia.intranet.service.LeaveService;
import com.iberia.intranet.service.NotificationService;
import com.iberia.intranet.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.time.Year;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class LeaveServiceImpl implements LeaveService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final LeaveTypeRepository leaveTypeRepository;
    private final PublicHolidayRepository publicHolidayRepository;
    private final UserService userService;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Override
    public List<LeaveTypeDto> getAllLeaveTypes() {
        return leaveTypeRepository.findAll().stream()
                .map(LeaveMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<LeaveBalanceDto> getMyBalances() {
        User currentUser = userService.getCurrentUser();
        return getUserBalances(currentUser.getId());
    }

    @Override
    public List<LeaveBalanceDto> getUserBalances(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        int currentYear = Year.now().getValue();

        // Ensure balances exist for the year
        initializeBalances(userId, currentYear);

        return leaveBalanceRepository.findByEmployeeAndYear(user, currentYear).stream()
                .map(balance -> {
                    // Calculate pending days for this specific type
                    List<LeaveRequest> pendingRequests = leaveRequestRepository.findByEmployeeId(userId).stream()
                            .filter(lr -> lr.getStatus() == LeaveStatus.PENDING
                                    && lr.getLeaveType().getId().equals(balance.getLeaveType().getId()))
                            .collect(Collectors.toList());

                    double pendingDays = pendingRequests.stream()
                            .mapToDouble(LeaveRequest::getDuration)
                            .sum();

                    return LeaveMapper.toDto(balance, pendingDays);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void initializeBalances(UUID userId, int year) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<LeaveType> allTypes = leaveTypeRepository.findAll();

        for (LeaveType type : allTypes) {
            Optional<LeaveBalance> existinginfo = leaveBalanceRepository.findByEmployeeAndLeaveTypeAndYear(user, type,
                    year);
            if (existinginfo.isEmpty()) {
                LeaveBalance newBalance = LeaveBalance.builder()
                        .employee(user)
                        .leaveType(type)
                        .year(year)
                        .totalAllowance(type.getAllowancePerYear() != null ? type.getAllowancePerYear() : 0.0)
                        .daysTaken(0.0)
                        .build();
                leaveBalanceRepository.save(newBalance);
            }
        }
    }

    @Override
    @Transactional
    public LeaveRequestDto createRequest(LeaveRequestCreateDto createDto) {
        User currentUser = userService.getCurrentUser();
        LeaveType type = leaveTypeRepository.findById(createDto.getLeaveTypeId())
                .orElseThrow(() -> new RuntimeException("Leave type not found"));

        if (createDto.getEndDate().isBefore(createDto.getStartDate())) {
            throw new IllegalArgumentException("End date cannot be before start date");
        }

        // Calculate duration logic
        double duration = calculateDuration(createDto.getStartDate(), createDto.getStartPeriod(),
                createDto.getEndDate(), createDto.getEndPeriod());

        // Check overlapping
        List<LeaveStatus> activeStatuses = List.of(LeaveStatus.PENDING, LeaveStatus.APPROVED);
        List<LeaveRequest> overlaps = leaveRequestRepository.findOverlappingRequests(
                currentUser.getId(), createDto.getStartDate(), createDto.getEndDate(), activeStatuses);

        if (!overlaps.isEmpty()) {
            throw new IllegalArgumentException("Leave request overlaps with existing request");
        }

        // Check balance if needed
        if (type.isDeductsBalance()) {
            List<LeaveBalanceDto> balances = getUserBalances(currentUser.getId());
            LeaveBalanceDto balanceDto = balances.stream()
                    .filter(b -> b.getLeaveType().getId().equals(type.getId()))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Balance not found"));

            if (balanceDto.getDaysRemaining() < duration) {
                throw new IllegalArgumentException("Insufficient leave balance");
            }
        }

        LeaveRequest request = LeaveRequest.builder()
                .employee(currentUser)
                .leaveType(type)
                .startDate(createDto.getStartDate())
                .startPeriod(createDto.getStartPeriod())
                .endDate(createDto.getEndDate())
                .endPeriod(createDto.getEndPeriod())
                .duration(duration)
                .reason(createDto.getReason())
                .build();

        if (type.isRequiresApproval()) {
            request.setStatus(LeaveStatus.PENDING);
            // Notify Manager (for now, just log or notify all admins if no direct manager)
            // notificationService.notifyLeaveRequestCreated(request.getId(),
            // request.getEmployee().getId(), request.getEmployee().getFullName());
        } else {
            request.setStatus(LeaveStatus.APPROVED);
            // Immediately deduct balance if approved
            if (type.isDeductsBalance()) {
                updateBalance(currentUser, type, duration);
            }
        }

        return LeaveMapper.toDto(leaveRequestRepository.save(request));
    }

    private double calculateDuration(LocalDate start, LeavePeriod startPeriod, LocalDate end, LeavePeriod endPeriod) {
        double days = 0.0;
        LocalDate current = start;

        List<LocalDate> holidays = publicHolidayRepository.findHolidaysBetween(start, end);

        while (!current.isAfter(end)) {
            boolean isWeekend = current.getDayOfWeek() == DayOfWeek.SATURDAY
                    || current.getDayOfWeek() == DayOfWeek.SUNDAY;
            boolean isHoliday = holidays.contains(current);

            if (!isWeekend && !isHoliday) {
                if (current.equals(start) && current.equals(end)) {
                    // Single day
                    if (startPeriod == endPeriod) {
                        days += 0.5;
                    } else {
                        days += 1.0;
                    }
                } else {
                    // Multi-day logic
                    if (current.equals(start)) {
                        days += (startPeriod == LeavePeriod.PM) ? 0.5 : 1.0;
                    } else if (current.equals(end)) {
                        days += (endPeriod == LeavePeriod.AM) ? 0.5 : 1.0;
                    } else {
                        days += 1.0;
                    }
                }
            }
            current = current.plusDays(1);
        }
        return days;
    }

    @Override
    public LeaveRequestDto getRequest(UUID requestId) {
        LeaveRequest request = leaveRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        User currentUser = userService.getCurrentUser();
        // Check permissions: Own request or Manager/Admin
        if (!request.getEmployee().getId().equals(currentUser.getId())) {
            // For simplicity assuming AccessDenied handled by security or strictly checking
            // ownership for now
            // TODO: Add manager check
        }
        return LeaveMapper.toDto(request);
    }

    @Override
    public Page<LeaveRequestDto> getMyRequests(Pageable pageable) {
        User currentUser = userService.getCurrentUser();
        return leaveRequestRepository.findByEmployee(currentUser, pageable)
                .map(LeaveMapper::toDto);
    }

    @Override
    public Page<LeaveRequestDto> getTeamRequests(Pageable pageable, LeaveStatus status) {
        // Efficient fetching with JOIN FETCH to avoid N+1 problem
        return leaveRequestRepository.findAllWithDetails(status, pageable)
                .map(LeaveMapper::toDto);
    }

    @Override
    @Transactional
    public LeaveRequestDto approveRequest(UUID requestId) {
        LeaveRequest request = leaveRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (request.getStatus() != LeaveStatus.PENDING) {
            throw new IllegalStateException("Request is not pending");
        }

        request.setStatus(LeaveStatus.APPROVED);
        request.setManagerComment("Approved");
        request.setUpdatedAt(ZonedDateTime.now());

        if (request.getLeaveType().isDeductsBalance()) {
            updateBalance(request.getEmployee(), request.getLeaveType(), request.getDuration());
        }

        leaveRequestRepository.save(request);
        notificationService.notifyLeaveRequestApproved(request.getId(), request.getEmployee().getId());

        return LeaveMapper.toDto(request);
    }

    private void updateBalance(User employee, LeaveType type, double duration) {
        int currentYear = Year.now().getValue();
        LeaveBalance balance = leaveBalanceRepository.findByEmployeeAndLeaveTypeAndYear(employee, type, currentYear)
                .orElseThrow(() -> new RuntimeException("Balance not found")); // Should verify initialize

        balance.setDaysTaken(balance.getDaysTaken() + duration);
        leaveBalanceRepository.save(balance);
    }

    @Override
    @Transactional
    public LeaveRequestDto rejectRequest(UUID requestId, String reason) {
        LeaveRequest request = leaveRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (request.getStatus() != LeaveStatus.PENDING) {
            throw new IllegalStateException("Request is not pending");
        }

        request.setStatus(LeaveStatus.REJECTED);
        request.setManagerComment(reason);
        request.setUpdatedAt(ZonedDateTime.now());

        leaveRequestRepository.save(request);
        notificationService.notifyLeaveRequestRejected(request.getId(), request.getEmployee().getId(), reason);

        return LeaveMapper.toDto(request);
    }

    @Override
    @Transactional
    public LeaveRequestDto cancelRequest(UUID requestId) {
        User currentUser = userService.getCurrentUser();
        LeaveRequest request = leaveRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (!request.getEmployee().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Not your request");
        }

        if (request.getStatus() == LeaveStatus.APPROVED && request.getStartDate().isBefore(LocalDate.now())) {
            throw new IllegalStateException("Cannot cancel past approved leave");
        }

        // Refund balance if it was approved and deducted
        if (request.getStatus() == LeaveStatus.APPROVED && request.getLeaveType().isDeductsBalance()) {
            refundBalance(request.getEmployee(), request.getLeaveType(), request.getDuration());
        }

        request.setStatus(LeaveStatus.CANCELLED);
        return LeaveMapper.toDto(leaveRequestRepository.save(request));
    }

    private void refundBalance(User employee, LeaveType type, double duration) {
        int currentYear = Year.now().getValue();
        LeaveBalance balance = leaveBalanceRepository.findByEmployeeAndLeaveTypeAndYear(employee, type, currentYear)
                .orElseThrow(() -> new RuntimeException("Balance not found"));

        balance.setDaysTaken(balance.getDaysTaken() - duration);
        leaveBalanceRepository.save(balance);
    }

    @Override
    public List<LeaveRequestDto> getMyTeamCalendar(int month, int year) {
        // Placeholder
        return List.of();
    }
}
