package com.iberia.intranet.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ToolDto {

    UUID id;

    @NotBlank
    String name;

    @NotBlank
    String url;

    String icon;

    String colorTheme;

    String description;
}
