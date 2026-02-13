package com.iberia.intranet.service;

import com.iberia.intranet.dto.CreateEventRequest;
import com.iberia.intranet.entity.Event;
import com.iberia.intranet.entity.User;
import java.util.List;
import java.util.UUID;

public interface EventService {
    List<Event> getAllEvents();

    List<Event> getMyEvents(User user);

    Event createEvent(CreateEventRequest request, User currentUser);

    void deleteEvent(UUID id, User currentUser);
}
