package com.iberia.intranet.mapper;

import com.iberia.intranet.dto.AssistantSessionDto;
import com.iberia.intranet.entity.AssistantSession;

public final class AssistantSessionMapper {

    private AssistantSessionMapper() {
    }

    public static AssistantSessionDto toDto(AssistantSession session) {
        return AssistantSessionDto.builder()
                .id(session.getId())
                .startedAt(session.getStartedAt())
                .userId(session.getUser().getId())
                .build();
    }
}

