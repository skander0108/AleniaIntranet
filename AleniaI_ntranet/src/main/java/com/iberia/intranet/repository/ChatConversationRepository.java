package com.iberia.intranet.repository;

import com.iberia.intranet.entity.ChatConversation;
import com.iberia.intranet.entity.ChatStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ChatConversationRepository extends JpaRepository<ChatConversation, UUID> {

    List<ChatConversation> findByUserIdOrderByCreatedAtDesc(UUID userId);

    List<ChatConversation> findByStatusInOrderByCreatedAtAsc(List<ChatStatus> statuses);

    Optional<ChatConversation> findByUserIdAndStatusIn(UUID userId, List<ChatStatus> statuses);

    long countByStatusIn(List<ChatStatus> statuses);
}
