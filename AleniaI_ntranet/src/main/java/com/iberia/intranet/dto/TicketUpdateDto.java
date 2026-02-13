package com.iberia.intranet.dto;

import com.iberia.intranet.entity.TicketStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketUpdateDto {

    private TicketStatus status;
    private UUID assignedToId;
}
