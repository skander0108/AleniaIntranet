package com.iberia.intranet.controller;

import com.iberia.intranet.dto.NewJoinerDto;
import com.iberia.intranet.service.NewJoinerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/joiners")
@Tag(name = "New Joiners", description = "Endpoints for managing new joiners")
@RequiredArgsConstructor
public class NewJoinerController {

    private final NewJoinerService newJoinerService;

    @GetMapping
    @Operation(summary = "Get all new joiners (paginated)")
    public ResponseEntity<org.springframework.data.domain.Page<NewJoinerDto>> getAllJoiners(
            org.springframework.data.domain.Pageable pageable) {
        return ResponseEntity.ok(newJoinerService.getAllJoiners(pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a new joiner by ID")
    public ResponseEntity<NewJoinerDto> getJoiner(@PathVariable("id") UUID id) {
        return ResponseEntity.ok(newJoinerService.getJoiner(id));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @Operation(summary = "Create a new joiner")
    public ResponseEntity<NewJoinerDto> createJoiner(
            @RequestParam("fullName") String fullName,
            @RequestParam("jobTitle") String jobTitle,
            @RequestParam("department") String department,
            @RequestParam("startDate") LocalDate startDate,
            @RequestParam(value = "location", required = false) String location,
            @RequestParam(value = "photo", required = false) MultipartFile photo,
            @RequestParam(value = "cv", required = false) MultipartFile cv) {
        return ResponseEntity
                .ok(newJoinerService.createJoiner(fullName, jobTitle, department, startDate, location, photo, cv));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @Operation(summary = "Update a new joiner")
    public ResponseEntity<NewJoinerDto> updateJoiner(
            @PathVariable("id") UUID id,
            @RequestParam("fullName") String fullName,
            @RequestParam("jobTitle") String jobTitle,
            @RequestParam("department") String department,
            @RequestParam("startDate") LocalDate startDate,
            @RequestParam(value = "location", required = false) String location,
            @RequestParam(value = "photo", required = false) MultipartFile photo,
            @RequestParam(value = "cv", required = false) MultipartFile cv) {
        return ResponseEntity
                .ok(newJoinerService.updateJoiner(id, fullName, jobTitle, department, startDate, location, photo, cv));
    }

    @GetMapping("/{id}/cv")
    @Operation(summary = "Download joiner CV")
    public ResponseEntity<Resource> downloadCv(@PathVariable("id") UUID id) {
        try {
            Resource resource = newJoinerService.getJoinerCv(id);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @Operation(summary = "Delete a new joiner")
    public ResponseEntity<Void> deleteJoiner(@PathVariable("id") UUID id) {
        newJoinerService.deleteJoiner(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/images/{filename:.+}")
    @Operation(summary = "Serve joiner image")
    public ResponseEntity<Resource> serveFile(@PathVariable("filename") String filename) {
        try {
            Path file = Paths.get("uploads/joiners").resolve(filename).normalize();
            Resource resource = new UrlResource(file.toUri());

            if (resource.exists() && resource.isReadable()) {
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .contentType(MediaType.IMAGE_PNG) // Set content type
                        .body(resource);
            } else {
                // Return 404 instead of 500 for missing files
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException e) {
            // Return 404 for invalid paths instead of 400
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            // Catch any other exceptions and return 404
            return ResponseEntity.notFound().build();
        }
    }
}
