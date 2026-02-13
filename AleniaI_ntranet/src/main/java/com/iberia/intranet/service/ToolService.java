package com.iberia.intranet.service;

import com.iberia.intranet.dto.ToolDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface ToolService {

    Page<ToolDto> list(Pageable pageable);

    ToolDto get(UUID id);

    ToolDto create(ToolDto dto);

    ToolDto update(UUID id, ToolDto dto);

    void delete(UUID id);
}

