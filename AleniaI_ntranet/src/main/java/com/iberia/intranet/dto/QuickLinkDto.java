package com.iberia.intranet.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuickLinkDto {

    UUID id;

    @NotBlank
    String label;

    @NotBlank
    String url;

    @NotNull
    Boolean isActive;

    UUID userId;

    String description;

    String icon;
}
