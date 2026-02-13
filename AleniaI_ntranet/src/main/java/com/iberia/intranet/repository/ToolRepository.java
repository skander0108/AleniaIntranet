package com.iberia.intranet.repository;

import com.iberia.intranet.entity.Tool;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ToolRepository extends JpaRepository<Tool, UUID> {
}

