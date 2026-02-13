package com.iberia.intranet.repository;

import com.iberia.intranet.entity.ItSupportComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ItSupportCommentRepository extends JpaRepository<ItSupportComment, UUID> {
    java.util.List<ItSupportComment> findByTicketIdOrderByCreatedAtAsc(UUID ticketId);
}
