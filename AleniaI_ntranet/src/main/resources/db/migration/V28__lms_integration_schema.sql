-- Create LmsUserMap table
CREATE TABLE IF NOT EXISTS lms_user_map (
    id UUID PRIMARY KEY,
    local_user_id UUID NOT NULL REFERENCES users(id),
    ispring_user_id VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE
);

-- Update LmsProgress table
-- First, drop the foreign key to courses if it exists 
ALTER TABLE lms_progress DROP COLUMN IF EXISTS course_id;

-- Add new columns if they do not exist
ALTER TABLE lms_progress ADD COLUMN IF NOT EXISTS ispring_course_id VARCHAR(255);
ALTER TABLE lms_progress ADD COLUMN IF NOT EXISTS title VARCHAR(255);
ALTER TABLE lms_progress ADD COLUMN IF NOT EXISTS type VARCHAR(50);
ALTER TABLE lms_progress ADD COLUMN IF NOT EXISTS raw_json TEXT;
ALTER TABLE lms_progress ADD COLUMN IF NOT EXISTS time_spent VARCHAR(50);

-- Add unique constraint to prevent duplicates (user + ispring_course_id)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_lms_progress_user_course') THEN
        ALTER TABLE lms_progress ADD CONSTRAINT uq_lms_progress_user_course UNIQUE (user_id, ispring_course_id);
    END IF;
END $$;
