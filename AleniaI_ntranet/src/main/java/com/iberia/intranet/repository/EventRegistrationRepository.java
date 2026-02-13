package com.iberia.intranet.repository;

import com.iberia.intranet.entity.EventRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EventRegistrationRepository extends JpaRepository<EventRegistration, UUID> {

    @Query("SELECT er FROM EventRegistration er WHERE er.user.id = :userId ORDER BY er.registeredAt DESC")
    List<EventRegistration> findByUserId(@Param("userId") UUID userId);

    @Query("SELECT er FROM EventRegistration er WHERE er.event.id = :eventId")
    List<EventRegistration> findByEventId(@Param("eventId") UUID eventId);

    @Query("SELECT er FROM EventRegistration er WHERE er.user.id = :userId AND er.event.id = :eventId")
    Optional<EventRegistration> findByUserIdAndEventId(@Param("userId") UUID userId, @Param("eventId") UUID eventId);

    boolean existsByUserIdAndEventId(UUID userId, UUID eventId);

    void deleteByUserIdAndEventId(UUID userId, UUID eventId);

    void deleteByEvent(com.iberia.intranet.entity.Event event);

    List<EventRegistration> findAllByEvent(com.iberia.intranet.entity.Event event);
}
