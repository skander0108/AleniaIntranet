package com.iberia.intranet.mapper;

import com.iberia.intranet.dto.ToolAccessDto;
import com.iberia.intranet.entity.Tool;
import com.iberia.intranet.entity.ToolAccess;
import com.iberia.intranet.entity.User;

public final class ToolAccessMapper {

    private ToolAccessMapper() {
    }

    public static ToolAccessDto toDto(ToolAccess access) {
        return ToolAccessDto.builder()
                .id(access.getId())
                .allowed(access.getAllowed())
                .userId(access.getUser().getId())
                .toolId(access.getTool().getId())
                .build();
    }

    public static ToolAccess toEntity(ToolAccessDto dto, User user, Tool tool) {
        return ToolAccess.builder()
                .id(dto.getId())
                .allowed(dto.getAllowed())
                .user(user)
                .tool(tool)
                .build();
    }
}

