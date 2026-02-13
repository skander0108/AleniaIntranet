package com.iberia.intranet.repository;

import com.iberia.intranet.entity.ItSupportTicket;
import com.iberia.intranet.entity.TicketCategory;
import com.iberia.intranet.entity.TicketPriority;
import com.iberia.intranet.entity.TicketStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ItSupportTicketRepository extends JpaRepository<ItSupportTicket, UUID> {

        Page<ItSupportTicket> findByRequesterId(UUID requesterId, Pageable pageable);

        Optional<ItSupportTicket> findByTicketNumber(String ticketNumber);

        @Query("SELECT t FROM ItSupportTicket t " +
                        "LEFT JOIN FETCH t.requester " +
                        "LEFT JOIN FETCH t.assignedTo " +
                        "LEFT JOIN FETCH t.updatedBy " +
                        "WHERE " +
                        "(:status IS NULL OR t.status = :status) AND " +
                        "(:priority IS NULL OR t.priority = :priority) AND " +
                        "(:category IS NULL OR t.category = :category) AND " +
                        "(:searchKeyword IS NULL OR " +
                        " LOWER(t.title) LIKE :searchKeyword OR " +
                        " LOWER(t.description) LIKE :searchKeyword OR " +
                        " LOWER(t.ticketNumber) LIKE :searchKeyword)")
        Page<ItSupportTicket> findByFilters(
                        @Param("status") TicketStatus status,
                        @Param("priority") TicketPriority priority,
                        @Param("category") TicketCategory category,
                        @Param("searchKeyword") String searchKeyword,
                        Pageable pageable);

        @Query("SELECT COALESCE(MAX(SUBSTRING(t.ticketNumber, 9)), '0') FROM ItSupportTicket t " +
                        "WHERE t.ticketNumber LIKE CONCAT('IT-', :year, '-%')")
        String findMaxTicketNumberForYear(@Param("year") String year);

        long countByStatus(TicketStatus status);

        @Query("SELECT t FROM ItSupportTicket t " +
                        "LEFT JOIN FETCH t.requester " +
                        "LEFT JOIN FETCH t.assignedTo " +
                        "WHERE t.id = :id")
        Optional<ItSupportTicket> findByIdWithDetails(@Param("id") UUID id);
}
