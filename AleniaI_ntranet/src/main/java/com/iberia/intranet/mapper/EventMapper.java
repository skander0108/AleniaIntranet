package com.iberia.intranet.mapper;

import com.iberia.intranet.dto.EventDto;
import com.iberia.intranet.entity.Event;

public class EventMapper {

    private EventMapper() {
    }

    public static EventDto toDto(Event event) {
        return EventDto.builder()
                .id(event.getId())
                .title(event.getTitle())
                .eventDate(event.getEventDate())
                .eventTime(event.getEventTime())
                .location(event.getLocation())
                .description(event.getDescription())
                .imageUrl(event.getImageUrl())
                .isRegistered(false) // Default, will be set by service if needed
                .registrationCount(0) // Default, will be set by service if needed
                .build();
    }

    public static Event toEntity(EventDto dto) {
        return Event.builder()
                .id(dto.getId())
                .title(dto.getTitle())
                .eventDate(dto.getEventDate())
                .eventTime(dto.getEventTime())
                .location(dto.getLocation())
                .description(dto.getDescription())
                .imageUrl(dto.getImageUrl())
                .build();
    }
}
