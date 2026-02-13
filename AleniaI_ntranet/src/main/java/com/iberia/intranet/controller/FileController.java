package com.iberia.intranet.controller;

import com.iberia.intranet.service.FileStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@Tag(name = "File Management", description = "Endpoints for file upload and retrieval")
public class FileController {

    private final FileStorageService storageService;

    @PostMapping("/upload")
    @Operation(summary = "Upload a file")
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        String filename = storageService.store(file);

        String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/files/")
                .path(filename)
                .toUriString();

        Map<String, String> response = new HashMap<>();
        response.put("filename", filename);
        response.put("url", fileDownloadUri);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{filename:.+}")
    @Operation(summary = "Download/View a file")
    public ResponseEntity<Resource> serveFile(@PathVariable("filename") String filename) {
        Resource file = storageService.loadAsResource(filename);

        if (file == null)
            return ResponseEntity.notFound().build();

        return ResponseEntity.ok()
                // .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" +
                // file.getFilename() + "\"") // Commented out to display inline
                .body(file);
    }
}
