CREATE TABLE users (
    id UUID PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL
);

CREATE TABLE user_roles (
    id UUID PRIMARY KEY,
    role VARCHAR(50) NOT NULL,
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE tools (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    url VARCHAR(1024) NOT NULL
);

CREATE TABLE tool_accesses (
    id UUID PRIMARY KEY,
    allowed BOOLEAN NOT NULL,
    tool_id UUID NOT NULL REFERENCES tools (id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    type VARCHAR(100) NOT NULL,
    message VARCHAR(2000) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    is_read BOOLEAN NOT NULL,
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE quick_links (
    id UUID PRIMARY KEY,
    label VARCHAR(255) NOT NULL,
    url VARCHAR(1024) NOT NULL,
    is_active BOOLEAN NOT NULL,
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE announcements (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    published_at TIMESTAMPTZ NOT NULL,
    status VARCHAR(50) NOT NULL,
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE announcement_views (
    id UUID PRIMARY KEY,
    viewed_at TIMESTAMPTZ NOT NULL,
    announcement_id UUID NOT NULL REFERENCES announcements (id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE knowledge_categories (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE knowledge_documents (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    summary VARCHAR(2000) NOT NULL,
    file_url VARCHAR(1024) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    category_id UUID NOT NULL REFERENCES knowledge_categories (id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE trainings (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    duration_minutes INT NOT NULL
);

CREATE TABLE enrollments (
    id UUID PRIMARY KEY,
    status VARCHAR(50) NOT NULL,
    progress_percent INT NOT NULL,
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    training_id UUID NOT NULL REFERENCES trainings (id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE assistant_sessions (
    id UUID PRIMARY KEY,
    started_at TIMESTAMPTZ NOT NULL,
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE assistant_messages (
    id UUID PRIMARY KEY,
    role VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    session_id UUID NOT NULL REFERENCES assistant_sessions (id) ON DELETE CASCADE
);

CREATE INDEX idx_tool_access_user ON tool_accesses (user_id);
CREATE INDEX idx_tool_access_tool ON tool_accesses (tool_id);
CREATE INDEX idx_notification_user_read ON notifications (user_id, is_read);
CREATE INDEX idx_quick_link_user ON quick_links (user_id);
CREATE INDEX idx_announcement_status ON announcements (status);
CREATE INDEX idx_announcement_view_announcement_user ON announcement_views (announcement_id, user_id);
CREATE INDEX idx_knowledge_doc_category ON knowledge_documents (category_id);
CREATE INDEX idx_knowledge_doc_user ON knowledge_documents (user_id);
CREATE INDEX idx_enrollment_user ON enrollments (user_id);
CREATE INDEX idx_enrollment_training ON enrollments (training_id);
CREATE INDEX idx_assistant_session_user ON assistant_sessions (user_id);
CREATE INDEX idx_assistant_message_session ON assistant_messages (session_id);

