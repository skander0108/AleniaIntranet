package com.iberia.intranet.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "announcements")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Announcement {
    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "published_at", nullable = false)
    private ZonedDateTime publishedAt;

    @Column(nullable = false)
    private String status;

    @ManyToOne(optional = true)
    @JoinColumn(name = "user_id", nullable = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private User user;

    // Dashboard specific fields
    private String summary;

    @Column(name = "image_url")
    private String imageUrl;

    private String category;

    @Column(name = "is_featured")
    private Boolean isFeatured;

    private String priority; // NORMAL, IMPORTANT, URGENT

    @Column(name = "target_audience")
    private String targetAudience; // ALL, TEAM
}
