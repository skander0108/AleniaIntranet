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
public class LeaveTypeDto {
    private UUID id;
    private String name;
    private boolean requiresApproval;
    private boolean deductsBalance;
    private Double allowancePerYear;
    private String colorCode;
}
