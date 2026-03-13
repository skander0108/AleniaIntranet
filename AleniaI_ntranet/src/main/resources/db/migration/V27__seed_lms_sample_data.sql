-- V27: Clean rebuild of LMS tables + seed sample data
-- Drop old tables (dev only — they had wrong column names from earlier iterations)
DROP TABLE IF EXISTS lms_progress CASCADE;
DROP TABLE IF EXISTS lms_sync_log CASCADE;
DROP TABLE IF EXISTS lms_user_map CASCADE;
DROP TABLE IF EXISTS lms_courses CASCADE;

-- Recreate with correct schema
CREATE TABLE lms_courses (
    ispring_course_id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    type VARCHAR(50) DEFAULT 'course',
    synced_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE lms_user_map (
    local_user_id UUID PRIMARY KEY REFERENCES users(id),
    ispring_user_id VARCHAR(255) NOT NULL,
    ispring_email VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE lms_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    course_id VARCHAR(255) NOT NULL REFERENCES lms_courses(ispring_course_id),
    status VARCHAR(50) NOT NULL DEFAULT 'NOT_STARTED',
    completion_date TIMESTAMP,
    score NUMERIC(10,2),
    max_score NUMERIC(10,2),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE lms_sync_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sync_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    started_at TIMESTAMP NOT NULL DEFAULT NOW(),
    finished_at TIMESTAMP,
    message TEXT,
    records_count INTEGER DEFAULT 0
);

-- Ensure manager_id exists on users
ALTER TABLE users ADD COLUMN IF NOT EXISTS manager_id UUID REFERENCES users(id);



WHERE email = 'collaborator@iberia.tn';


