package com.iberia.intranet.dto;

import com.iberia.intranet.entity.ExpenseCategory;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ExpenseLineCreateDto {
    @NotNull
    private ExpenseCategory category;

    @NotNull
    @Positive
    private BigDecimal amount;

    private String currency = "EUR";

    @NotNull
    private LocalDate expenseDate;

    private BigDecimal vatAmount;

    private String comment;
}
