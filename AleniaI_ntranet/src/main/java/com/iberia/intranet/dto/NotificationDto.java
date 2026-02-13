package com.iberia.intranet.dto;

import com.iberia.intranet.entity.NotificationTargetType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDto {
    private UUID id;
    private String title;
    private String message;
    private NotificationTargetType targetType;
    private String type;
    private UUID entityId;
    private String linkUrl;
    private ZonedDateTime createdAt;
    private boolean isRead;
}
