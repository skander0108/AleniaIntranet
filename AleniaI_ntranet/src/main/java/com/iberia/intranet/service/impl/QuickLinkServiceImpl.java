package com.iberia.intranet.service.impl;

import com.iberia.intranet.dto.QuickLinkDto;
import com.iberia.intranet.entity.QuickLink;
import com.iberia.intranet.entity.User;
import com.iberia.intranet.exception.NotFoundException;
import com.iberia.intranet.mapper.QuickLinkMapper;
import com.iberia.intranet.repository.QuickLinkRepository;
import com.iberia.intranet.repository.UserRepository;
import com.iberia.intranet.service.QuickLinkService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class QuickLinkServiceImpl implements QuickLinkService {

    private final QuickLinkRepository quickLinkRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<QuickLinkDto> list(Pageable pageable) {
        return quickLinkRepository.findAll(pageable).map(QuickLinkMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public QuickLinkDto get(UUID id) {
        QuickLink quickLink = quickLinkRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("QuickLink not found: " + id));
        return QuickLinkMapper.toDto(quickLink);
    }

    @Override
    public QuickLinkDto create(QuickLinkDto dto) {
        User user = null;
        if (dto.getUserId() != null) {
            user = userRepository.findById(dto.getUserId())
                    .orElseThrow(() -> new NotFoundException("User not found: " + dto.getUserId()));
        }
        QuickLink quickLink = QuickLinkMapper.toEntity(dto, user);
        quickLink.setId(null);
        return QuickLinkMapper.toDto(quickLinkRepository.save(quickLink));
    }

    @Override
    public QuickLinkDto update(UUID id, QuickLinkDto dto) {
        QuickLink quickLink = quickLinkRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("QuickLink not found: " + id));
        quickLink.setLabel(dto.getLabel());
        quickLink.setUrl(dto.getUrl());
        quickLink.setActive(dto.getIsActive());
        quickLink.setDescription(dto.getDescription());
        quickLink.setIcon(dto.getIcon());
        return QuickLinkMapper.toDto(quickLink);
    }

    @Override
    public void delete(UUID id) {
        if (!quickLinkRepository.existsById(id)) {
            throw new NotFoundException("QuickLink not found: " + id);
        }
        quickLinkRepository.deleteById(id);
    }
}
