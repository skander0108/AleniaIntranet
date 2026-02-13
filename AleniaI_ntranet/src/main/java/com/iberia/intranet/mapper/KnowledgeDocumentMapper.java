package com.iberia.intranet.mapper;

import com.iberia.intranet.dto.KnowledgeDocumentDto;
import com.iberia.intranet.entity.KnowledgeCategory;
import com.iberia.intranet.entity.KnowledgeDocument;
import com.iberia.intranet.entity.User;

public final class KnowledgeDocumentMapper {

    private KnowledgeDocumentMapper() {
    }

    public static KnowledgeDocumentDto toDto(KnowledgeDocument document) {
        return KnowledgeDocumentDto.builder()
                .id(document.getId())
                .title(document.getTitle())
                .summary(document.getSummary())
                .fileUrl(document.getFileUrl())
                .content(document.getContent())
                .viewCount(document.getViewCount())
                .helpfulCount(document.getHelpfulCount())
                .createdAt(document.getCreatedAt())
                .updatedAt(document.getUpdatedAt())
                .categoryId(document.getCategory().getId())
                .userId(document.getCreator().getId())
                .build();
    }

    public static KnowledgeDocument toEntity(KnowledgeDocumentDto dto,
            KnowledgeCategory category,
            User creator) {
        return KnowledgeDocument.builder()
                .id(dto.getId())
                .title(dto.getTitle())
                .summary(dto.getSummary())
                .fileUrl(dto.getFileUrl())
                .content(dto.getContent())
                .viewCount(dto.getViewCount())
                .helpfulCount(dto.getHelpfulCount())
                .category(category)
                .creator(creator)
                .build();
    }
}
