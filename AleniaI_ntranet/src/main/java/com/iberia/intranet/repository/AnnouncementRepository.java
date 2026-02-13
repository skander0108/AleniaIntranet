package com.iberia.intranet.repository;

import com.iberia.intranet.entity.Announcement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;
import com.iberia.intranet.entity.User;
import org.springframework.stereotype.Repository;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, UUID> {

    Page<Announcement> findByStatus(String status, Pageable pageable);

    Page<Announcement> findByUser(User user, Pageable pageable);

    // Dashboard: Featured News
    Announcement findTopByIsFeaturedTrueAndStatusOrderByPublishedAtDesc(String status);

    // Dashboard: Feed (Latest news)
    List<Announcement> findTop5ByStatusOrderByPublishedAtDesc(String status);
}
