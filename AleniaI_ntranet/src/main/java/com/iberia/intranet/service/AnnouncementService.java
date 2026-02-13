package com.iberia.intranet.service;

import com.iberia.intranet.dto.AnnouncementDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface AnnouncementService {

    Page<AnnouncementDto> list(Pageable pageable);

    Page<AnnouncementDto> listPublished(Pageable pageable);

    Page<AnnouncementDto> listByPublisher(com.iberia.intranet.entity.User publisher, Pageable pageable);

    AnnouncementDto get(UUID id);

    AnnouncementDto create(AnnouncementDto dto, com.iberia.intranet.entity.User currentUser);

    AnnouncementDto update(UUID id, AnnouncementDto dto, com.iberia.intranet.entity.User currentUser);

    void delete(UUID id, com.iberia.intranet.entity.User currentUser);

    void markView(UUID announcementId, UUID userId);
}
