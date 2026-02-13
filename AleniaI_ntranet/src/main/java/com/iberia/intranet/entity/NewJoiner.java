package com.iberia.intranet.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "new_joiners")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NewJoiner {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "job_title", nullable = false)
    private String jobTitle;

    @Column(nullable = false)
    private String department;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    private String location;

    @Column(name = "photo_url")
    private String photoUrl;

    // CV Metadata
    @Column(name = "cv_file_id")
    private String cvFileId;

    @Column(name = "cv_file_name")
    private String cvFileName;

    @Column(name = "cv_mime_type")
    private String cvMimeType;

    @Column(name = "cv_size_bytes")
    private Long cvSizeBytes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private ZonedDateTime updatedAt;
}
