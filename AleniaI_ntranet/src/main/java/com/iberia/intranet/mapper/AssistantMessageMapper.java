package com.iberia.intranet.mapper;

import com.iberia.intranet.dto.AssistantMessageDto;
import com.iberia.intranet.entity.AssistantMessage;
import com.iberia.intranet.entity.AssistantSession;

public final class AssistantMessageMapper {

    private AssistantMessageMapper() {
    }

    public static AssistantMessageDto toDto(AssistantMessage message) {
        return AssistantMessageDto.builder()
                .id(message.getId())
                .role(message.getRole())
                .content(message.getContent())
                .createdAt(message.getCreatedAt())
                .sessionId(message.getSession().getId())
                .build();
    }

    public static AssistantMessage toEntity(AssistantMessageDto dto, AssistantSession session) {
        return AssistantMessage.builder()
                .id(dto.getId())
                .role(dto.getRole())
                .content(dto.getContent())
                .session(session)
                .build();
    }
}

