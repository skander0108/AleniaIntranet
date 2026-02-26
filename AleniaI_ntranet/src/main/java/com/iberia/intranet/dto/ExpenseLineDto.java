package com.iberia.intranet.dto;

import com.iberia.intranet.entity.ExpenseCategory;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
public class ExpenseLineDto {
    private UUID id;
    private UUID reportId;
    private ExpenseCategory category;
    private BigDecimal amount;
    private String currency;
    private LocalDate expenseDate;
    private BigDecimal vatAmount;
    private String comment;
    private String receiptUrl;
}
