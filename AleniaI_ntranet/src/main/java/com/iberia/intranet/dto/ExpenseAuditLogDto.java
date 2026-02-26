package com.iberia.intranet.dto;

import com.iberia.intranet.entity.ExpenseAction;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class ExpenseAuditLogDto {
    private UUID id;
    private UUID reportId;
    private UUID actionById;
    private String actionByName;
    private ExpenseAction action;
    private String comment;
    private LocalDateTime createdAt;
}
