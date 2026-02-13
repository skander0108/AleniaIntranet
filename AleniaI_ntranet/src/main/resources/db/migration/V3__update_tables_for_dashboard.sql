-- Update Quick Links (External Hubs)
ALTER TABLE quick_links ADD COLUMN description VARCHAR(255);
ALTER TABLE quick_links ADD COLUMN icon VARCHAR(50);
-- Make user_id nullable for global/system links
ALTER TABLE quick_links ALTER COLUMN user_id DROP NOT NULL;

-- Update Tools
ALTER TABLE tools ADD COLUMN icon VARCHAR(50);
ALTER TABLE tools ADD COLUMN color_theme VARCHAR(50);
ALTER TABLE tools ADD COLUMN description VARCHAR(255);

-- Update Announcements (News Feed)
ALTER TABLE announcements ADD COLUMN summary VARCHAR(500);
ALTER TABLE announcements ADD COLUMN image_url VARCHAR(1024);
ALTER TABLE announcements ADD COLUMN category VARCHAR(50);
ALTER TABLE announcements ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;

-- Create Events Table
CREATE TABLE events (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    location VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_events_date ON events(event_date);
