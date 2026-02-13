package com.iberia.intranet.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Value;

import java.time.OffsetDateTime;
import java.util.UUID;

@Value
@Builder
public class EnrollmentDto {

    UUID id;

    @NotBlank
    String status;

    @NotNull
    @Min(0)
    @Max(100)
    Integer progressPercent;

    OffsetDateTime startedAt;
    OffsetDateTime completedAt;

    @NotNull
    UUID trainingId;

    @NotNull
    UUID userId;
}

