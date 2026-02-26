package com.iberia.intranet.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LmsUserCourseProgressDto {
    private String userFullName;
    private String email;
    private String ispringUserId;
    private String courseId;
    private String courseTitle;
    private String courseType;
    private String status;
    private BigDecimal score;
    private BigDecimal maxScore;
    private LocalDateTime completionDate;
    private String timeSpent;
}
