package com.iberia.intranet.dto;

import com.iberia.intranet.entity.LeavePeriod;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveRequestCreateDto {
    private UUID leaveTypeId;
    private LocalDate startDate;
    private LeavePeriod startPeriod;
    private LocalDate endDate;
    private LeavePeriod endPeriod;
    private String reason;
}
