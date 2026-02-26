package com.iberia.intranet.dto;

import com.iberia.intranet.entity.ExpenseStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class ExpenseReportDto {
    private UUID id;
    private UUID userId;
    private String userName; // To display who created it
    private String missionName;
    private LocalDate startDate;
    private LocalDate endDate;
    private String description;
    private ExpenseStatus status;
    private BigDecimal totalAmount;
    private List<ExpenseLineDto> lines;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
