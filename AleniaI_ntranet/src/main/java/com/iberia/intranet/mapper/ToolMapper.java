package com.iberia.intranet.mapper;

import com.iberia.intranet.dto.ToolDto;
import com.iberia.intranet.entity.Tool;

public final class ToolMapper {

    private ToolMapper() {
    }

    public static ToolDto toDto(Tool tool) {
        return ToolDto.builder()
                .id(tool.getId())
                .name(tool.getName())
                .url(tool.getUrl())
                .icon(tool.getIcon())
                .colorTheme(tool.getColorTheme())
                .description(tool.getDescription())
                .build();
    }

    public static Tool toEntity(ToolDto dto) {
        return Tool.builder()
                .id(dto.getId())
                .name(dto.getName())
                .url(dto.getUrl())
                .icon(dto.getIcon())
                .colorTheme(dto.getColorTheme())
                .description(dto.getDescription())
                .build();
    }
}
