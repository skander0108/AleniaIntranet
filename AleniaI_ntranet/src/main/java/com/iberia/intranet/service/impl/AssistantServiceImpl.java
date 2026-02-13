package com.iberia.intranet.service.impl;

import com.iberia.intranet.dto.AssistantMessageDto;
import com.iberia.intranet.dto.AssistantSessionDto;
import com.iberia.intranet.entity.AssistantMessage;
import com.iberia.intranet.entity.AssistantSession;
import com.iberia.intranet.entity.User;
import com.iberia.intranet.exception.NotFoundException;
import com.iberia.intranet.mapper.AssistantMessageMapper;
import com.iberia.intranet.mapper.AssistantSessionMapper;
import com.iberia.intranet.repository.AssistantMessageRepository;
import com.iberia.intranet.repository.AssistantSessionRepository;
import com.iberia.intranet.repository.UserRepository;
import com.iberia.intranet.service.AssistantService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AssistantServiceImpl implements AssistantService {

    private final AssistantSessionRepository sessionRepository;
    private final AssistantMessageRepository messageRepository;
    private final UserRepository userRepository;

    @Override
    public AssistantSessionDto createSession(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found: " + userId));
        AssistantSession session = AssistantSession.builder()
                .user(user)
                .build();
        return AssistantSessionMapper.toDto(sessionRepository.save(session));
    }

    @Override
    public AssistantMessageDto addMessage(AssistantMessageDto dto) {
        AssistantSession session = sessionRepository.findById(dto.getSessionId())
                .orElseThrow(() -> new NotFoundException("Assistant session not found: " + dto.getSessionId()));
        AssistantMessage message = AssistantMessageMapper.toEntity(dto, session);
        message.setId(null);
        return AssistantMessageMapper.toDto(messageRepository.save(message));
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssistantMessageDto> listMessages(UUID sessionId) {
        AssistantSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new NotFoundException("Assistant session not found: " + sessionId));
        return messageRepository.findBySessionOrderByCreatedAtAsc(session).stream()
                .map(AssistantMessageMapper::toDto)
                .collect(Collectors.toList());
    }
}

