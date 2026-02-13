package com.iberia.intranet.service;

import com.iberia.intranet.dto.ItSupportCommentDto;
import com.iberia.intranet.dto.ItSupportTicketCreateDto;
import com.iberia.intranet.dto.ItSupportTicketDetailDto;
import com.iberia.intranet.dto.ItSupportTicketDto;
import com.iberia.intranet.entity.User;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

public interface ItSupportService {

    /**
     * Create a new IT support ticket
     */
    ItSupportTicketDto createTicket(ItSupportTicketCreateDto dto, MultipartFile file, User requester);

    /**
     * Get all tickets created by the requester
     */
    Page<ItSupportTicketDto> getMyTickets(User requester, Pageable pageable);

    /**
     * Get detailed information about a ticket
     * User must be the requester or have admin role
     */
    ItSupportTicketDetailDto getTicketDetail(UUID ticketId, User user);

    /**
     * Add a comment to a ticket
     */
    ItSupportCommentDto addComment(UUID ticketId, String message, User author);

    /**
     * Close a ticket (only if status is RESOLVED and user is requester)
     */
    void closeTicket(UUID ticketId, User requester);

    /**
     * Download an attachment
     */
    Resource downloadAttachment(UUID ticketId, UUID attachmentId, User user);
}
