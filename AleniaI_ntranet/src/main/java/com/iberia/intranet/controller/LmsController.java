package com.iberia.intranet.controller;

import com.iberia.intranet.dto.LmsProgressDto;
import com.iberia.intranet.dto.LmsSyncLogDto;
import com.iberia.intranet.dto.LmsUserCourseProgressDto;
import com.iberia.intranet.entity.User;
import com.iberia.intranet.repository.UserRepository;
import com.iberia.intranet.service.LmsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lms")
@RequiredArgsConstructor
@Tag(name = "LMS Tracking", description = "iSpring Learn progress tracking")
public class LmsController {

    private final LmsService lmsService;
    private final UserRepository userRepository;

    @GetMapping("/my-progress")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get my learning progress")
    public ResponseEntity<List<LmsProgressDto>> getMyProgress(Authentication authentication) {
        User user = getUser(authentication);
        return ResponseEntity.ok(lmsService.getMyProgress(user));
    }

    @GetMapping("/global-progress")
    @PreAuthorize("hasAnyRole('HR')")
    @Operation(summary = "Get global progress (Manager & HR)")
    public ResponseEntity<List<LmsProgressDto>> getGlobalProgress() {
        return ResponseEntity.ok(lmsService.getGlobalProgress());
    }

    @PostMapping("/sync")
    @PreAuthorize("hasRole('HR')")
    @Operation(summary = "Trigger LMS sync from iSpring (HR only)")
    public ResponseEntity<LmsSyncLogDto> triggerSync() {
        return ResponseEntity.ok(lmsService.triggerSync());
    }

    @GetMapping("/sync/logs")
    @PreAuthorize("hasRole('HR')")
    @Operation(summary = "Get sync logs (HR only)")
    public ResponseEntity<List<LmsSyncLogDto>> getSyncLogs() {
        return ResponseEntity.ok(lmsService.getSyncLogs());
    }

    @GetMapping("/users-progress")
    @PreAuthorize("hasAnyRole('HR')")
    @Operation(summary = "Get paginated users progress with fast cache (Manager & HR)")
    public ResponseEntity<Page<LmsUserCourseProgressDto>> getPaginatedUsersProgress(
            Pageable pageable,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(lmsService.getPaginatedUsersProgress(pageable, search));
    }

    private User getUser(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
    }
}
