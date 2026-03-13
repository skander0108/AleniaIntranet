package com.iberia.intranet.controller;

import com.iberia.intranet.dto.CreateEventRequest;
import com.iberia.intranet.dto.EventDto;
import com.iberia.intranet.entity.Event;
import com.iberia.intranet.entity.User;
import com.iberia.intranet.repository.UserRepository;
import com.iberia.intranet.security.UserDetailsImpl;
import com.iberia.intranet.service.EventRegistrationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
@Tag(name = "Events", description = "Event management endpoints")
public class EventController {

    private final com.iberia.intranet.service.EventService eventService; // Use service instead of repository
    private final EventRegistrationService eventRegistrationService;
    // private final NotificationService notificationService; // Moved to Service
    private final UserRepository userRepository;

    private User getUser(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            return null;
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    @Operation(summary = "Get all events")
    public List<Event> getAllEvents() {
        return eventService.getAllEvents();
    }

    @GetMapping("/my")
    @Operation(summary = "Get my events (Manager/HR)")
    public List<Event> getMyEvents(Authentication authentication) {
        User user = getUser(authentication);
        if (user == null) {
            throw new RuntimeException("User not authenticated");
        }
        return eventService.getMyEvents(user);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new event")
    public Event createEvent(@RequestBody CreateEventRequest request, Authentication authentication) {
        User user = getUser(authentication);
        if (user == null) {
            throw new RuntimeException("User not authenticated");
        }
        return eventService.createEvent(request, user);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete an event by ID")
    public void deleteEvent(@PathVariable(value = "id") UUID id, Authentication authentication) {
        User user = getUser(authentication);
        if (user == null) {
            throw new RuntimeException("User not authenticated");
        }
        eventService.deleteEvent(id, user);
    }

    // Event Registration Endpoints
    @PostMapping("/{id}/register")
    @Operation(summary = "Register current user for an event")
    public ResponseEntity<Void> registerForEvent(@PathVariable(value = "id") UUID id, Authentication authentication) {
        User user = getUser(authentication);
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        eventRegistrationService.registerUserForEvent(id, user);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/register")
    @Operation(summary = "Unregister current user from an event")
    public ResponseEntity<Void> unregisterFromEvent(@PathVariable(value = "id") UUID id,
            Authentication authentication) {
        User user = getUser(authentication);
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        eventRegistrationService.unregisterUserFromEvent(id, user);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me/registered")
    @Operation(summary = "Get events the current user is registered for")
    public ResponseEntity<List<EventDto>> getMyRegisteredEvents(Authentication authentication) {
        User user = getUser(authentication);
        if (user == null) {
            // Return empty list for unauthenticated users during testing
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(eventRegistrationService.getUserRegisteredEvents(user));
    }

    @GetMapping("/{id}/is-registered")
    @Operation(summary = "Check if current user is registered for an event")
    public ResponseEntity<Boolean> isRegistered(@PathVariable(value = "id") UUID id, Authentication authentication) {
        User user = getUser(authentication);
        return ResponseEntity.ok(eventRegistrationService.isUserRegistered(id, user));
    }
}
