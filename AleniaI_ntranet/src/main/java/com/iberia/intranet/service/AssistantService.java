package com.iberia.intranet.service;

import com.iberia.intranet.dto.AssistantMessageDto;
import com.iberia.intranet.dto.AssistantSessionDto;

import java.util.List;
import java.util.UUID;

public interface AssistantService {

    AssistantSessionDto createSession(UUID userId);

    AssistantMessageDto addMessage(AssistantMessageDto dto);

    List<AssistantMessageDto> listMessages(UUID sessionId);
}

