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
public class ChatMessageDto {
    private UUID id;
    private UUID conversationId;
    private String senderType; // USER, BOT, ADMIN
    private UUID senderId;
    private String senderName;
    private String content;
    private ZonedDateTime createdAt;
}
