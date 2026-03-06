package com.iberia.intranet.dto;

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
public class ChatConversationDto {
    private UUID id;
    private String userName;
    private String userEmail;
    private String assignedAdminName;
    private String status;
    private String subject;
    private int messageCount;
    private String lastMessage;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
    private ZonedDateTime resolvedAt;
}
