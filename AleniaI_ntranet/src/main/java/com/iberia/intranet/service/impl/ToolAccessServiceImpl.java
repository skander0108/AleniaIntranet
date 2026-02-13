package com.iberia.intranet.service.impl;

import com.iberia.intranet.dto.ToolAccessDto;
import com.iberia.intranet.entity.Tool;
import com.iberia.intranet.entity.ToolAccess;
import com.iberia.intranet.entity.User;
import com.iberia.intranet.exception.NotFoundException;
import com.iberia.intranet.mapper.ToolAccessMapper;
import com.iberia.intranet.repository.ToolAccessRepository;
import com.iberia.intranet.repository.ToolRepository;
import com.iberia.intranet.repository.UserRepository;
import com.iberia.intranet.service.ToolAccessService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ToolAccessServiceImpl implements ToolAccessService {

    private final ToolAccessRepository toolAccessRepository;
    private final ToolRepository toolRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ToolAccessDto> listByUser(UUID userId) {
        User user = getUser(userId);
        return toolAccessRepository.findByUser(user).stream()
                .map(ToolAccessMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public ToolAccessDto grantAccess(UUID userId, UUID toolId) {
        User user = getUser(userId);
        Tool tool = getTool(toolId);

        ToolAccess access = toolAccessRepository.findByUserAndTool(user, tool)
                .orElseGet(() -> ToolAccess.builder()
                        .user(user)
                        .tool(tool)
                        .allowed(true)
                        .build());
        access.setAllowed(true);
        return ToolAccessMapper.toDto(toolAccessRepository.save(access));
    }

    @Override
    public ToolAccessDto revokeAccess(UUID userId, UUID toolId) {
        User user = getUser(userId);
        Tool tool = getTool(toolId);
        ToolAccess access = toolAccessRepository.findByUserAndTool(user, tool)
                .orElseThrow(() -> new NotFoundException("Tool access not found"));
        access.setAllowed(false);
        return ToolAccessMapper.toDto(access);
    }

    private User getUser(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found: " + id));
    }

    private Tool getTool(UUID id) {
        return toolRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Tool not found: " + id));
    }
}

