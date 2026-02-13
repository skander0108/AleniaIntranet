package com.iberia.intranet.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItSupportAuditLogDto {
    private UUID id;
    private String action;
    private String changedByFullName;
    private String oldValue;
    private String newValue;
    private OffsetDateTime timestamp;
}
