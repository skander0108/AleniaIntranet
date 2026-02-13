package com.iberia.intranet.controller;

import com.iberia.intranet.dto.ToolAccessDto;
import com.iberia.intranet.service.ToolAccessService;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tool-access")
@RequiredArgsConstructor
public class ToolAccessController {

    private final ToolAccessService toolAccessService;

    @GetMapping
    public List<ToolAccessDto> listByUser(@RequestParam("userId") @NotNull UUID userId) {
        return toolAccessService.listByUser(userId);
    }

    @PostMapping("/grant")
    @ResponseStatus(HttpStatus.CREATED)
    public ToolAccessDto grant(@RequestParam("userId") UUID userId,
                               @RequestParam("toolId") UUID toolId) {
        return toolAccessService.grantAccess(userId, toolId);
    }

    @PostMapping("/revoke")
    public ToolAccessDto revoke(@RequestParam("userId") UUID userId,
                                @RequestParam("toolId") UUID toolId) {
        return toolAccessService.revokeAccess(userId, toolId);
    }
}

