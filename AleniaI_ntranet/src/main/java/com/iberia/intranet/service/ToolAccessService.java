package com.iberia.intranet.service;

import com.iberia.intranet.dto.ToolAccessDto;

import java.util.List;
import java.util.UUID;

public interface ToolAccessService {

    List<ToolAccessDto> listByUser(UUID userId);

    ToolAccessDto grantAccess(UUID userId, UUID toolId);

    ToolAccessDto revokeAccess(UUID userId, UUID toolId);
}

