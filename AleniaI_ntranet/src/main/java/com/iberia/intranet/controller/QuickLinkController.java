package com.iberia.intranet.controller;

import com.iberia.intranet.dto.QuickLinkDto;
import com.iberia.intranet.service.QuickLinkService;
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
@RequestMapping("/api/quick-links")
@RequiredArgsConstructor
public class QuickLinkController {

    private final QuickLinkService quickLinkService;

    @GetMapping
    public Page<QuickLinkDto> list(@ParameterObject Pageable pageable) {
        return quickLinkService.list(pageable);
    }

    @GetMapping("/{id}")
    public QuickLinkDto get(@PathVariable("id") UUID id) {
        return quickLinkService.get(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public QuickLinkDto create(@Valid @RequestBody QuickLinkDto dto) {
        return quickLinkService.create(dto);
    }

    @PutMapping("/{id}")
    public QuickLinkDto update(@PathVariable("id") UUID id, @Valid @RequestBody QuickLinkDto dto) {
        return quickLinkService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable("id") UUID id) {
        quickLinkService.delete(id);
    }
}
