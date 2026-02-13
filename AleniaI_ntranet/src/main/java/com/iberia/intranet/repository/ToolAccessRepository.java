package com.iberia.intranet.repository;

import com.iberia.intranet.entity.Tool;
import com.iberia.intranet.entity.ToolAccess;
import com.iberia.intranet.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ToolAccessRepository extends JpaRepository<ToolAccess, UUID> {

    List<ToolAccess> findByUser(User user);

    List<ToolAccess> findByTool(Tool tool);

    Optional<ToolAccess> findByUserAndTool(User user, Tool tool);
}

