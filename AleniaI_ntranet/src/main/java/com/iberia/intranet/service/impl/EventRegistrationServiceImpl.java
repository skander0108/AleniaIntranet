package com.iberia.intranet.service.impl;

import com.iberia.intranet.dto.EventDto;
import com.iberia.intranet.entity.Event;
import com.iberia.intranet.entity.EventRegistration;
import com.iberia.intranet.entity.User;
import com.iberia.intranet.mapper.EventMapper;
import com.iberia.intranet.repository.EventRegistrationRepository;
import com.iberia.intranet.repository.EventRepository;
import com.iberia.intranet.service.EventRegistrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EventRegistrationServiceImpl implements EventRegistrationService {

    private final EventRegistrationRepository eventRegistrationRepository;
    private final EventRepository eventRepository;

    @Override
    @Transactional
    public void registerUserForEvent(UUID eventId, User user) {
        if (user == null) {
            throw new RuntimeException("User must be authenticated");
        }

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        // Check if already registered
        if (eventRegistrationRepository.existsByUserIdAndEventId(user.getId(), eventId)) {
            throw new RuntimeException("User already registered for this event");
        }

        EventRegistration registration = EventRegistration.builder()
                .user(user)
                .event(event)
                .build();

        eventRegistrationRepository.save(registration);
    }

    @Override
    @Transactional
    public void unregisterUserFromEvent(UUID eventId, User user) {
        if (user == null) {
            throw new RuntimeException("User must be authenticated");
        }

        eventRegistrationRepository.deleteByUserIdAndEventId(user.getId(), eventId);
    }

    @Override
    public List<EventDto> getUserRegisteredEvents(User user) {
        if (user == null) {
            throw new RuntimeException("User must be authenticated");
        }

        List<EventRegistration> registrations = eventRegistrationRepository.findByUserId(user.getId());

        return registrations.stream()
                .map(EventRegistration::getEvent)
                .map(EventMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public boolean isUserRegistered(UUID eventId, User user) {
        if (user == null) {
            return false;
        }
        return eventRegistrationRepository.existsByUserIdAndEventId(user.getId(), eventId);
    }

    @Override
    public int getRegistrationCount(UUID eventId) {
        return eventRegistrationRepository.findByEventId(eventId).size();
    }
}
