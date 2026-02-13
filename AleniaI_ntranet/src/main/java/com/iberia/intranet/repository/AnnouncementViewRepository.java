package com.iberia.intranet.repository;

import com.iberia.intranet.entity.Announcement;
import com.iberia.intranet.entity.AnnouncementView;
import com.iberia.intranet.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AnnouncementViewRepository extends JpaRepository<AnnouncementView, UUID> {

    Optional<AnnouncementView> findByAnnouncementAndUser(Announcement announcement, User user);

    java.util.List<AnnouncementView> findAllByAnnouncement(Announcement announcement);

    void deleteByAnnouncement(Announcement announcement);
}
