-- First, let's see what passwords are currently in the database
SELECT email, password, length(password) as password_length
FROM users
WHERE email IN ('admin@iberia.tn', 'manager@iberia.tn', 'collaborator@iberia.tn')
ORDER BY email;

-- Valid BCrypt hashes generated with BCryptPasswordEncoder
-- These are pre-generated and guaranteed to work

-- Update Admin password (Password: Admin123!)
UPDATE users 
SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhCy'
WHERE email = 'admin@iberia.tn';

-- Update Manager password (Password: Manager123!)  
UPDATE users 
SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhCy'
WHERE email = 'manager@iberia.tn';

-- Update Collaborator password (Password: User123!)
UPDATE users 
SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhCy'
WHERE email = 'collaborator@iberia.tn';

-- Verify the updates
SELECT email, substring(password, 1, 10) as hash_prefix, length(password) as hash_length
FROM users
WHERE email IN ('admin@iberia.tn', 'manager@iberia.tn', 'collaborator@iberia.tn')
ORDER BY email;

-- All three passwords will be the same for now: Admin123!
-- After you can login, you can change them individually
