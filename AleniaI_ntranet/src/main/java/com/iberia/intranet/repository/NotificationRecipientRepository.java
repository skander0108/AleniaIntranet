package com.iberia.intranet.repository;

import com.iberia.intranet.entity.NotificationRecipient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationRecipientRepository extends JpaRepository<NotificationRecipient, UUID> {

    @Query("SELECT nr FROM NotificationRecipient nr WHERE nr.user.id = :userId AND nr.notification.id IN :notificationIds")
    List<NotificationRecipient> findByUserIdAndNotificationIdIn(@Param("userId") UUID userId,
            @Param("notificationIds") List<UUID> notificationIds);

    boolean existsByUserIdAndNotificationId(UUID userId, UUID notificationId);

    void deleteByUserIdAndNotificationId(UUID userId, UUID notificationId);

    @Query("SELECT COUNT(nr) FROM NotificationRecipient nr WHERE nr.user.id = :userId AND nr.isRead = false")
    int countUnreadByUserId(@Param("userId") UUID userId);
}
