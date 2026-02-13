package com.iberia.intranet.mapper;

import com.iberia.intranet.dto.QuickLinkDto;
import com.iberia.intranet.entity.QuickLink;
import com.iberia.intranet.entity.User;

public final class QuickLinkMapper {

    private QuickLinkMapper() {
    }

    public static QuickLinkDto toDto(QuickLink quickLink) {
        return QuickLinkDto.builder()
                .id(quickLink.getId())
                .label(quickLink.getLabel())
                .url(quickLink.getUrl())
                .isActive(quickLink.isActive())
                .userId(quickLink.getUser() != null ? quickLink.getUser().getId() : null)
                .description(quickLink.getDescription())
                .icon(quickLink.getIcon())
                .build();
    }

    public static QuickLink toEntity(QuickLinkDto dto, User user) {
        return QuickLink.builder()
                .id(dto.getId())
                .label(dto.getLabel())
                .url(dto.getUrl())
                .isActive(dto.getIsActive())
                .user(user)
                .description(dto.getDescription())
                .icon(dto.getIcon())
                .build();
    }
}
