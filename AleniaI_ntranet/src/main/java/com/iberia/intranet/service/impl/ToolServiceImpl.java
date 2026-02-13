package com.iberia.intranet.service.impl;

import com.iberia.intranet.dto.ToolDto;
import com.iberia.intranet.entity.Tool;
import com.iberia.intranet.exception.NotFoundException;
import com.iberia.intranet.mapper.ToolMapper;
import com.iberia.intranet.repository.ToolRepository;
import com.iberia.intranet.service.ToolService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ToolServiceImpl implements ToolService {

    private final ToolRepository toolRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<ToolDto> list(Pageable pageable) {
        return toolRepository.findAll(pageable).map(ToolMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public ToolDto get(UUID id) {
        Tool tool = toolRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Tool not found: " + id));
        return ToolMapper.toDto(tool);
    }

    @Override
    public ToolDto create(ToolDto dto) {
        Tool tool = ToolMapper.toEntity(dto);
        tool.setId(null);
        return ToolMapper.toDto(toolRepository.save(tool));
    }

    @Override
    public ToolDto update(UUID id, ToolDto dto) {
        Tool tool = toolRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Tool not found: " + id));
        tool.setName(dto.getName());
        tool.setUrl(dto.getUrl());
        tool.setIcon(dto.getIcon());
        tool.setColorTheme(dto.getColorTheme());
        tool.setDescription(dto.getDescription());
        return ToolMapper.toDto(tool);
    }

    @Override
    public void delete(UUID id) {
        if (!toolRepository.existsById(id)) {
            throw new NotFoundException("Tool not found: " + id);
        }
        toolRepository.deleteById(id);
    }
}
