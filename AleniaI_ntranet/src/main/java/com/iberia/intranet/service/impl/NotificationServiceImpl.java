package com.iberia.intranet.service.impl;

import com.iberia.intranet.dto.NotificationDto;
import com.iberia.intranet.entity.*;
import com.iberia.intranet.mapper.NotificationMapper;
import com.iberia.intranet.repository.NotificationRecipientRepository;
import com.iberia.intranet.repository.NotificationRepository;
import com.

                iberia.intranet.repository.UserRepository;
import com.iberia.intranet.service.NotificationService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

        private final NotificationRepository notificationRepository;
        private final NotificationRecipientRepository notificationRecipientRepository;
        private final UserRepository userRepository;

        @Value("${iberia.app.sse.public:false}")
        private boolean ssePublic;

        // SSE emitters map: userId -> List of emitters
        private final Map<UUID, List<SseEmitter>> emitters = new ConcurrentHashMap<>();

        // Broadcast emitters for public/unauthenticated SSE connections (dev mode only)
        private final List<SseEmitter> broadcastEmitters = new CopyOnWriteArrayList<>();

        @Override
        @Transactional
        public List<NotificationDto> getUserNotifications(UUID userId, Pageable pageable) {
                User user = userRepository.findWithRolesById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                List<String> roleNames = user.getRoles().stream()
                                .map(ur -> ur.getRole().name())
                                .collect(Collectors.toList());

                List<Notification> notifications = notificationRepository
                                .findNotificationsForUser(user.getId().toString(), roleNames, pageable);

                if (notifications.isEmpty()) {
                        return List.of();
                }

                List<UUID> notificationIds = notifications.stream()
                                .map(Notification::getId)
                                .collect(Collectors.toList());

                Set<UUID> readNotificationIds = notificationRecipientRepository
                                .findByUserIdAndNotificationIdIn(user.getId(), notificationIds)
                                .stream()
                                .filter(NotificationRecipient::getIsRead)
                                .map(nr -> nr.getNotification().getId())
                                .collect(Collectors.toSet());

                return notifications.stream()
                                .map(n -> NotificationMapper.toDto(n, readNotificationIds.contains(n.getId())))
                                .collect(Collectors.toList());
        }

        @Override
        @Transactional
        public NotificationDto getNotification(UUID id, UUID userId) {
                User user = userRepository.findWithRolesById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                Notification notification = notificationRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Notification not found"));

                // Basic security check
                if (notification.getTargetType() == NotificationTargetType.USER
                                && !notification.getTargetValue().equals(user.getId().toString())) {
                        throw new RuntimeException("Access denied");
                }
                if (notification.getTargetType() == NotificationTargetType.ROLE) {
                        boolean hasRole = user.getRoles().stream()
                                        .anyMatch(ur -> ur.getRole().name().equals(notification.getTargetValue()));
                        if (!hasRole)
                                throw new RuntimeException("Access denied");
                }

                Optional<NotificationRecipient> recipient = notificationRecipientRepository
                                .findByUserIdAndNotificationIdIn(user.getId(), List.of(id))
                                .stream().findFirst();

                boolean isRead = recipient.map(NotificationRecipient::getIsRead).orElse(false);
                return NotificationMapper.toDto(notification, isRead);
        }

        @Override
        @Transactional
        public void markAsRead(UUID notificationId, UUID userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                Notification notification = notificationRepository.findById(notificationId)
                                .orElseThrow(() -> new RuntimeException("Notification not found"));

                Optional<NotificationRecipient> existing = notificationRecipientRepository
                                .findByUserIdAndNotificationIdIn(user.getId(), List.of(notificationId))
                                .stream().findFirst();

                if (existing.isPresent()) {
                        NotificationRecipient nr = existing.get();
                        if (!nr.getIsRead()) {
                                nr.setIsRead(true);
                                nr.setReadAt(LocalDateTime.now());
                                notificationRecipientRepository.save(nr);
                        }
                } else {
                        NotificationRecipient nr = NotificationRecipient.builder()
                                        .notification(notification)
                                        .user(user)
                                        .isRead(true)
                                        .readAt(LocalDateTime.now())
                                        .build();
                        notificationRecipientRepository.save(nr);
                }
        }

        @Override
        @Transactional
        public void markAsUnread(UUID notificationId, UUID userId) {
                notificationRecipientRepository.findByUserIdAndNotificationIdIn(userId, List.of(notificationId))
                                .forEach(nr -> {
                                        nr.setIsRead(false);
                                        nr.setReadAt(null);
                                        notificationRecipientRepository.save(nr);
                                });
        }

        @Override
        @Transactional
        public void markAllAsRead(UUID userId) {
                User user = userRepository.findWithRolesById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                List<String> roleNames = user.getRoles().stream()
                                .map(ur -> ur.getRole().name())
                                .collect(Collectors.toList());

                List<Notification> notifications = notificationRepository.findNotificationsForUser(
                                user.getId().toString(), roleNames, Pageable.unpaged());

                for (Notification notification : notifications) {
                        Optional<NotificationRecipient> existing = notificationRecipientRepository
                                        .findByUserIdAndNotificationIdIn(user.getId(), List.of(notification.getId()))
                                        .stream().findFirst();

                        if (existing.isPresent()) {
                                NotificationRecipient nr = existing.get();
                                if (!nr.getIsRead()) {
                                        nr.setIsRead(true);
                                        nr.setReadAt(LocalDateTime.now());
                                        notificationRecipientRepository.save(nr);
                                }
                        } else {
                                NotificationRecipient nr = NotificationRecipient.builder()
                                                .notification(notification)
                                                .user(user)
                                                .isRead(true)
                                                .readAt(LocalDateTime.now())
                                                .build();
                                notificationRecipientRepository.save(nr);
                        }
                }
        }

        @Override
        @Transactional
        public void notifyJoinerCreated(UUID joinerId, String fullName, String jobTitle) {
                String title = "New Joiner Added";
                String message = String.format("%s has joined the team as %s", fullName, jobTitle);
                String linkUrl = "/joiners/" + joinerId;

                createNotification(NotificationType.JOINER_CREATED, title, message,
                                joinerId, linkUrl, "GLOBAL", null);
        }

        @Override
        @Transactional
        public void notifyEventCreated(UUID eventId, String title, LocalDateTime startAt) {
                String notifTitle = "New Event Added";
                String message = String.format("%s scheduled for %s", title, startAt.toLocalDate());
                String linkUrl = "/events?eventId=" + eventId;

                createNotification(NotificationType.EVENT_CREATED, notifTitle, message,
                                eventId, linkUrl, "GLOBAL", null);
        }

        @Override
        @Transactional
        public void notifyAnnouncementPublished(UUID announcementId, String title) {
                String notifTitle = "New Announcement Published";
                String message = title;
                String linkUrl = "/announcements/" + announcementId;

                createNotification(NotificationType.ANNOUNCEMENT_PUBLISHED, notifTitle, message,
                                announcementId, linkUrl, "GLOBAL", null);
        }

        @Override
        @Transactional
        public void createNotification(NotificationType type, String title, String message,
                        UUID entityId, String linkUrl, String targetType, String targetValue) {
                Notification notification = Notification.builder()
                                .type(type)
                                .title(title)
                                .message(message)
                                .entityId(entityId)
                                .linkUrl(linkUrl)
                                .targetType(NotificationTargetType.valueOf(targetType))
                                .targetValue(targetValue)
                                .build();

                notificationRepository.save(notification);

                // Send real-time notification to affected users
                if ("GLOBAL".equals(targetType)) {
                        List<User> allUsers = userRepository.findAll();
                        allUsers.forEach(u -> sendRealTimeNotification(u.getId(),
                                        NotificationMapper.toDto(notification, false)));

                        // Also send to broadcast emitters (public/dev mode)
                        sendBroadcastNotification(NotificationMapper.toDto(notification, false));
                } else if ("USER".equals(targetType)) {
                        // Send to specific user
                        try {
                                UUID userId = UUID.fromString(targetValue);
                                sendRealTimeNotification(userId, NotificationMapper.toDto(notification, false));
                        } catch (IllegalArgumentException e) {
                                log.error("Invalid user ID format for notification target: {}", targetValue);
                        }
                }
        }

        @Override
        @Transactional
        public void notifyLeaveRequestCreated(UUID requestId, UUID managerId, String employeeName) {
                String title = "New Leave Request";
                String message = String.format("%s has submitted a new leave request.", employeeName);
                String linkUrl = "/leave/manager"; // Direct to manager dashboard

                // Notify specific manager
                createNotification(NotificationType.LEAVE_REQUEST_CREATED, title, message,
                                requestId, linkUrl, "USER", managerId.toString());
        }

        @Override
        @Transactional
        public void notifyLeaveRequestApproved(UUID requestId, UUID employeeId) {
                String title = "Leave Request Approved";
                String message = "Your leave request has been approved.";
                String linkUrl = "/leave/my-leaves"; // Direct to employee history

                createNotification(NotificationType.LEAVE_REQUEST_APPROVED, title, message,
                                requestId, linkUrl, "USER", employeeId.toString());
        }

        @Override
        @Transactional
        public void notifyLeaveRequestRejected(UUID requestId, UUID employeeId, String reason) {
                String title = "Leave Request Rejected";
                String message = String.format("Your leave request was rejected. Reason: %s", reason);
                String linkUrl = "/leave/my-leaves";

                createNotification(NotificationType.LEAVE_REQUEST_REJECTED, title, message,
                                requestId, linkUrl, "USER", employeeId.toString());
        }

        @Override
        public int getUnreadCount(UUID userId) {
                return notificationRecipientRepository.countUnreadByUserId(userId);
        }

        @Override
        public SseEmitter subscribeToNotifications(UUID userId) {
                SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
                emitters.computeIfAbsent(userId, k -> new CopyOnWriteArrayList<>()).add(emitter);

                emitter.onCompletion(() -> removeEmitter(userId, emitter));
                emitter.onTimeout(() -> removeEmitter(userId, emitter));
                emitter.onError(e -> removeEmitter(userId, emitter));

                log.info("User {} subscribed to notifications", userId);
                return emitter;
        }

        @Override
        public void sendRealTimeNotification(UUID userId, NotificationDto notification) {
                List<SseEmitter> userEmitters = emitters.get(userId);
                if (userEmitters == null || userEmitters.isEmpty()) {
                        return;
                }

                List<SseEmitter> deadEmitters = new ArrayList<>();
                userEmitters.forEach(emitter -> {
                        try {
                                emitter.send(SseEmitter.event()
                                                .name("notification")
                                                .data(notification));
                        } catch (IOException e) {
                                deadEmitters.add(emitter);
                        }
                });

                userEmitters.removeAll(deadEmitters);
        }

        private void removeEmitter(UUID userId, SseEmitter emitter) {
                List<SseEmitter> userEmitters = emitters.get(userId);
                if (userEmitters != null) {
                        userEmitters.remove(emitter);
                        if (userEmitters.isEmpty()) {
                                emitters.remove(userId);
                        }
                }
        }

        private void sendBroadcastNotification(NotificationDto notification) {
                if (broadcastEmitters.isEmpty()) {
                        return;
                }

                List<SseEmitter> deadEmitters = new ArrayList<>();
                broadcastEmitters.forEach(emitter -> {
                        try {
                                emitter.send(SseEmitter.event()
                                                .name("notification")
                                                .data(notification));
                        } catch (IOException e) {
                                deadEmitters.add(emitter);
                        }
                });

                broadcastEmitters.removeAll(deadEmitters);
        }
}
