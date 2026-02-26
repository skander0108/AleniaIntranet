package com.iberia.intranet.service;

import com.iberia.intranet.entity.Document;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

public interface DocumentService {

    Document uploadDocument(MultipartFile file, String title, String category, String accessLevel, String department);

    Document createPdfDocumentFromText(String title, String content, String category, String accessLevel,
            String department);

    Page<Document> getDocumentsForUser(String username, String search, Pageable pageable);

    Resource downloadDocument(Long id, String username);

    Document updateDocument(Long id, String title, String category, String accessLevel, String department);

    void deleteDocument(Long id);
}
