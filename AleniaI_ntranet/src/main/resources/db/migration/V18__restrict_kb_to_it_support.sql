-- Migration: Restrict Knowledge Base to IT Support
-- Deletes all categories except 'IT Support'.
-- Associated articles will be deleted automatically due to ON DELETE CASCADE on the foreign key.

DELETE FROM knowledge_categories
WHERE name != 'IT Support';
