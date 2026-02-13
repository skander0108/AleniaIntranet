package com.iberia.intranet.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Value;

import java.util.UUID;

@Value
@Builder
public class ToolAccessDto {

    UUID id;

    @NotNull
    Boolean allowed;

    @NotNull
    UUID userId;

    @NotNull
    UUID toolId;
}

