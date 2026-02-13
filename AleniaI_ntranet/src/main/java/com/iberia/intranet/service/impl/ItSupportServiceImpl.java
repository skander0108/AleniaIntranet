package com.iberia.intranet.service.impl;

import com.iberia.intranet.dto.ItSupportCommentDto;
import com.iberia.intranet.dto.ItSupportTicketCreateDto;
import com.iberia.intranet.dto.ItSupportTicketDetailDto;
import com.iberia.intranet.dto.ItSupportTicketDto;
import com.iberia.intranet.entity.*;
import com.iberia.intranet.mapper.ItSupportCommentMapper;
import com.iberia.intranet.mapper.ItSupportTicketMapper;
import com.iberia.intranet.repository.ItSupportAttachmentRepository;
import com.iberia.intranet.repository.ItSupportCommentRepository;
import com.iberia.intranet.repository.ItSupportTicketRepository;
import com.iberia.intranet.service.ItSupportService;
import com.iberia.intranet.service.NotificationService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ItSupportServiceImpl implements ItSupportService {

    private final ItSupportTicketRepository ticketRepository;
    private final ItSupportCommentRepository commentRepository;
    private final ItSupportAttachmentRepository attachmentRepository;
    private final ItSupportTicketMapper ticketMapper;
    private final ItSupportCommentMapper commentMapper;
    private final NotificationService notificationService;

    @Value("${app.upload.directory:./uploads}")
    private String uploadDirectory;

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList("png", "jpg", "jpeg", "pdf", "txt");

    @Override
    @Transactional
    public ItSupportTicketDto createTicket(ItSupportTicketCreateDto dto, MultipartFile file, User requester) {
        // Generate ticket number
        String ticketNumber = generateTicketNumber();

        // Create ticket entity
        ItSupportTicket ticket = ItSupportTicket.builder()
                .ticketNumber(ticketNumber)
                .title(dto.getTitle())
                .category(dto.getCategory())
                .priority(dto.getPriority())
                .status(TicketStatus.OPEN)
                .description(dto.getDescription())
                .preferredContact(dto.getPreferredContact())
                .requester(requester)
                .build();

        ticket = ticketRepository.save(ticket);

        // Handle file upload if present
        if (file != null && !file.isEmpty()) {
            try {
                saveAttachment(ticket, file);
            } catch (IOException e) {
                log.error("Failed to save attachment for ticket {}", ticketNumber, e);
                throw new RuntimeException("Failed to save attachment: " + e.getMessage());
            }
        }

        // Send notification to IT admins
        notifyTicketCreated(ticket);

        return ticketMapper.toDto(ticket);
    }

    @Override
    @Transactional
    public Page<ItSupportTicketDto> getMyTickets(User requester, Pageable pageable) {
        Page<ItSupportTicket> tickets = ticketRepository.findByRequesterId(requester.getId(), pageable);
        return tickets.map(ticketMapper::toDto);
    }

    @Override
    @Transactional
    public ItSupportTicketDetailDto getTicketDetail(UUID ticketId, User user) {
        ItSupportTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        // Check access: user must be requester or have admin role
        if (!ticket.getRequester().getId().equals(user.getId()) && !isAdmin(user)) {
            throw new RuntimeException("Access denied");
        }

        return ticketMapper.toDetailDto(ticket);
    }

    @Override
    @Transactional
    public ItSupportCommentDto addComment(UUID ticketId, String message, User author) {
        ItSupportTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        // Check access
        if (!ticket.getRequester().getId().equals(author.getId()) && !isAdmin(author)) {
            throw new RuntimeException("Access denied");
        }

        ItSupportComment comment = ItSupportComment.builder()
                .ticket(ticket)
                .author(author)
                .message(message)
                .build();

        comment = commentRepository.save(comment);

        // If comment is from admin, notify the requester
        if (isAdmin(author) && !author.getId().equals(ticket.getRequester().getId())) {
            notifyTicketUpdated(ticket, "New response from IT Support");
        }

        return commentMapper.toDto(comment);
    }

    @Override
    @Transactional
    public void closeTicket(UUID ticketId, User requester) {
        ItSupportTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        // Only requester can close
        if (!ticket.getRequester().getId().equals(requester.getId())) {
            throw new RuntimeException("Only the requester can close the ticket");
        }

        // Can only close if status is RESOLVED
        if (ticket.getStatus() != TicketStatus.RESOLVED) {
            throw new RuntimeException("Ticket can only be closed if it is resolved");
        }

        ticket.setStatus(TicketStatus.CLOSED);
        ticket.setUpdatedBy(requester);
        ticketRepository.save(ticket);
    }

    @Override
    @Transactional
    public Resource downloadAttachment(UUID ticketId, UUID attachmentId, User user) {
        ItSupportTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        // Check access
        if (!ticket.getRequester().getId().equals(user.getId()) && !isAdmin(user)) {
            throw new RuntimeException("Access denied");
        }

        ItSupportAttachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new RuntimeException("Attachment not found"));

        if (!attachment.getTicket().getId().equals(ticketId)) {
            throw new RuntimeException("Attachment does not belong to this ticket");
        }

        try {
            Path filePath = Paths.get(attachment.getStoragePath());
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("File not found or not readable");
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to download file: " + e.getMessage());
        }
    }

    // Helper methods

    private String generateTicketNumber() {
        String year = String.valueOf(LocalDateTime.now().getYear());
        String lastNumber = ticketRepository.findMaxTicketNumberForYear(year);

        int nextNumber = 1;
        if (lastNumber != null && !lastNumber.equals("0")) {
            nextNumber = Integer.parseInt(lastNumber) + 1;
        }

        return String.format("IT-%s-%06d", year, nextNumber);
    }

    private void saveAttachment(ItSupportTicket ticket, MultipartFile file) throws IOException {
        // Validate file size
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new RuntimeException("File size exceeds maximum allowed size of 5MB");
        }

        // Validate file extension
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new RuntimeException("Invalid file name");
        }

        String extension = getFileExtension(originalFilename).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new RuntimeException("File type not allowed. Allowed types: png, jpg, pdf, txt");
        }

        // Create directory structure: uploads/it-tickets/{ticketId}/
        Path ticketDir = Paths.get(uploadDirectory, "it-tickets", ticket.getId().toString());
        Files.createDirectories(ticketDir);

        // Generate unique filename to prevent overwrite
        String uniqueFilename = UUID.randomUUID().toString() + "_" + originalFilename;
        Path filePath = ticketDir.resolve(uniqueFilename);

        // Save file
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Create attachment record
        ItSupportAttachment attachment = ItSupportAttachment.builder()
                .ticket(ticket)
                .fileName(originalFilename)
                .contentType(file.getContentType())
                .fileSize(file.getSize())
                .storagePath(filePath.toString())
                .build();

        attachmentRepository.save(attachment);
    }

    private String getFileExtension(String filename) {
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex == -1) {
            return "";
        }
        return filename.substring(lastDotIndex + 1);
    }

    private boolean isAdmin(User user) {
        return user.getRoles().stream()
                .anyMatch(ur -> ur.getRole() == RoleType.ADMIN);
    }

    private void notifyTicketCreated(ItSupportTicket ticket) {
        String title = "New IT Support Request";
        String message = String.format("Ticket %s: %s", ticket.getTicketNumber(), ticket.getTitle());
        String linkUrl = "/it-support/" + ticket.getId();

        notificationService.createNotification(
                NotificationType.IT_TICKET_CREATED,
                title,
                message,
                ticket.getId(),
                linkUrl,
                "ROLE",
                "ADMIN");
    }

    private void notifyTicketUpdated(ItSupportTicket ticket, String updateMessage) {
        String title = "IT Support Ticket Updated";
        String message = String.format("Ticket %s: %s", ticket.getTicketNumber(), updateMessage);
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
