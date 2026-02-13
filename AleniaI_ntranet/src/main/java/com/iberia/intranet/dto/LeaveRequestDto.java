package com.iberia.intranet.dto;

import com.iberia.intranet.entity.LeavePeriod;
import com.iberia.intranet.entity.LeaveStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveRequestDto {
    private UUID id;
    private UUID employeeId;
    private String employeeName;
    private LeaveTypeDto leaveType;
    private LocalDate startDate;
    private LeavePeriod startPeriod;
    private LocalDate endDate;
    private LeavePeriod endPeriod;
    private Double duration;
    private LeaveStatus status;
    private String reason;
    private String managerComment;
    private String attachmentUrl;
    private ZonedDateTime createdAt;
}
