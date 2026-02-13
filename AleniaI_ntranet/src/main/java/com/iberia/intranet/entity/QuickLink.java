package com.iberia.intranet.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Entity
@Table(name = "quick_links")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuickLink {
    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String label;

    @Column(nullable = false)
    private String url;

    @Column(name = "is_active", nullable = false)
    private boolean isActive;

    @ManyToOne(optional = true)
    @JoinColumn(name = "user_id", nullable = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private User user;

    // Dashboard fields
    private String description;
    private String icon;
}
