package com.iberia.intranet.repository;

import com.iberia.intranet.entity.KnowledgeCategory;
import com.iberia.intranet.entity.KnowledgeDocument;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface KnowledgeDocumentRepository extends JpaRepository<KnowledgeDocument, UUID> {

    Page<KnowledgeDocument> findByCategory(KnowledgeCategory category, Pageable pageable);
}

