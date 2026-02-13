package com.iberia.intranet.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItSupportMetricsDto {
    private long totalTickets;
    private long openTickets;
    private long resolvedTickets;
    private double avgResolutionTimeHours;
    private Map<String, Long> ticketsByCategory;
    private Map<String, Long> ticketsByPriority;
}
