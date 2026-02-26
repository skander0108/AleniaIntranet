package com.iberia.intranet.repository;

import com.iberia.intranet.entity.Document;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Long> {

    @Query("SELECT d FROM Document d WHERE d.archived = false AND d.accessLevel IN :accessLevels")
    Page<Document> findActiveDocumentsByAccessLevels(@Param("accessLevels") List<String> accessLevels,
            Pageable pageable);

    @Query("SELECT d FROM Document d WHERE d.archived = false AND d.accessLevel IN :accessLevels AND (LOWER(d.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(d.category) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Document> searchActiveDocuments(@Param("accessLevels") List<String> accessLevels,
            @Param("search") String search, Pageable pageable);

}
