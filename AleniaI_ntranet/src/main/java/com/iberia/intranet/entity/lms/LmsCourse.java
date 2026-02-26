package com.iberia.intranet.entity.lms;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "lms_courses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LmsCourse {

    @Id
    @Column(name = "ispring_course_id")
    private String ispringCourseId;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "type")
    private String type;

    @Column(name = "synced_at")
    private LocalDateTime syncedAt;
}
