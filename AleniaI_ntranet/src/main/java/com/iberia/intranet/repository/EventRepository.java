package com.iberia.intranet.repository;

import com.iberia.intranet.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface EventRepository extends JpaRepository<Event, UUID> {
    List<Event> findByEventDateAfterOrderByEventDateAsc(LocalDate date);

    List<Event> findByUser(com.iberia.intranet.entity.User user);
}
