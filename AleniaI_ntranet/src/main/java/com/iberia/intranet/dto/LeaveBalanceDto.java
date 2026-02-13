package com.iberia.intranet.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveBalanceDto {
    private UUID id;
    private LeaveTypeDto leaveType;
    private Double totalAllowance;
    private Double daysTaken;
    private Double daysPending; // Calculated field
    private Double daysRemaining; // Calculated field
    private Integer year;
}
