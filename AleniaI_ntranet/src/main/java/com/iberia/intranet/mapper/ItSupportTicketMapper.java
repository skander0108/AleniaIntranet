package com.iberia.intranet.mapper;

import com.iberia.intranet.dto.ItSupportTicketDto;
import com.iberia.intranet.dto.ItSupportTicketDetailDto;
import com.iberia.intranet.entity.ItSupportTicket;
import com.iberia.intranet.entity.User;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class ItSupportTicketMapper {

    private final ItSupportCommentMapper commentMapper;
    private final ItSupportAttachmentMapper attachmentMapper;

    public ItSupportTicketMapper(ItSupportCommentMapper commentMapper, ItSupportAttachmentMapper attachmentMapper) {
        this.commentMapper = commentMapper;
        this.attachmentMapper = attachmentMapper;
    }

    public ItSupportTicketDto toDto(ItSupportTicket entity) {
        if (entity == null) {
            return null;
        }

        return ItSupportTicketDto.builder()
                .id(entity.getId())
                .ticketNumber(entity.getTicketNumber())
                .title(entity.getTitle())
                .category(entity.getCategory())
                .priority(entity.getPriority())
                .status(entity.getStatus())
                .requesterId(entity.getRequester().getId())
                .requesterName(getUserFullName(entity.getRequester()))
                .assignedToId(entity.getAssignedTo() != null ? entity.getAssignedTo().getId() : null)
                .assignedToName(entity.getAssignedTo() != null ? getUserFullName(entity.getAssignedTo()) : null)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public ItSupportTicketDetailDto toDetailDto(ItSupportTicket entity) {
        if (entity == null) {
            return null;
        }

        return ItSupportTicketDetailDto.builder()
                .id(entity.getId())
                .ticketNumber(entity.getTicketNumber())
                .title(entity.getTitle())
                .category(entity.getCategory())
                .priority(entity.getPriority())
                .status(entity.getStatus())
                .description(entity.getDescription())
                .preferredContact(entity.getPreferredContact())
                .requesterId(entity.getRequester().getId())
                .requesterName(getUserFullName(entity.getRequester()))
                .assignedToId(entity.getAssignedTo() != null ? entity.getAssignedTo().getId() : null)
                .assignedToName(entity.getAssignedTo() != null ? getUserFullName(entity.getAssignedTo()) : null)
                .comments(entity.getComments().stream()
                        .map(commentMapper::toDto)
                        .collect(Collectors.toList()))
                .attachments(entity.getAttachments().stream()
                        .map(attachmentMapper::toDto)
                        .collect(Collectors.toList()))
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .updatedByName(entity.getUpdatedBy() != null ? getUserFullName(entity.getUpdatedBy()) : null)
                .build();
    }

    private String getUserFullName(User user) {
        if (user == null) {
            return null;
        }
        return user.getFullName();
    }
}
