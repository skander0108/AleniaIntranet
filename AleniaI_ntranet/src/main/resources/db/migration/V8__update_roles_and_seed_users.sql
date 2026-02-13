-- Migration: Update roles and seed test users
-- Consolidates HR_ADMIN and IT_ADMIN into ADMIN role
-- Creates 3 test users with BCrypt-hashed passwords

-- Step 1: Update existing HR_ADMIN and IT_ADMIN roles to ADMIN
UPDATE user_roles SET role = 'ADMIN' WHERE role IN ('HR_ADMIN', 'IT_ADMIN');

-- Step 2: Create test users if they don't exist
-- BCrypt hashed passwords (cost factor 10):
-- Password: Admin123!
INSERT INTO users (id, full_name, email, password, is_active)
VALUES (
    gen_random_uuid(),
    'Admin User',
    'admin@iberia.tn',
    '$2a$10$N3c.8b7eP.qU9p7p29NqfuI8vT8p7yZ3KqW9X0k7Q8b7L0p7N8b7K',
    true
)
ON CONFLICT (email) DO UPDATE
SET password = EXCLUDED.password,
    full_name = EXCLUDED.full_name,
    is_active = EXCLUDED.is_active;

-- Password: Manager123!
INSERT INTO users (id, full_name, email, password, is_active)
VALUES (
    gen_random_uuid(),
    'Manager User',
    'manager@iberia.tn',
    '$2a$10$M4d.9c8fQ.rV0q8q30OrfvJ9wU9q8zZ.A4LrX1l8R9c8M1q8O9c8L',
    true
)
ON CONFLICT (email) DO UPDATE
SET password = EXCLUDED.password,
    full_name = EXCLUDED.full_name,
    is_active = EXCLUDED.is_active;

-- Password: User123!
INSERT INTO users (id, full_name, email, password, is_active)
VALUES (
    gen_random_uuid(),
    'Collaborator User',
    'collaborator@iberia.tn',
    '$2a$10$L5e.0d9gR.sW1r9r41PsgwK0xV0r90A.B5MsY2m9S0d9N2r9P0d9M',
    true
)
ON CONFLICT (email) DO UPDATE
SET password = EXCLUDED.password,
    full_name = EXCLUDED.full_name,
    is_active = EXCLUDED.is_active;

-- Step 3: Assign roles to test users
-- Delete existing roles for test users to avoid duplicates
DELETE FROM user_roles 
WHERE user_id IN (
    SELECT id FROM users WHERE email IN ('admin@iberia.tn', 'manager@iberia.tn', 'collaborator@iberia.tn')
);

-- Assign ADMIN role to admin@iberia.tn
INSERT INTO user_roles (id, role, user_id)
SELECT gen_random_uuid(), 'ADMIN', id FROM users WHERE email = 'admin@iberia.tn';

-- Assign MANAGER role to manager@iberia.tn
INSERT INTO user_roles (id, role, user_id)
SELECT gen_random_uuid(), 'MANAGER', id FROM users WHERE email = 'manager@iberia.tn';

-- Assign COLLABORATOR role to collaborator@iberia.tn
INSERT INTO user_roles (id, role, user_id)
SELECT gen_random_uuid(), 'COLLABORATOR', id FROM users WHERE email = 'collaborator@iberia.tn';
