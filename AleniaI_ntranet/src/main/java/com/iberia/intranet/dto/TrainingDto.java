package com.iberia.intranet.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Value;

import java.util.UUID;

@Value
@Builder
public class TrainingDto {

    UUID id;

    @NotBlank
    String title;

    @NotBlank
    String description;

    @Min(1)
    Integer durationMinutes;
}

