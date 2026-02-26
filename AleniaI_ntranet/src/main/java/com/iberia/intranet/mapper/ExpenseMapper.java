package com.iberia.intranet.mapper;

import com.iberia.intranet.dto.*;
import com.iberia.intranet.entity.*;

import java.util.List;
import java.util.stream.Collectors;

public class ExpenseMapper {

    public static ExpenseReportDto toDto(ExpenseReport entity) {
        if (entity == null)
            return null;

        List<ExpenseLineDto> linesDto = null;
        if (entity.getLines() != null) {
            linesDto = entity.getLines().stream()
                    .map(ExpenseMapper::toDto)
                    .collect(Collectors.toList());
        }

        return ExpenseReportDto.builder()
                .id(entity.getId())
                .userId(entity.getUser() != null ? entity.getUser().getId() : null)
                .userName(entity.getUser() != null ? entity.getUser().getFullName() : null)
                .missionName(entity.getMissionName())
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .description(entity.getDescription())
                .status(entity.getStatus())
                .totalAmount(entity.getTotalAmount())
                .lines(linesDto)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public static ExpenseLineDto toDto(ExpenseLine entity) {
        if (entity == null)
            return null;

        return ExpenseLineDto.builder()
                .id(entity.getId())
                .reportId(entity.getExpenseReport() != null ? entity.getExpenseReport().getId() : null)
                .category(entity.getCategory())
                .amount(entity.getAmount())
                .currency(entity.getCurrency())
                .expenseDate(entity.getExpenseDate())
                .vatAmount(entity.getVatAmount())
                .comment(entity.getComment())
                .receiptUrl(entity.getReceiptUrl())
                .build();
    }

    public static ExpenseAuditLogDto toDto(ExpenseAuditLog entity) {
        if (entity == null)
            return null;

        return ExpenseAuditLogDto.builder()
                .id(entity.getId())
                .reportId(entity.getExpenseReport() != null ? entity.getExpenseReport().getId() : null)
                .actionById(entity.getActionBy() != null ? entity.getActionBy().getId() : null)
                .actionByName(entity.getActionBy() != null ? entity.getActionBy().getFullName() : null)
                .action(entity.getAction())
                .comment(entity.getComment())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
