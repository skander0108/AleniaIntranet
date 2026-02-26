-- Fix: add synced_at column if lms_courses table was created without it
ALTER TABLE lms_courses ADD COLUMN IF NOT EXISTS synced_at TIMESTAMP DEFAULT NOW();
