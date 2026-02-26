package com.iberia.intranet.entity.lms;

import com.iberia.intranet.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "lms_user_map")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LmsUserMap {

    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "org.hibernate.id.UUIDGenerator")
    @JdbcTypeCode(SqlTypes.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "local_user_id", nullable = false)
    @ToString.Exclude
    private User localUser;

    @Column(name = "ispring_user_id", nullable = false)
    private String ispringUserId;

    @Column(name = "email")
    private String email;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
