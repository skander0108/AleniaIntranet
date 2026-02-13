package com.iberia.intranet.repository;

import com.iberia.intranet.entity.KnowledgeCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface KnowledgeCategoryRepository extends JpaRepository<KnowledgeCategory, UUID> {
    java.util.Optional<KnowledgeCategory> findByName(String name);
}
