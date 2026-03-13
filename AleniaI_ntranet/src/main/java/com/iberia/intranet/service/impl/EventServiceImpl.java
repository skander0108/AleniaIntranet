package com.iberia.intranet.service.impl;

import com.iberia.intranet.dto.CreateEventRequest;
import com.iberia.intranet.entity.Event;
import com.iberia.intranet.entity.User;
import com.iberia.intranet.repository.EventRepository;
import com.iberia.intranet.service.EventService;
import com.iberia.intranet.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;
    private final com.iberia.intranet.repository.EventRegistrationRepository eventRegistrationRepository;
    private final NotificationService notificationService;
    private final com.iberia.intranet.repository.UserRepository userRepository;

    @Override
    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    @Override
    public List<Event> getMyEvents(User user) {
        return eventRepository.findByUser(user);
    }

    @Override
    @Transactional
    public Event createEvent(CreateEventRequest request, User currentUser) {
        Event event = Event.builder()
                .id(UUID.randomUUID())
                .title(request.getTitle())
                .description(request.getDescription())
                .eventDate(request.getEventDate())
                .eventTime(request.getEventTime())
                .location(request.getLocation())
                .imageUrl(request.getImageUrl())
                .user(currentUser)
                .build();

        Event saved = eventRepository.save(event);

        // Create notification when event is created
        notificationService.notifyEventCreated(saved.getId(), saved.getTitle(),
                saved.getEventDate().atTime(saved.getEventTime()));

        return saved;
    }

    @Override
    @Transactional
    public void deleteEvent(UUID id, User currentUser) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        // Enforce ownership
        if (currentUser == null) {
            throw new org.springframework.security.access.AccessDeniedException("User not authenticated");
        }

        boolean isHR = false;
        try {
            // Re-fetch user to ensuring we have an active session for lazy loading roles
            User managedUser = userRepository.findById(currentUser.getId()).orElse(currentUser);
            if (managedUser.getRoles() != null) {
                // Initialize roles if needed (accessing size triggers initialization if
                // attached)
                managedUser.getRoles().isEmpty();
                isHR = managedUser.getRoles().stream()
                        .anyMatch(role -> "HR".equals(role.getRole().name()));
            }
        } catch (Exception e) {
            // If fetching/checking fails, assume not HR.
            isHR = false;
        }

        if (!isHR && (event.getUser() == null || !event.getUser().getId().equals(currentUser.getId()))) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "You are not authorized to delete this event");
        }

        var registrations = eventRegistrationRepository.findAllByEvent(event);
        eventRegistrationRepository.deleteAll(registrations);
        eventRepository.delete(event);
    }
}
