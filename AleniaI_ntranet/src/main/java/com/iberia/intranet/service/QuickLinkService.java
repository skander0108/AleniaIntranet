package com.iberia.intranet.service;

import com.iberia.intranet.dto.QuickLinkDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface QuickLinkService {

    Page<QuickLinkDto> list(Pageable pageable);

    QuickLinkDto get(UUID id);

    QuickLinkDto create(QuickLinkDto dto);

    QuickLinkDto update(UUID id, QuickLinkDto dto);

    void delete(UUID id);
}

