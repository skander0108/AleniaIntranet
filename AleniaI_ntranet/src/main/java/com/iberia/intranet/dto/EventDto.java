package com.iberia.intranet.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventDto {
    private UUID id;
    private String title;
    private LocalDate eventDate;
    private LocalTime eventTime;
    private String location;
    private String description;
    private String imageUrl;
    private boolean isRegistered; // Whether current user is registered
    private int registrationCount; // Number of registrations
}
