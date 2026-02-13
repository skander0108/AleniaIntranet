package com.iberia.intranet.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnnouncementDto {

    UUID id;

    @NotBlank
    String title;

    @NotBlank
    String content;

    OffsetDateTime publishedAt;

    @NotBlank
    String status;

    UUID publisherId;

    String summary;

    String imageUrl;

    String category;

    Boolean isFeatured;

    String priority;

    String targetAudience;
}
