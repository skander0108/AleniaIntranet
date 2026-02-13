package com.iberia.intranet.controller;

import com.iberia.intranet.entity.Announcement;
import com.iberia.intranet.entity.Event;
import com.iberia.intranet.entity.QuickLink;
import com.iberia.intranet.entity.Tool;
import com.iberia.intranet.repository.AnnouncementRepository;
import com.iberia.intranet.repository.EventRepository;
import com.iberia.intranet.repository.QuickLinkRepository;
import com.iberia.intranet.repository.ToolRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final AnnouncementRepository announcementRepository;
    private final EventRepository eventRepository;
    private final QuickLinkRepository quickLinkRepository;
    private final ToolRepository toolRepository;

    @GetMapping("/news/featured")
    public Announcement getFeaturedNews() {
        return announcementRepository.findTopByIsFeaturedTrueAndStatusOrderByPublishedAtDesc("PUBLISHED");
    }

    @GetMapping("/news/feed")
    public List<Announcement> getNewsFeed() {
        return announcementRepository.findTop5ByStatusOrderByPublishedAtDesc("PUBLISHED");
    }

    @GetMapping("/events")
    public List<Event> getUpcomingEvents() {
        return eventRepository.findByEventDateAfterOrderByEventDateAsc(LocalDate.now().minusDays(1));
    }

    @GetMapping("/hubs")
    public List<QuickLink> getExternalHubs() {
        return quickLinkRepository.findByUserIdIsNull();
    }

    @GetMapping("/tools")
    public List<Tool> getTools() {
        return toolRepository.findAll();
    }
}
