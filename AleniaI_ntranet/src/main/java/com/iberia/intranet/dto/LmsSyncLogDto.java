package com.iberia.intranet.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LmsSyncLogDto {

    private UUID id;
    private String syncType;
    private String status;
    private LocalDateTime startedAt;
    private LocalDateTime finishedAt;
    private String message;
    private Integer recordsCount;
}
