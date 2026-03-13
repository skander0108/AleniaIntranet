ALTER TABLE chat_conversations RENAME COLUMN assigned_admin_id TO assigned_hr_id;
ALTER INDEX IF EXISTS idx_chat_conversations_admin RENAME TO idx_chat_conversations_hr;
