CREATE TABLE it_support_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    changed_by_id UUID,
    old_value TEXT,
    new_value TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    CONSTRAINT fk_audit_ticket FOREIGN KEY (ticket_id) REFERENCES it_support_tickets(id) ON DELETE CASCADE,
    CONSTRAINT fk_audit_changer FOREIGN KEY (changed_by_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_audit_ticket_id ON it_support_audit_logs(ticket_id);
