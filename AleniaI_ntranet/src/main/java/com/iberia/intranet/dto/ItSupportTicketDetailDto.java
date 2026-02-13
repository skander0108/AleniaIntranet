package com.iberia.intranet.dto;

import com.iberia.intranet.entity.TicketCategory;
import com.iberia.intranet.entity.TicketPriority;
import com.iberia.intranet.entity.TicketStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItSupportTicketDetailDto {

    private UUID id;
    private String ticketNumber;
    private String title;
    private TicketCategory category;
    private TicketPriority priority;
    private TicketStatus status;
    private String description;
    private String preferredContact;
    private UUID requesterId;
    private String requesterName;
    private UUID assignedToId;
    private String assignedToName;
    private List<ItSupportCommentDto> comments;
    private List<ItSupportAttachmentDto> attachments;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
    private String updatedByName;
}
