package com.iberia.intranet.service.impl;

import com.iberia.intranet.dto.*;
import com.iberia.intranet.entity.*;
import com.iberia.intranet.mapper.ItSupportAuditLogMapper;
import com.iberia.intranet.mapper.ItSupportCommentMapper;
import com.iberia.intranet.mapper.ItSupportTicketMapper;
import com.iberia.intranet.repository.ItSupportAuditLogRepository;
import com.iberia.intranet.repository.ItSupportCommentRepository;
import com.iberia.intranet.repository.ItSupportTicketRepository;
import com.iberia.intranet.repository.UserRepository;
import com.iberia.intranet.service.AdminItSupportService;
import com.iberia.intranet.service.DocumentService;
import com.iberia.intranet.service.NotificationService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminItSupportServiceImpl implements AdminItSupportService {

    private final ItSupportTicketRepository ticketRepository;
    private final ItSupportCommentRepository commentRepository;
    private final UserRepository userRepository;
    private final ItSupportAuditLogRepository auditLogRepository;
    private final com.iberia.intranet.repository.KnowledgeCategoryRepository knowledgeCategoryRepository;
    private final com.iberia.intranet.repository.KnowledgeDocumentRepository knowledgeDocumentRepository;
    private final DocumentService documentService;

    private final ItSupportTicketMapper ticketMapper;
    private final ItSupportCommentMapper commentMapper;
    private final ItSupportAuditLogMapper auditLogMapper;

    private final NotificationService notificationService;

    @Override
    @Transactional
    public Page<ItSupportTicketDto> getAllTickets(
            TicketStatus status,
            TicketPriority priority,
            TicketCategory category,
            String searchKeyword,
            Pageable pageable) {

        String searchPattern = null;
        if (searchKeyword != null && !searchKeyword.trim().isEmpty()) {
            searchPattern = "%" + searchKeyword.trim().toLowerCase() + "%";
        }

        Page<ItSupportTicket> tickets = ticketRepository.findByFilters(
                status, priority, category, searchPattern, pageable);

        return tickets.map(ticketMapper::toDto);
    }

    @Override
    @Transactional
    public ItSupportTicketDetailDto getTicketDetail(UUID ticketId) {
        ItSupportTicket ticket = ticketRepository.findByIdWithDetails(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + ticketId));
        return ticketMapper.toDetailDto(ticket);
    }

    @Override
    @Transactional
    public ItSupportTicketDetailDto updateTicket(UUID ticketId, TicketUpdateDto dto, User admin) {
        ItSupportTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + ticketId));

        TicketStatus oldStatus = ticket.getStatus();
        TicketStatus newStatus = dto.getStatus();

        User oldAssignee = ticket.getAssignedTo();
        User newAssignee = null;

        // Update ticket fields
        if (dto.getStatus() != null && oldStatus != newStatus) {
            ticket.setStatus(dto.getStatus());
            logAudit(ticket, "STATUS_CHANGE", admin, oldStatus.name(), newStatus.name());
        }

        if (dto.getAssignedToId() != null) {
            newAssignee = userRepository.findById(dto.getAssignedToId())
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + dto.getAssignedToId()));

            if (oldAssignee == null || !oldAssignee.getId().equals(newAssignee.getId())) {
                ticket.setAssignedTo(newAssignee);
                logAudit(ticket, "ASSIGNMENT", admin,
                        oldAssignee != null ? oldAssignee.getFullName() : "Unassigned",
                        newAssignee.getFullName());
            }
        }

        ticket.setUpdatedBy(admin);
        ItSupportTicket updatedTicket = ticketRepository.save(ticket);

        // Trigger notifications
        if (newStatus != null && oldStatus != newStatus) {
            notifyTicketUpdated(updatedTicket, newStatus);
        }
        if (newAssignee != null && (oldAssignee == null || !oldAssignee.getId().equals(newAssignee.getId()))) {
            notifyTicketAssigned(updatedTicket, admin);
        }

        return ticketMapper.toDetailDto(updatedTicket);
    }

    @Override
    @Transactional
    public ItSupportCommentDto addAdminComment(UUID ticketId, String message, User admin) {
        ItSupportTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + ticketId));

        ItSupportComment comment = ItSupportComment.builder()
                .ticket(ticket)
                .author(admin)
                .message(message)
                .createdAt(java.time.ZonedDateTime.now())
                .build();

        ItSupportComment savedComment = commentRepository.save(comment);

        logAudit(ticket, "COMMENT_ADDED", admin, null, "Comment added by admin");

        notifyCommentAdded(ticket);

        return commentMapper.toDto(savedComment);
    }

    @Override
    public List<ItSupportAuditLogDto> getTicketAuditLog(UUID ticketId) {
        return auditLogRepository.findByTicketIdOrderByTimestampDesc(ticketId).stream()
                .map(auditLogMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void convertToKb(UUID ticketId, User admin) {
        ItSupportTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + ticketId));

        if (ticket.getStatus() != TicketStatus.RESOLVED && ticket.getStatus() != TicketStatus.CLOSED) {
            throw new RuntimeException("Only resolved or closed tickets can be converted to KB");
        }

        // Find or create 'IT Support' category
        KnowledgeCategory category = knowledgeCategoryRepository.findByName("IT Support")
                .orElseGet(() -> knowledgeCategoryRepository.save(
                        KnowledgeCategory.builder().name("IT Support").build()));

        // Build content with structured Markdown
        StringBuilder contentBuilder = new StringBuilder();

        // 1. Issue Description
        contentBuilder.append("# Issue Description\n\n");
        contentBuilder.append(ticket.getDescription()).append("\n\n");

        // 2. Environment / Context (Placeholder)
        contentBuilder.append("# Environment / Context\n\n");
        contentBuilder.append("- Application: Alenia Intranet\n");
        contentBuilder.append("- Category: ").append(ticket.getCategory()).append("\n\n");

        // 3. Root Cause (Placeholder)
        contentBuilder.append("# Root Cause\n\n");
        contentBuilder.append("*(Pending analysis)*\n\n");

        // 4. Resolution Steps
        contentBuilder.append("# Resolution Steps\n\n");
        List<ItSupportComment> comments = commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId);
        if (!comments.isEmpty()) {
            for (ItSupportComment comment : comments) {
                // We'll treat admin comments as potential resolution steps for now
                contentBuilder.append("**").append(comment.getAuthor().getFullName())
                        .append("**: used the following steps:\n");
                contentBuilder.append(comment.getMessage()).append("\n\n");
            }
        } else {
            contentBuilder.append("*(No resolution steps recorded in comments)*\n\n");
        }

        // 5. Verification
        contentBuilder.append("# Verification\n\n");
        contentBuilder.append("Confirm with the user that the issue is resolved.\n\n");

        // 6. Prevention
        contentBuilder.append("# Prevention / Best Practices\n\n");
        contentBuilder.append("- Ensure regular updates.\n");
        contentBuilder.append("- Review related documentation.\n\n");

        KnowledgeDocument document = KnowledgeDocument.builder()
                .title(ticket.getTitle())
                .summary("Resolved Ticket: " + ticket.getTicketNumber())
                .content(contentBuilder.toString())
                .category(category)
                .creator(admin)
                .fileUrl(null)
                .viewCount(0)
                .helpfulCount(0)
                .createdAt(ticket.getCreatedAt().toOffsetDateTime())
                .updatedAt(ZonedDateTime.now().toOffsetDateTime())
                .build();

        knowledgeDocumentRepository.save(document);

        // Also create a downloadable PDF Document for the Knowledge Base module
        documentService.createPdfDocumentFromText(
                "KB - " + ticket.getTitle(),
                contentBuilder.toString(),
                "Knowledge Base",
                "ALL",
                "IT");
        logAudit(ticket, "CONVERTED_TO_KB", admin, null, "Ticket converted to Knowledge Base article");
    }

    @Override
    public ItSupportMetricsDto getMetrics() {
        long total = ticketRepository.count();
        long open = ticketRepository.countByStatus(TicketStatus.OPEN);
        long resolved = ticketRepository.countByStatus(TicketStatus.RESOLVED);

        return ItSupportMetricsDto.builder()
                .totalTickets(total)
                .openTickets(open)
                .resolvedTickets(resolved)
                .avgResolutionTimeHours(0)
                .build();
    }

    private void logAudit(ItSupportTicket ticket, String action, User user, String oldValue, String newValue) {
        ItSupportAuditLog log = ItSupportAuditLog.builder()
                .ticket(ticket)
                .action(action)
                .changedBy(user)
                .oldValue(oldValue)
                .newValue(newValue)
                .build();
        auditLogRepository.save(log);
    }

    private void notifyTicketUpdated(ItSupportTicket ticket, TicketStatus newStatus) {
        String title = "IT Support Ticket Updated";
        String message = String.format("Ticket %s status changed to %s",
                ticket.getTicketNumber(), newStatus.name());
        String linkUrl = "/it-support/my/" + ticket.getId();

        notificationService.createNotification(
                NotificationType.IT_TICKET_UPDATED,
                title,
                message,
                ticket.getId(),
                linkUrl,
                "USER",
                ticket.getRequester().getId().toString());
    }

    private void notifyTicketAssigned(ItSupportTicket ticket, User admin) {
        // Notify other admins? Or just log?
        // Implementation detail, can act as placeholder
    }

    private void notifyCommentAdded(ItSupportTicket ticket) {
        String title = "New Response on Your IT Support Ticket";
        String message = String.format("An IT admin responded to ticket %s", ticket.getTicketNumber());
        String linkUrl = "/it-support/my/" + ticket.getId();

        notificationService.createNotification(
                NotificationType.IT_TICKET_UPDATED,
                title,
                message,
                ticket.getId(),
                linkUrl,
                "USER",
                ticket.getRequester().getId().toString());
    }
}
