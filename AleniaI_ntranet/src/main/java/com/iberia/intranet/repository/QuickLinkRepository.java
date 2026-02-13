package com.iberia.intranet.repository;

import com.iberia.intranet.entity.QuickLink;
import com.iberia.intranet.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface QuickLinkRepository extends JpaRepository<QuickLink, UUID> {

    List<QuickLink> findByUser(User user);

    // Dashboard: External Hubs (Global links)
    List<QuickLink> findByUserIdIsNull();
}
