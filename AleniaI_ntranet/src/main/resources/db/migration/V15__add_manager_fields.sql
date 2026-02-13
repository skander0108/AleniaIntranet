-- Add new columns to announcements table
ALTER TABLE announcements
ADD COLUMN priority VARCHAR(20),
ADD COLUMN target_audience VARCHAR(20);

-- Add description column to events table
ALTER TABLE events
ADD COLUMN description TEXT;
