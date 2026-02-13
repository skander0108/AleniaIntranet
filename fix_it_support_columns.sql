-- Manual fix for IT Support ticket_number column type issue
-- Run this directly in PostgreSQL to fix the bytea column type

-- Drop and recreate the tables with correct types
DROP TABLE IF EXISTS it_support_attachments CASCADE;
DROP TABLE IF EXISTS it_support_comments CASCADE;
DROP TABLE IF EXISTS it_support_tickets CASCADE;

-- Recreate it_support_tickets table with VARCHAR ticket_number
CREATE TABLE it_support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    priority VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    requester_id UUID NOT NULL,
    assigned_to_id UUID,
    preferred_contact VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_by_id UUID,
    CONSTRAINT fk_requester FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_assigned_to FOREIGN KEY (assigned_to_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_updated_by FOREIGN KEY (updated_by_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Recreate it_support_comments table
CREATE TABLE it_support_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL,
    author_id UUID NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_ticket FOREIGN KEY (ticket_id) REFERENCES it_support_tickets(id) ON DELETE CASCADE,
    CONSTRAINT fk_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Recreate it_support_attachments table
CREATE TABLE it_support_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    storage_path VARCHAR(500) NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_ticket_attachment FOREIGN KEY (ticket_id) REFERENCES it_support_tickets(id) ON DELETE CASCADE
);

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
