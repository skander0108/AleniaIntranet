package com.iberia.intranet.repository;

import com.iberia.intranet.entity.Notification;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    @Query("SELECT n FROM Notification n WHERE " +
            "(n.targetType = 'GLOBAL') OR " +
            "(n.targetType = 'ROLE' AND n.targetValue IN :roles) OR " +
            "(n.targetType = 'USER' AND n.targetValue = :userIdStr) " +
            "ORDER BY n.createdAt DESC")
    List<Notification> findNotificationsForUser(@Param("userIdStr") String userIdStr,
            @Param("roles") List<String> roles,
            Pageable pageable);
}
