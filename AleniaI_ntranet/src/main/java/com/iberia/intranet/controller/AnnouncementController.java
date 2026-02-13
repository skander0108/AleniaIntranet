package com.iberia.intranet.controller;

import com.iberia.intranet.dto.AnnouncementDto;
import com.iberia.intranet.service.AnnouncementService;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/announcements")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementService announcementService;
    private final com.iberia.intranet.repository.UserRepository userRepository;

    private com.iberia.intranet.entity.User getUser(org.springframework.security.core.Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new RuntimeException("User not authenticated");
        }
        com.iberia.intranet.security.UserDetailsImpl userDetails = (com.iberia.intranet.security.UserDetailsImpl) authentication
                .getPrincipal();
        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public Page<AnnouncementDto> list(@ParameterObject Pageable pageable) {
        return announcementService.list(pageable);
    }

    @GetMapping("/published")
    public Page<AnnouncementDto> listPublished(@ParameterObject Pageable pageable) {
        return announcementService.listPublished(pageable);
    }

    @GetMapping("/my")
    public Page<AnnouncementDto> listMyAnnouncements(@ParameterObject Pageable pageable,
            org.springframework.security.core.Authentication authentication) {
        return announcementService.listByPublisher(getUser(authentication), pageable);
    }

    @GetMapping("/{id}")
    public AnnouncementDto get(@PathVariable("id") UUID id) {
        return announcementService.get(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AnnouncementDto create(@Valid @RequestBody AnnouncementDto dto,
            org.springframework.security.core.Authentication authentication) {
        return announcementService.create(dto, getUser(authentication));
    }

    @PutMapping("/{id}")
    public AnnouncementDto update(@PathVariable("id") UUID id, @Valid @RequestBody AnnouncementDto dto,
            org.springframework.security.core.Authentication authentication) {
        return announcementService.update(id, dto, getUser(authentication));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable("id") UUID id, org.springframework.security.core.Authentication authentication) {
        announcementService.delete(id, getUser(authentication));
    }

    @PostMapping("/{id}/view")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markView(@PathVariable("id") UUID id, @RequestParam("userId") UUID userId) {
        announcementService.markView(id, userId);
    }
}
