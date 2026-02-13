package com.iberia.intranet.controller;

import com.iberia.intranet.dto.ItSupportCommentDto;
import com.iberia.intranet.dto.ItSupportTicketDetailDto;
import com.iberia.intranet.dto.ItSupportTicketDto;
import com.iberia.intranet.dto.TicketUpdateDto;
import com.iberia.intranet.entity.TicketCategory;
import com.iberia.intranet.entity.TicketPriority;
import com.iberia.intranet.entity.TicketStatus;
import com.iberia.intranet.entity.User;
import com.iberia.intranet.repository.UserRepository;
import com.iberia.intranet.security.UserDetailsImpl;
import com.iberia.intranet.service.AdminItSupportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/it-support")
@Tag(name = "IT Support Admin", description = "Admin endpoints for managing IT support tickets")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminItSupportController {

    private final AdminItSupportService adminItSupportService;
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

    @GetMapping("/tickets")
    @Operation(summary = "Get all tickets with optional filters")
    public ResponseEntity<Page<ItSupportTicketDto>> getAllTickets(
            @RequestParam(value = "status", required = false) TicketStatus status,
            @RequestParam(value = "priority", required = false) TicketPriority priority,
            @RequestParam(value = "category", required = false) TicketCategory category,
            @RequestParam(value = "q", required = false) String searchKeyword,
            Pageable pageable) {

        Page<ItSupportTicketDto> tickets = adminItSupportService.getAllTickets(
                status, priority, category, searchKeyword, pageable);
        return ResponseEntity.ok(tickets);
    }

    @GetMapping("/tickets/{id}")
    @Operation(summary = "Get ticket details (admin view)")
    public ResponseEntity<ItSupportTicketDetailDto> getTicketDetail(@PathVariable("id") UUID id) {
        ItSupportTicketDetailDto ticket = adminItSupportService.getTicketDetail(id);
        return ResponseEntity.ok(ticket);
    }

    @PutMapping("/tickets/{id}")
    @Operation(summary = "Update ticket (status, assignment)")
    public ResponseEntity<ItSupportTicketDetailDto> updateTicket(
            @PathVariable("id") UUID id,
            @Valid @RequestBody TicketUpdateDto dto,
            Authentication authentication) {

        User user = getUser(authentication);
        ItSupportTicketDetailDto ticket = adminItSupportService.updateTicket(id, dto, user);
        return ResponseEntity.ok(ticket);
    }

    @PostMapping("/tickets/{id}/comments")
    @Operation(summary = "Add admin comment to ticket")
    public ResponseEntity<ItSupportCommentDto> addAdminComment(
            @PathVariable("id") UUID id,
            @RequestBody Map<String, String> payload,
            Authentication authentication) {

        User user = getUser(authentication);
        String message = payload.get("message");
        ItSupportCommentDto comment = adminItSupportService.addAdminComment(id, message, user);
        return ResponseEntity.ok(comment);
    }

    @GetMapping("/tickets/{id}/audit-log")
    @Operation(summary = "Get audit log for a ticket")
    public ResponseEntity<java.util.List<com.iberia.intranet.dto.ItSupportAuditLogDto>> getTicketAuditLog(
            @PathVariable("id") UUID id) {
        return ResponseEntity.ok(adminItSupportService.getTicketAuditLog(id));
    }

    @PostMapping("/tickets/{id}/convert-to-kb")
    @Operation(summary = "Convert resolved ticket to KB article")
    public ResponseEntity<Void> convertToKb(@PathVariable("id") UUID id, Authentication authentication) {
        User user = getUser(authentication);
        adminItSupportService.convertToKb(id, user);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/metrics")
    @Operation(summary = "Get IT Support metrics")
    public ResponseEntity<com.iberia.intranet.dto.ItSupportMetricsDto> getMetrics() {
        return ResponseEntity.ok(adminItSupportService.getMetrics());
    }
}
