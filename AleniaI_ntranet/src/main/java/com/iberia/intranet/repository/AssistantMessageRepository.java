package com.iberia.intranet.repository;

import com.iberia.intranet.entity.AssistantMessage;
import com.iberia.intranet.entity.AssistantSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AssistantMessageRepository extends JpaRepository<AssistantMessage, UUID> {

    List<AssistantMessage> findBySessionOrderByCreatedAtAsc(AssistantSession session);
}

