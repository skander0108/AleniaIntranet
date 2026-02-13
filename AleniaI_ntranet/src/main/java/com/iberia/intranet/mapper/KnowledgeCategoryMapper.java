package com.iberia.intranet.mapper;

import com.iberia.intranet.dto.KnowledgeCategoryDto;
import com.iberia.intranet.entity.KnowledgeCategory;

public final class KnowledgeCategoryMapper {

    private KnowledgeCategoryMapper() {
    }

    public static KnowledgeCategoryDto toDto(KnowledgeCategory category) {
        return KnowledgeCategoryDto.builder()
                .id(category.getId())
                .name(category.getName())
                .build();
    }

    public static KnowledgeCategory toEntity(KnowledgeCategoryDto dto) {
        return KnowledgeCategory.builder()
                .id(dto.getId())
                .name(dto.getName())
                .build();
    }
}

