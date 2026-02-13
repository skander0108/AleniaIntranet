package com.iberia.intranet.service;

import com.iberia.intranet.dto.ItSupportCommentDto;
import com.iberia.intranet.dto.ItSupportTicketDetailDto;
import com.iberia.intranet.dto.ItSupportTicketDto;
import com.iberia.intranet.dto.TicketUpdateDto;
import com.iberia.intranet.entity.TicketCategory;
import com.iberia.intranet.entity.TicketPriority;
import com.iberia.intranet.entity.TicketStatus;
import com.iberia.intranet.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface AdminItSupportService {

    /**
     * Get all tickets with optional filters
     */
    Page<ItSupportTicketDto> getAllTickets(
            TicketStatus status,
            TicketPriority priority,
            TicketCategory category,
            String searchKeyword,
            Pageable pageable);

    /**
     * Get detailed ticket information (admin view)
     */
    ItSupportTicketDetailDto getTicketDetail(UUID ticketId);

    /**
     * Update ticket (status, assignment)
     */
    ItSupportTicketDetailDto updateTicket(UUID ticketId, TicketUpdateDto dto, User admin);

    /**
     * Add admin comment to a ticket
     */
    ItSupportCommentDto addAdminComment(UUID ticketId, String message, User admin);

    /**
     * Get audit log for a ticket
     */
    java.util.List<com.iberia.intranet.dto.ItSupportAuditLogDto> getTicketAuditLog(UUID ticketId);

    /**
     * Convert a resolved ticket to a knowledge base article
     */
    void convertToKb(UUID ticketId, User admin);

    /**
     * Get IT Support metrics
     */
    com.iberia.intranet.dto.ItSupportMetricsDto getMetrics();
}
