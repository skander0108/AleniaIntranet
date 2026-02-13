package com.iberia.intranet.dto;

import lombok.Builder;
import lombok.Value;

import java.time.OffsetDateTime;
import java.util.UUID;

@Value
@Builder
public class AssistantSessionDto {

    UUID id;
    OffsetDateTime startedAt;
    UUID userId;
}

