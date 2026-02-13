package com.iberia.intranet.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Value;

import java.util.UUID;

@Value
@Builder
public class KnowledgeCategoryDto {

    UUID id;

    @NotBlank
    String name;
}

