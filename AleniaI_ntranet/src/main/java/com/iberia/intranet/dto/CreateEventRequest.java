package com.iberia.intranet.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class CreateEventRequest {
    private String title;
    private LocalDate eventDate;
    private LocalTime eventTime;
    private String location;
    private String description;
    private String imageUrl;
}
