package com.iberia.intranet.mapper;

import com.iberia.intranet.dto.NotificationDto;
import com.iberia.intranet.entity.Notification;

public class NotificationMapper {

    private NotificationMapper() {
    }

    public static NotificationDto toDto(Notification notification, boolean isRead) {
        return NotificationDto.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .targetType(notification.getTargetType())
                .type(notification.getType().name())
                .entityId(notification.getEntityId())
                .linkUrl(notification.getLinkUrl())
                .createdAt(notification.getCreatedAt())
                .isRead(isRead)
                .build();
    }
}
