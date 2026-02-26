package com.iberia.intranet.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LmsProgressDto {

    private UUID id;
    private UUID userId;
    private String userFullName;
    private String courseId;
    private String courseTitle;
    private String courseType;
    private String status;
    private LocalDateTime completionDate;
    private BigDecimal score;
    private BigDecimal maxScore;
    private LocalDateTime updatedAt;
}
