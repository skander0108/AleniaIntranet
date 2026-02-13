package com.iberia.intranet.mapper;

import com.iberia.intranet.dto.*;
import com.iberia.intranet.entity.*;

public class LeaveMapper {

    public static LeaveTypeDto toDto(LeaveType entity) {
        if (entity == null)
            return null;
        return LeaveTypeDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .requiresApproval(entity.isRequiresApproval())
                .deductsBalance(entity.isDeductsBalance())
                .allowancePerYear(entity.getAllowancePerYear())
                .colorCode(entity.getColorCode())
                .build();
    }

    public static LeaveBalanceDto toDto(LeaveBalance entity, Double pendingDays) {
        if (entity == null)
            return null;

        Double daysRemaining = entity.getTotalAllowance() - entity.getDaysTaken()
                - (pendingDays != null ? pendingDays : 0.0);

        return LeaveBalanceDto.builder()
                .id(entity.getId())
                .leaveType(toDto(entity.getLeaveType()))
                .totalAllowance(entity.getTotalAllowance())
                .daysTaken(entity.getDaysTaken())
                .daysPending(pendingDays != null ? pendingDays : 0.0)
                .daysRemaining(daysRemaining)
                .year(entity.getYear())
                .build();
    }

    public static LeaveRequestDto toDto(LeaveRequest entity) {
        if (entity == null)
            return null;
        return LeaveRequestDto.builder()
                .id(entity.getId())
                .employeeId(entity.getEmployee().getId())
                .employeeName(entity.getEmployee().getFullName())
                .leaveType(toDto(entity.getLeaveType()))
                .startDate(entity.getStartDate())
                .startPeriod(entity.getStartPeriod())
                .endDate(entity.getEndDate())
                .endPeriod(entity.getEndPeriod())
                .duration(entity.getDuration())
                .status(entity.getStatus())
                .reason(entity.getReason())
                .managerComment(entity.getManagerComment())
                .attachmentUrl(entity.getAttachmentUrl())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
