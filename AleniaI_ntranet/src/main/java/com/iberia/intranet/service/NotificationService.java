package com.iberia.intranet.service;

import com.iberia.intranet.dto.NotificationDto;
import com.iberia.intranet.entity.NotificationType;
import org.springframework.data.domain.Pageable;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface NotificationService {

    // Existing methods
    List<NotificationDto> getUserNotifications(UUID userId, Pageable pageable);

    NotificationDto getNotification(UUID id, UUID userId);

    void markAsRead(UUID notificationId, UUID userId);

    void markAsUnread(UUID notificationId, UUID userId);

    void markAllAsRead(UUID userId);

    // NEW: Helper methods for typed notifications
    void notifyJoinerCreated(UUID joinerId, String fullName, String jobTitle);

    void notifyEventCreated(UUID eventId, String title, LocalDateTime startAt);

    void notifyAnnouncementPublished(UUID announcementId, String title);

    // NEW: Unread count
    int getUnreadCount(UUID userId);

    // NEW: SSE support for real-time notifications
    SseEmitter subscribeToNotifications(UUID userId);

    void sendRealTimeNotification(UUID userId, NotificationDto notification);

    // NEW: Generic notification creator
    void createNotification(NotificationType type, String title, String message,
            UUID entityId, String linkUrl, String targetType, String targetValue);

    // Leave Notifications
    void notifyLeaveRequestCreated(UUID requestId, UUID managerId, String employeeName);

    void notifyLeaveRequestApproved(UUID requestId, UUID employeeId);

    void notifyLeaveRequestRejected(UUID requestId, UUID employeeId, String reason);
}
