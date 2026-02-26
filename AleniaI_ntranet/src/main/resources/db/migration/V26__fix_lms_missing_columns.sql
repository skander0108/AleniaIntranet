-- Fix: add potentially missing columns to LMS tables for environments
-- where tables were partially created before V24

-- lms_progress
ALTER TABLE lms_progress ADD COLUMN IF NOT EXISTS course_id VARCHAR(255) REFERENCES lms_courses(ispring_course_id);
ALTER TABLE lms_progress ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id);
ALTER TABLE lms_progress ADD COLUMN IF NOT EXISTS status VARCHAR(50) NOT NULL DEFAULT 'NOT_STARTED';
ALTER TABLE lms_progress ADD COLUMN IF NOT EXISTS completion_date TIMESTAMP;
ALTER TABLE lms_progress ADD COLUMN IF NOT EXISTS score NUMERIC(10,2);
ALTER TABLE lms_progress ADD COLUMN IF NOT EXISTS max_score NUMERIC(10,2);
ALTER TABLE lms_progress ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- lms_user_map
ALTER TABLE lms_user_map ADD COLUMN IF NOT EXISTS ispring_user_id VARCHAR(255);
ALTER TABLE lms_user_map ADD COLUMN IF NOT EXISTS ispring_email VARCHAR(255);
ALTER TABLE lms_user_map ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

-- lms_sync_log
ALTER TABLE lms_sync_log ADD COLUMN IF NOT EXISTS sync_type VARCHAR(50);
ALTER TABLE lms_sync_log ADD COLUMN IF NOT EXISTS status VARCHAR(50);
ALTER TABLE lms_sync_log ADD COLUMN IF NOT EXISTS started_at TIMESTAMP DEFAULT NOW();
ALTER TABLE lms_sync_log ADD COLUMN IF NOT EXISTS finished_at TIMESTAMP;
ALTER TABLE lms_sync_log ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE lms_sync_log ADD COLUMN IF NOT EXISTS records_count INTEGER DEFAULT 0;

-- users
ALTER TABLE users ADD COLUMN IF NOT EXISTS manager_id UUID REFERENCES users(id);
