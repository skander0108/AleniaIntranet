-- FINAL FIX: Convert bytea columns to VARCHAR/TEXT in it_support_tickets
-- This fixes the database schema directly

-- Step 1: Check current types
\echo 'Current column types:'
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'it_support_tickets' 
  AND column_name IN ('ticket_number', 'title', 'description', 'category', 'priority', 'status', 'preferred_contact')
ORDER BY column_name;

-- Step 2: Convert bytea columns to proper types
\echo ''
\echo 'Converting bytea columns to VARCHAR/TEXT...'

-- Backup data first
CREATE TEMP TABLE it_support_backup AS SELECT * FROM it_support_tickets;
CREATE TEMP TABLE it_comments_backup AS SELECT * FROM it_support_comments;
CREATE TEMP TABLE it_attachments_backup AS SELECT * FROM it_support_attachments;

-- Drop and recreate with correct types
DROP TABLE IF EXISTS it_support_attachments CASCADE;
DROP TABLE IF EXISTS it_support_comments CASCADE;
DROP TABLE IF EXISTS it_support_tickets CASCADE;

CREATE TABLE it_support_tickets (
    id UUID PRIMARY KEY,
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    priority VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    requester_id UUID NOT NULL,
    assigned_to_id UUID,
    preferred_contact VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_by_id UUID,
    CONSTRAINT fk_requester FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_assigned_to FOREIGN KEY (assigned_to_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_updated_by FOREIGN KEY (updated_by_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE it_support_comments (
    id UUID PRIMARY KEY,
    ticket_id UUID NOT NULL,
    author_id UUID NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_ticket FOREIGN KEY (ticket_id) REFERENCES it_support_tickets(id) ON DELETE CASCADE,
    CONSTRAINT fk_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE it_support_attachments (
    id UUID PRIMARY KEY,
    ticket_id UUID NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    storage_path VARCHAR(500) NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_ticket_attachment FOREIGN KEY (ticket_id) REFERENCES it_support_tickets(id) ON DELETE CASCADE
);

-- Restore data with conversion
INSERT INTO it_support_tickets
SELECT 
    id,
    CASE WHEN pg_typeof(ticket_number) = 'bytea'::regtype THEN encode(ticket_number, 'escape') ELSE ticket_number::VARCHAR END,
    CASE WHEN pg_typeof(title) = 'bytea'::regtype THEN encode(title, 'escape') ELSE title::VARCHAR END,
    CASE WHEN pg_typeof(category) = 'bytea'::regtype THEN encode(category, 'escape') ELSE category::VARCHAR END,
    CASE WHEN pg_typeof(priority) = 'bytea'::regtype THEN encode(priority, 'escape') ELSE priority::VARCHAR END,
    CASE WHEN pg_typeof(status) = 'bytea'::regtype THEN encode(status, 'escape') ELSE status::VARCHAR END,
    CASE WHEN pg_typeof(description) = 'bytea'::regtype THEN encode(description, 'escape') ELSE description::TEXT END,
    requester_id, assigned_to_id,
    CASE WHEN preferred_contact IS NOT NULL AND pg_typeof(preferred_contact) = 'bytea'::regtype THEN encode(preferred_contact, 'escape') ELSE preferred_contact::VARCHAR END,
    created_at, updated_at, updated_by_id
FROM it_support_backup;

INSERT INTO it_support_comments SELECT * FROM it_comments_backup;
INSERT INTO it_support_attachments SELECT * FROM it_attachments_backup;

-- Recreate indexes
CREATE INDEX idx_it_tickets_status ON it_support_tickets(status);
CREATE INDEX idx_it_tickets_priority ON it_support_tickets(priority);
CREATE INDEX idx_it_tickets_requester ON it_support_tickets(requester_id);
CREATE INDEX idx_it_tickets_assigned ON it_support_tickets(assigned_to_id);
CREATE INDEX idx_it_tickets_created ON it_support_tickets(created_at DESC);
CREATE INDEX idx_it_tickets_number ON it_support_tickets(ticket_number);
CREATE INDEX idx_it_tickets_category ON it_support_tickets(category);
CREATE INDEX idx_it_comments_ticket ON it_support_comments(ticket_id);
CREATE INDEX idx_it_comments_created ON it_support_comments(created_at DESC);
CREATE INDEX idx_it_attachments_ticket ON it_support_attachments(ticket_id);

\echo ''
\echo '✅ Tables recreated with correct types!'
\echo ''
\echo 'Verification:'
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'it_support_tickets' 
  AND column_name IN ('ticket_number', 'title', 'description')
ORDER BY column_name;
