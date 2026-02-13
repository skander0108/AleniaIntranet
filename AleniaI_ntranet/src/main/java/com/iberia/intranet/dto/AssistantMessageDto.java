package com.iberia.intranet.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Value;

import java.time.OffsetDateTime;
import java.util.UUID;

@Value
@Builder
public class AssistantMessageDto {

    UUID id;

    @NotBlank
    String role;

    @NotBlank
    String content;

    OffsetDateTime createdAt;

    @NotNull
    UUID sessionId;
}

