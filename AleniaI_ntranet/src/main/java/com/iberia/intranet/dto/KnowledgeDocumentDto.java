package com.iberia.intranet.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Value;

import java.time.OffsetDateTime;
import java.util.UUID;

@Value
@Builder
public class KnowledgeDocumentDto {

    UUID id;

    @NotBlank
    String title;

    @NotBlank
    String summary;

    @NotBlank
    String fileUrl;

    String content;
    Integer viewCount;
    Integer helpfulCount;

    OffsetDateTime createdAt;
    OffsetDateTime updatedAt;

    @NotNull
    UUID categoryId;

    @NotNull
    UUID userId;
}
