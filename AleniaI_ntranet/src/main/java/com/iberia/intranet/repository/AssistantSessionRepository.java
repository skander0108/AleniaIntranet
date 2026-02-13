package com.iberia.intranet.repository;

import com.iberia.intranet.entity.AssistantSession;
import com.iberia.intranet.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AssistantSessionRepository extends JpaRepository<AssistantSession, UUID> {

    List<AssistantSession> findByUser(User user);
}

