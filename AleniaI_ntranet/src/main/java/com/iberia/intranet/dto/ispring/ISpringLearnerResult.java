package com.iberia.intranet.dto.ispring;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ISpringLearnerResult {
    @JsonProperty("userId")
    private String userId;

    @JsonProperty("courseId")
    private String courseId;

    @JsonProperty("moduleTitle")
    private String courseTitle;

    @JsonProperty("courseType")
    private String courseType;

    @JsonProperty("completionStatus")
    private String status;

    @JsonProperty("progress")
    private BigDecimal score;

    @JsonProperty("maxScore")
    private BigDecimal maxScore;

    @JsonProperty("completionDate")
    private String completionDate; // iSpring returns ISO date string

    @JsonProperty("timeSpent")
    private String timeSpent;
}
