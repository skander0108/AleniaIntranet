package com.iberia.intranet.service.impl;

import com.iberia.intranet.dto.KnowledgeCategoryDto;
import com.iberia.intranet.dto.KnowledgeDocumentDto;
import com.iberia.intranet.entity.KnowledgeCategory;
import com.iberia.intranet.entity.KnowledgeDocument;
import com.iberia.intranet.entity.User;
import com.iberia.intranet.exception.NotFoundException;
import com.iberia.intranet.mapper.KnowledgeCategoryMapper;
import com.iberia.intranet.mapper.KnowledgeDocumentMapper;
import com.iberia.intranet.repository.KnowledgeCategoryRepository;
import com.iberia.intranet.repository.KnowledgeDocumentRepository;
import com.iberia.intranet.repository.UserRepository;
import com.iberia.intranet.service.KnowledgeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class KnowledgeServiceImpl implements KnowledgeService {

    private final KnowledgeCategoryRepository categoryRepository;
    private final KnowledgeDocumentRepository documentRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<KnowledgeCategoryDto> listCategories(Pageable pageable) {
        return categoryRepository.findAll(pageable).map(KnowledgeCategoryMapper::toDto);
    }

    @Override
    public KnowledgeCategoryDto createCategory(KnowledgeCategoryDto dto) {
        KnowledgeCategory category = KnowledgeCategoryMapper.toEntity(dto);
        category.setId(null);
        return KnowledgeCategoryMapper.toDto(categoryRepository.save(category));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<KnowledgeDocumentDto> listDocuments(Pageable pageable) {
        return documentRepository.findAll(pageable).map(KnowledgeDocumentMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<KnowledgeDocumentDto> listDocumentsByCategory(UUID categoryId, Pageable pageable) {
        KnowledgeCategory category = getCategory(categoryId);
        return documentRepository.findByCategory(category, pageable).map(KnowledgeDocumentMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public KnowledgeDocumentDto getDocument(UUID id) {
        KnowledgeDocument document = documentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Knowledge document not found: " + id));
        return KnowledgeDocumentMapper.toDto(document);
    }

    @Override
    public KnowledgeDocumentDto createDocument(KnowledgeDocumentDto dto) {
        KnowledgeCategory category = getCategory(dto.getCategoryId());
        User creator = getUser(dto.getUserId());
        KnowledgeDocument document = KnowledgeDocumentMapper.toEntity(dto, category, creator);
        document.setId(null);
        return KnowledgeDocumentMapper.toDto(documentRepository.save(document));
    }

    @Override
    public KnowledgeDocumentDto updateDocument(UUID id, KnowledgeDocumentDto dto) {
        KnowledgeDocument document = documentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Knowledge document not found: " + id));
        document.setTitle(dto.getTitle());
        document.setSummary(dto.getSummary());
        document.setFileUrl(dto.getFileUrl());
        if (dto.getCategoryId() != null) {
            document.setCategory(getCategory(dto.getCategoryId()));
        }
        if (dto.getUserId() != null) {
            document.setCreator(getUser(dto.getUserId()));
        }
        return KnowledgeDocumentMapper.toDto(document);
    }

    private KnowledgeCategory getCategory(UUID id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Knowledge category not found: " + id));
    }

    private User getUser(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found: " + id));
    }
}

