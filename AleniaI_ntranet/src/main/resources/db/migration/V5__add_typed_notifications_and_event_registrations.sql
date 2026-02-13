-- Migration V5: Update Notifications Schema + Add Event Registrations
-- This migration updates the existing notifications system to support typed notifications
-- and adds event registration functionality

-- 1. Drop old notification_reads table (replaced with notification_recipients)
DROP TABLE IF EXISTS notification_reads CASCADE;

-- 2. Add new columns to notifications table
ALTER TABLE notifications 
  ADD COLUMN IF NOT EXISTS type VARCHAR(50) NOT NULL DEFAULT 'GENERAL',
  ADD COLUMN IF NOT EXISTS entity_id UUID,
  ADD COLUMN IF NOT EXISTS link_url VARCHAR(500);

-- 3. Create notification_recipients table (per-user read tracking)
CREATE TABLE IF NOT EXISTS notification_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(notification_id, user_id)
);

-- 4. Create event_registrations table
CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notif_recipients_user_unread ON notification_recipients(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notif_recipients_notif ON notification_recipients(notification_id);
CREATE INDEX IF NOT EXISTS idx_notif_entity ON notifications(entity_id);
CREATE INDEX IF NOT EXISTS idx_notif_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notif_created ON notifications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_event_reg_user ON event_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_event_reg_event ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_reg_date ON event_registrations(registered_at DESC);
