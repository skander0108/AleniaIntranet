package com.iberia.intranet.repository;

import com.iberia.intranet.entity.lms.LmsSyncLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface LmsSyncLogRepository extends JpaRepository<LmsSyncLog, UUID> {

    List<LmsSyncLog> findAllByOrderByStartedAtDesc();
}
