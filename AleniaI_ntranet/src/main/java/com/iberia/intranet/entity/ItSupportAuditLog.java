package com.iberia.intranet.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "it_support_audit_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItSupportAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false)
    private ItSupportTicket ticket;

    @Column(nullable = false, length = 50)
    private String action; // STATUS_CHANGE, ASSIGNMENT, PRIORITY_UPDATE, COMMENT_ADDED, CONVERTED_TO_KB

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "changed_by_id")
    private User changedBy;

    @Column(name = "old_value", columnDefinition = "TEXT")
    private String oldValue;

    @Column(name = "new_value", columnDefinition = "TEXT")
    private String newValue;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private OffsetDateTime timestamp;
}
