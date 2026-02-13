package com.iberia.intranet.service;

import com.iberia.intranet.dto.KnowledgeCategoryDto;
import com.iberia.intranet.dto.KnowledgeDocumentDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface KnowledgeService {

    // Categories
    Page<KnowledgeCategoryDto> listCategories(Pageable pageable);

    KnowledgeCategoryDto createCategory(KnowledgeCategoryDto dto);

    // Documents
    Page<KnowledgeDocumentDto> listDocuments(Pageable pageable);

    Page<KnowledgeDocumentDto> listDocumentsByCategory(UUID categoryId, Pageable pageable);

    KnowledgeDocumentDto getDocument(UUID id);

    KnowledgeDocumentDto createDocument(KnowledgeDocumentDto dto);

    KnowledgeDocumentDto updateDocument(UUID id, KnowledgeDocumentDto dto);
}

