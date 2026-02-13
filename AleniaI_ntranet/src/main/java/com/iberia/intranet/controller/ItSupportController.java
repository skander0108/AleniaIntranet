package com.iberia.intranet.controller;

import com.iberia.intranet.dto.ItSupportCommentDto;
import com.iberia.intranet.dto.ItSupportTicketCreateDto;
import com.iberia.intranet.dto.ItSupportTicketDetailDto;
import com.iberia.intranet.dto.ItSupportTicketDto;
import com.iberia.intranet.entity.User;
import com.iberia.intranet.repository.UserRepository;
import com.iberia.intranet.security.UserDetailsImpl;
import com.iberia.intranet.service.ItSupportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/it-support")
@Tag(name = "IT Support", description = "User endpoints for IT support ticketing")
@RequiredArgsConstructor
// @PreAuthorize("isAuthenticated()") // Temporarily disabled for testing
public class ItSupportController {

    private final ItSupportService itSupportService;
    private final UserRepository userRepository;

    private User getUser(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            // For testing without authentication, return first user in database
            return userRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new RuntimeException("No users found in database"));
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @PostMapping(value = "/tickets", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Create a new IT support ticket")
    public ResponseEntity<ItSupportTicketDto> createTicket(
            @Valid @ModelAttribute ItSupportTicketCreateDto dto,
            @RequestParam(value = "file", required = false) MultipartFile file,
            Authentication authentication) {

        User user = getUser(authentication);
        ItSupportTicketDto ticket = itSupportService.createTicket(dto, file, user);
        return ResponseEntity.ok(ticket);
    }

    @GetMapping("/tickets/my")
    @Operation(summary = "Get my tickets")
    public ResponseEntity<Page<ItSupportTicketDto>> getMyTickets(
            Pageable pageable,
            Authentication authentication) {

        User user = getUser(authentication);
        Page<ItSupportTicketDto> tickets = itSupportService.getMyTickets(user, pageable);
        return ResponseEntity.ok(tickets);
    }

    @GetMapping("/tickets/{id}")
    @Operation(summary = "Get ticket details")
    public ResponseEntity<ItSupportTicketDetailDto> getTicketDetail(
            @PathVariable("id") UUID id,
            Authentication authentication) {

        User user = getUser(authentication);
        ItSupportTicketDetailDto ticket = itSupportService.getTicketDetail(id, user);
        return ResponseEntity.ok(ticket);
    }

    @PostMapping("/tickets/{id}/comments")
    @Operation(summary = "Add a comment to a ticket")
    public ResponseEntity<ItSupportCommentDto> addComment(
            @PathVariable("id") UUID id,
            @RequestBody Map<String, String> payload,
            Authentication authentication) {

        User user = getUser(authentication);
        String message = payload.get("message");
        ItSupportCommentDto comment = itSupportService.addComment(id, message, user);
        return ResponseEntity.ok(comment);
    }

    @PostMapping("/tickets/{id}/close")
    @Operation(summary = "Close a ticket (only if resolved)")
    public ResponseEntity<Void> closeTicket(
            @PathVariable("id") UUID id,
            Authentication authentication) {

        User user = getUser(authentication);
        itSupportService.closeTicket(id, user);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/tickets/{ticketId}/attachments/{attachmentId}/download")
    @Operation(summary = "Download ticket attachment")
    public ResponseEntity<Resource> downloadAttachment(
            @PathVariable("ticketId") UUID ticketId,
            @PathVariable("attachmentId") UUID attachmentId,
            Authentication authentication) {

        User user = getUser(authentication);
        Resource resource = itSupportService.downloadAttachment(ticketId, attachmentId, user);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}
