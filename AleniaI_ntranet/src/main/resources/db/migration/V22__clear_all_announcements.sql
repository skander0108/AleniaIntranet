-- Clear all announcement views first due to FK constraint
DELETE FROM announcement_views;

-- Clear notifications related to announcements
DELETE FROM notifications WHERE type = 'ANNOUNCEMENT_PUBLISHED';

-- Clear all announcements
DELETE FROM announcements;
