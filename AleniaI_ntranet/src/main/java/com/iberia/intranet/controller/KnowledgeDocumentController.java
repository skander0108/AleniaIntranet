package com.iberia.intranet.controller;

import com.iberia.intranet.dto.KnowledgeDocumentDto;
import com.iberia.intranet.service.KnowledgeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/knowledge-documents")
@RequiredArgsConstructor
public class KnowledgeDocumentController {

    private final KnowledgeService knowledgeService;

    @GetMapping
    public Page<KnowledgeDocumentDto> list(@ParameterObject Pageable pageable,
            @RequestParam(value = "categoryId", required = false) UUID categoryId) {
        if (categoryId != null) {
            return knowledgeService.listDocumentsByCategory(categoryId, pageable);
        }
        return knowledgeService.listDocuments(pageable);
    }

    @GetMapping("/{id}")
    public KnowledgeDocumentDto get(@PathVariable("id") UUID id) {
        return knowledgeService.getDocument(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public KnowledgeDocumentDto create(@Valid @RequestBody KnowledgeDocumentDto dto) {
        return knowledgeService.createDocument(dto);
    }

    @PutMapping("/{id}")
    public KnowledgeDocumentDto update(@PathVariable("id") UUID id, @Valid @RequestBody KnowledgeDocumentDto dto) {
        return knowledgeService.updateDocument(id, dto);
    }
}
