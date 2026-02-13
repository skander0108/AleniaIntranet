package com.iberia.intranet.controller;

import com.iberia.intranet.dto.NotificationDto;
import com.iberia.intranet.security.UserDetailsImpl;
import com.iberia.intranet.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@Tag(name = "Notifications", description = "Endpoints for user notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    private UserDetailsImpl getUserDetails(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new RuntimeException("User not authenticated");
        }
        return (UserDetailsImpl) authentication.getPrincipal();
    }

    @GetMapping
    @Operation(summary = "Get notifications for current user")
    public ResponseEntity<List<NotificationDto>> getNotifications(
            Authentication authentication,
            @PageableDefault(size = 8, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        UserDetailsImpl userDetails = getUserDetails(authentication);
        return ResponseEntity.ok(notificationService.getUserNotifications(userDetails.getId(), pageable));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get unread notification count")
    public ResponseEntity<Integer> getUnreadCount(Authentication authentication) {
        UserDetailsImpl userDetails = getUserDetails(authentication);
        return ResponseEntity.ok(notificationService.getUnreadCount(userDetails.getId()));
    }

    @GetMapping(value = "/stream", produces = "text/event-stream")
    @Operation(summary = "Subscribe to real-time notifications via SSE")
    public org.springframework.web.servlet.mvc.method.annotation.SseEmitter streamNotifications(
            Authentication authentication) {
        UserDetailsImpl userDetails = getUserDetails(authentication);
        return notificationService.subscribeToNotifications(userDetails.getId());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get notification details")
    public ResponseEntity<NotificationDto> getNotification(@PathVariable("id") UUID id, Authentication authentication) {
        UserDetailsImpl userDetails = getUserDetails(authentication);
        return ResponseEntity.ok(notificationService.getNotification(id, userDetails.getId()));
    }

    @PostMapping("/{id}/read")
    @Operation(summary = "Mark notification as read")
    public ResponseEntity<Void> markAsRead(@PathVariable("id") UUID id, Authentication authentication) {
        UserDetailsImpl userDetails = getUserDetails(authentication);
        notificationService.markAsRead(id, userDetails.getId());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/unread")
    @Operation(summary = "Mark notification as unread")
    public ResponseEntity<Void> markAsUnread(@PathVariable("id") UUID id, Authentication authentication) {
        UserDetailsImpl userDetails = getUserDetails(authentication);
        notificationService.markAsUnread(id, userDetails.getId());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/read-all")
    @Operation(summary = "Mark all notifications as read")
    public ResponseEntity<Void> markAllAsRead(Authentication authentication) {
        UserDetailsImpl userDetails = getUserDetails(authentication);
        notificationService.markAllAsRead(userDetails.getId());
        return ResponseEntity.ok().build();
    }
}
