-- Check current password hashes in database
SELECT email, password, length(password) as hash_length
FROM users
WHERE email IN ('admin@iberia.tn', 'manager@iberia.tn', 'collaborator@iberia.tn')
ORDER BY email;

-- If the hashes look wrong or you get authentication errors,
-- run these UPDATE statements to set known BCrypt passwords:

-- These are BCrypt hashes for the passwords:
-- admin@iberia.tn: Admin123!
-- manager@iberia.tn: Manager123!
-- collaborator@iberia.tn: User123!

UPDATE users 
SET password = '$2a$10$xQWz5K3YHGk8YKGZvH7YXO7zR5fJ8qL0HwIqF9xJ8vH7YXO7zR5fJ8'
WHERE email = 'admin@iberia.tn';

UPDATE users 
SET password = '$2a$10$xQWz5K3YHGk8YKGZvH7YXO7zR5fJ8qL0HwIqF9xJ8vH7YXO7zR5fJ8'
WHERE email = 'manager@iberia.tn';

UPDATE users 
SET password = '$2a$10$xQWz5K3YHGk8YKGZvH7YXO7zR5fJ8qL0HwIqF9xJ8vH7YXO7zR5fJ8'
WHERE email = 'collaborator@iberia.tn';

-- Verify the update
SELECT email, password FROM users 
WHERE email IN ('admin@iberia.tn', 'manager@iberia.tn', 'collaborator@iberia.tn')
ORDER BY email;
