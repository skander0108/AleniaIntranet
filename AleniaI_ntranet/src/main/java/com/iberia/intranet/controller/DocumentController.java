package com.iberia.intranet.controller;

import com.iberia.intranet.entity.Document;
import com.iberia.intranet.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Document> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam("category") String category,
            @RequestParam("accessLevel") String accessLevel,
            @RequestParam(value = "department", required = false) String department) {

        Document doc = documentService.uploadDocument(file, title, category, accessLevel, department);
        return ResponseEntity.ok(doc);
    }

    @GetMapping
    public ResponseEntity<Page<Document>> getDocuments(
            @RequestParam(value = "search", required = false) String search,
            Pageable pageable) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        Page<Document> docs = documentService.getDocumentsForUser(username, search, pageable);
        return ResponseEntity.ok(docs);
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadDocument(@PathVariable("id") Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        Resource resource = documentService.downloadDocument(id, username);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Document> updateDocument(
            @PathVariable("id") Long id,
            @RequestParam("title") String title,
            @RequestParam("category") String category,
            @RequestParam("accessLevel") String accessLevel,
            @RequestParam(value = "department", required = false) String department) {

        Document doc = documentService.updateDocument(id, title, category, accessLevel, department);
        return ResponseEntity.ok(doc);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteDocument(@PathVariable("id") Long id) {
        documentService.deleteDocument(id);
        return ResponseEntity.ok().build();
    }
}
