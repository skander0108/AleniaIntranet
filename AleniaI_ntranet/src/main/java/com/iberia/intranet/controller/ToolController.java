package com.iberia.intranet.controller;

import com.iberia.intranet.dto.ToolDto;
import com.iberia.intranet.service.ToolService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/tools")
@RequiredArgsConstructor
public class ToolController {

    private final ToolService toolService;

    @GetMapping
    public Page<ToolDto> list(@ParameterObject Pageable pageable) {
        return toolService.list(pageable);
    }

    @GetMapping("/{id}")
    public ToolDto get(@PathVariable("id") UUID id) {
        return toolService.get(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ToolDto create(@Valid @RequestBody ToolDto dto) {
        return toolService.create(dto);
    }

    @PutMapping("/{id}")
    public ToolDto update(@PathVariable("id") UUID id, @Valid @RequestBody ToolDto dto) {
        return toolService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable("id") UUID id) {
        toolService.delete(id);
    }
}
