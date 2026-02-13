package com.iberia.intranet.service;

import com.iberia.intranet.dto.EventDto;
import com.iberia.intranet.entity.User;

import java.util.List;
import java.util.UUID;

public interface EventRegistrationService {

    void registerUserForEvent(UUID eventId, User user);

    void unregisterUserFromEvent(UUID eventId, User user);

    List<EventDto> getUserRegisteredEvents(User user);

    boolean isUserRegistered(UUID eventId, User user);

    int getRegistrationCount(UUID eventId);
}
