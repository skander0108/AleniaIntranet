-- Clear all mock LMS data to allow clean API sync
TRUNCATE TABLE lms_progress CASCADE;
TRUNCATE TABLE lms_sync_log CASCADE;
TRUNCATE TABLE lms_courses CASCADE;
