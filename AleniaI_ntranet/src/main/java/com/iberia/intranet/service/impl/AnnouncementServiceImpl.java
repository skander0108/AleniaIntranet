package com.iberia.intranet.service.impl;

import com.iberia.intranet.dto.AnnouncementDto;
import com.iberia.intranet.entity.Announcement;
import com.iberia.intranet.entity.AnnouncementView;
import com.iberia.intranet.entity.User;
import com.iberia.intranet.exception.NotFoundException;
import com.iberia.intranet.mapper.AnnouncementMapper;
import com.iberia.intranet.repository.AnnouncementRepository;
import com.iberia.intranet.repository.AnnouncementViewRepository;
import com.iberia.intranet.repository.UserRepository;
import com.iberia.intranet.service.AnnouncementService;
import com.iberia.intranet.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class AnnouncementServiceImpl implements AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final AnnouncementViewRepository announcementViewRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Override
    @Transactional(readOnly = true)
    public Page<AnnouncementDto> list(Pageable pageable) {
        return announcementRepository.findAll(pageable).map(AnnouncementMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AnnouncementDto> listPublished(Pageable pageable) {
        return announcementRepository.findByStatus("PUBLISHED", pageable)
                .map(AnnouncementMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AnnouncementDto> listByPublisher(User publisher, Pageable pageable) {
        return announcementRepository.findByUser(publisher, pageable)
                .map(AnnouncementMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public AnnouncementDto get(UUID id) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Announcement not found: " + id));
        return AnnouncementMapper.toDto(announcement);
    }

    @Override
    public AnnouncementDto create(AnnouncementDto dto, User currentUser) {
        Announcement announcement = AnnouncementMapper.toEntity(dto, currentUser);
        announcement.setId(null);
        announcement.setUser(currentUser); // Enforce current user as publisher

        Announcement saved = announcementRepository.save(announcement);

        // Create notification for all users when announcement is created and published
        if ("PUBLISHED".equalsIgnoreCase(saved.getStatus())) {
            notificationService.notifyAnnouncementPublished(saved.getId(), saved.getTitle());
        }

        return AnnouncementMapper.toDto(saved);
    }

    @Override
    public AnnouncementDto update(UUID id, AnnouncementDto dto, User currentUser) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Announcement not found: " + id));

        // Enforce ownership: Only owner or ADMIN can update
        User managedUser = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new NotFoundException("User not found: " + currentUser.getId()));

        boolean isAdmin = managedUser.getRoles().stream()
                .anyMatch(role -> "ADMIN".equals(role.getRole().name()));

        if (!isAdmin
                && (announcement.getUser() == null || !announcement.getUser().getId().equals(currentUser.getId()))) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "You are not authorized to update this announcement");
        }

        String oldStatus = announcement.getStatus();

        announcement.setTitle(dto.getTitle());
        announcement.setContent(dto.getContent());
        announcement.setStatus(dto.getStatus());
        announcement.setSummary(dto.getSummary());
        announcement.setImageUrl(dto.getImageUrl());
        announcement.setCategory(dto.getCategory());
        announcement.setIsFeatured(dto.getIsFeatured());
        announcement.setPriority(dto.getPriority());
        announcement.setTargetAudience(dto.getTargetAudience());

        // When status transitions to PUBLISHED, update publishedAt to now
        if ("PUBLISHED".equalsIgnoreCase(dto.getStatus())
                && !"PUBLISHED".equalsIgnoreCase(oldStatus)) {
            announcement.setPublishedAt(java.time.ZonedDateTime.now());
            notificationService.notifyAnnouncementPublished(announcement.getId(), announcement.getTitle());
        }

        return AnnouncementMapper.toDto(announcement);
    }

    @Override
    public void delete(UUID id, User currentUser) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Announcement not found: " + id));

        if (currentUser == null) {
            throw new org.springframework.security.access.AccessDeniedException("User not authenticated");
        }

        boolean isAdmin = false;
        try {
            // Re-fetch user to ensuring we have an active session for lazy loading roles
            User managedUser = userRepository.findById(currentUser.getId()).orElse(currentUser);
            if (managedUser.getRoles() != null) {
                // Initialize roles if needed (accessing size triggers initialization if
                // attached)
                managedUser.getRoles().isEmpty();
                isAdmin = managedUser.getRoles().stream()
                        .anyMatch(role -> "ADMIN".equals(role.getRole().name()));
            }
        } catch (Exception e) {
            // If fetching/checking fails, assume not admin.
            isAdmin = false;
        }

        if (!isAdmin
                && (announcement.getUser() == null || !announcement.getUser().getId().equals(currentUser.getId()))) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "You are not authorized to delete this announcement");
        }

        var views = announcementViewRepository.findAllByAnnouncement(announcement);
        announcementViewRepository.deleteAll(views);
        announcementRepository.delete(announcement);
    }

    @Override
    public void markView(UUID announcementId, UUID userId) {
        Announcement announcement = announcementRepository.findById(announcementId)
                .orElseThrow(() -> new NotFoundException("Announcement not found: " + announcementId));
        User user = getUser(userId);

        boolean exists = announcementViewRepository.findByAnnouncementAndUser(announcement, user).isPresent();
        if (!exists) {
            AnnouncementView view = AnnouncementView.builder()
                    .announcement(announcement)
                    .user(user)
                    .build();
            announcementViewRepository.save(view);
        }
    }

    private User getUser(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found: " + id));
    }
}
