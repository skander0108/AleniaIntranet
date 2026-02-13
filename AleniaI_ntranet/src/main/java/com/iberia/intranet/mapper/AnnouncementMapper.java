package com.iberia.intranet.mapper;

import com.iberia.intranet.dto.AnnouncementDto;
import com.iberia.intranet.entity.Announcement;
import com.iberia.intranet.entity.User;

public final class AnnouncementMapper {

    private AnnouncementMapper() {
    }

    public static AnnouncementDto toDto(Announcement announcement) {
        return AnnouncementDto.builder()
                .id(announcement.getId())
                .title(announcement.getTitle())
                .content(announcement.getContent())
                .publishedAt(announcement.getPublishedAt().toOffsetDateTime())
                .status(announcement.getStatus())
                .publisherId(announcement.getUser() != null ? announcement.getUser().getId() : null)
                .summary(announcement.getSummary())
                .imageUrl(announcement.getImageUrl())
                .category(announcement.getCategory())
                .isFeatured(announcement.getIsFeatured())
                .priority(announcement.getPriority())
                .targetAudience(announcement.getTargetAudience())
                .build();
    }

    public static Announcement toEntity(AnnouncementDto dto, User publisher) {
        return Announcement.builder()
                .id(dto.getId())
                .title(dto.getTitle())
                .content(dto.getContent())
                .status(dto.getStatus())
                .user(publisher)
                .publishedAt(dto.getPublishedAt() != null ? dto.getPublishedAt().toZonedDateTime()
                        : java.time.ZonedDateTime.now())
                .summary(dto.getSummary())
                .imageUrl(dto.getImageUrl())
                .category(dto.getCategory())
                .isFeatured(dto.getIsFeatured())
                .priority(dto.getPriority())
                .targetAudience(dto.getTargetAudience())
                .build();
    }
}
