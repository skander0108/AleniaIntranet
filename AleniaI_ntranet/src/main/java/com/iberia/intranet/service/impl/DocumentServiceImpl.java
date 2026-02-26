package com.iberia.intranet.service.impl;

import com.iberia.intranet.entity.Document;
import com.iberia.intranet.entity.User;
import com.iberia.intranet.repository.DocumentRepository;
import com.iberia.intranet.repository.UserRepository;
import com.iberia.intranet.service.DocumentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class DocumentServiceImpl implements DocumentService {

    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;

    @Value("${app.upload.dir:uploads/documents}")
    private String uploadDir;

    @Override
    public Document uploadDocument(MultipartFile file, String title, String category, String accessLevel,
            String department) {
        try {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalFileName = file.getOriginalFilename();
            String extension = originalFileName != null && originalFileName.contains(".")
                    ? originalFileName.substring(originalFileName.lastIndexOf("."))
                    : "";

            // Avoid naming collisions
            String storedFileName = UUID.randomUUID().toString() + extension;
            Path filePath = uploadPath.resolve(storedFileName);

            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            Document doc = Document.builder()
                    .title(title)
                    .fileName(storedFileName)
                    .fileType(file.getContentType())
                    .category(category)
                    .accessLevel(accessLevel)
                    .department(department)
                    .build();

            return documentRepository.save(doc);

        } catch (IOException e) {
            log.error("Failed to store file", e);
            throw new RuntimeException("Failed to store document file", e);
        }
    }

    @Override
    public Document createPdfDocumentFromText(String title, String content, String category, String accessLevel,
            String department) {
        try {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String storedFileName = UUID.randomUUID().toString() + ".pdf";
            Path filePath = uploadPath.resolve(storedFileName);

            // Generate PDF
            com.itextpdf.text.Document pdfDoc = new com.itextpdf.text.Document();
            com.itextpdf.text.pdf.PdfWriter.getInstance(pdfDoc, new java.io.FileOutputStream(filePath.toFile()));
            pdfDoc.open();

            // Title
            com.itextpdf.text.Font titleFont = new com.itextpdf.text.Font(com.itextpdf.text.Font.FontFamily.HELVETICA,
                    18, com.itextpdf.text.Font.BOLD);
            pdfDoc.add(new com.itextpdf.text.Paragraph(title, titleFont));
            pdfDoc.add(new com.itextpdf.text.Paragraph("\n"));

            // Content
            com.itextpdf.text.Font contentFont = new com.itextpdf.text.Font(com.itextpdf.text.Font.FontFamily.HELVETICA,
                    12, com.itextpdf.text.Font.NORMAL);
            pdfDoc.add(new com.itextpdf.text.Paragraph(content, contentFont));

            pdfDoc.close();

            Document doc = Document.builder()
                    .title(title)
                    .fileName(storedFileName)
                    .fileType("application/pdf")
                    .category(category)
                    .accessLevel(accessLevel)
                    .department(department)
                    .build();

            return documentRepository.save(doc);

        } catch (Exception e) {
            log.error("Failed to store PDF document", e);
            throw new RuntimeException("Failed to store PDF document", e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Document> getDocumentsForUser(String username, String search, Pageable pageable) {
        User user = userRepository.findWithRolesByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean isAdmin = user.getRoles().stream()
                .map(r -> r.getRole().name())
                .anyMatch(role -> role.equals("ROLE_ADMIN"));

        boolean isManager = user.getRoles().stream()
                .map(r -> r.getRole().name())
                .anyMatch(role -> role.equals("ROLE_MANAGER"));

        List<String> allowedLevels;
        if (isAdmin) {
            allowedLevels = Arrays.asList("ALL", "MANAGER_ONLY", "ADMIN_ONLY");
        } else if (isManager) {
            allowedLevels = Arrays.asList("ALL", "MANAGER_ONLY");
        } else {
            allowedLevels = Arrays.asList("ALL");
        }

        if (search != null && !search.trim().isEmpty()) {
            return documentRepository.searchActiveDocuments(allowedLevels, search.trim(), pageable);
        } else {
            return documentRepository.findActiveDocumentsByAccessLevels(allowedLevels, pageable);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Resource downloadDocument(Long id, String username) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        if (!hasAccess(doc, username)) {
            throw new RuntimeException("Access Denied");
        }

        try {
            Path file = Paths.get(uploadDir).resolve(doc.getFileName()).normalize();
            Resource resource = new UrlResource(file.toUri());

            if (resource.exists() || resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("Could not read file: " + doc.getFileName());
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("Could not read file: " + doc.getFileName(), e);
        }
    }

    @Override
    public Document updateDocument(Long id, String title, String category, String accessLevel, String department) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        doc.setTitle(title);
        doc.setCategory(category);
        doc.setAccessLevel(accessLevel);
        doc.setDepartment(department);

        return documentRepository.save(doc);
    }

    @Override
    public void deleteDocument(Long id) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        doc.setArchived(true);
        documentRepository.save(doc);
    }

    private boolean hasAccess(Document doc, String username) {
        User user = userRepository.findWithRolesByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean isAdmin = user.getRoles().stream().anyMatch(r -> r.getRole().name().equals("ROLE_ADMIN"));
        boolean isManager = user.getRoles().stream().anyMatch(r -> r.getRole().name().equals("ROLE_MANAGER"));

        if (isAdmin)
            return true;
        if ("ADMIN_ONLY".equals(doc.getAccessLevel()))
            return false;
        if ("MANAGER_ONLY".equals(doc.getAccessLevel()))
            return isManager;
        return true;
    }
}
