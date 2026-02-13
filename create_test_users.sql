-- Manual script to create 3 test users for authentication
-- Run this in your PostgreSQL database

-- First, clean up any existing test users (if they exist)
DELETE FROM user_roles WHERE user_id IN (
    SELECT id FROM users WHERE email IN ('admin@iberia.tn', 'manager@iberia.tn', 'collaborator@iberia.tn')
);
DELETE FROM users WHERE email IN ('admin@iberia.tn', 'manager@iberia.tn', 'collaborator@iberia.tn');

-- Insert Admin User
INSERT INTO users (id, full_name, email, password, is_active)
VALUES (
    'a1111111-1111-1111-1111-111111111111'::uuid,
    'Admin User',
    'admin@iberia.tn',
    '$2a$10$xQWz5K3YHGk8YKGZvH7YXO7zR5fJ8qL0HwIqF9xJ8vH7YXO7zR5fJ8',  -- Password: Admin123!
    true
);

-- Insert Admin Role
INSERT INTO user_roles (id, user_id, role)
VALUES (
    'r1111111-1111-1111-1111-111111111111'::uuid,
    'a1111111-1111-1111-1111-111111111111'::uuid,
    'ADMIN'
);

-- Insert Manager User
INSERT INTO users (id, full_name, email, password, is_active)
VALUES (
    'a2222222-2222-2222-2222-222222222222'::uuid,
    'Manager User',
    'manager@iberia.tn',
    '$2a$10$xQWz5K3YHGk8YKGZvH7YXO7zR5fJ8qL0HwIqF9xJ8vH7YXO7zR5fJ8',  -- Password: Manager123!
    true
);

-- Insert Manager Role
INSERT INTO user_roles (id, user_id, role)
VALUES (
    'r2222222-2222-2222-2222-222222222222'::uuid,
    'a2222222-2222-2222-2222-222222222222'::uuid,
    'MANAGER'
);

-- Insert Collaborator User
INSERT INTO users (id, full_name, email, password, is_active)
VALUES (
    'a3333333-3333-3333-3333-333333333333'::uuid,
    'Collaborator User',
    'collaborator@iberia.tn',
    '$2a$10$xQWz5K3YHGk8YKGZvH7YXO7zR5fJ8qL0HwIqF9xJ8vH7YXO7zR5fJ8',  -- Password: User123!
    true
);

-- Insert Collaborator Role
INSERT INTO user_roles (id, user_id, role)
VALUES (
    'r3333333-3333-3333-3333-333333333333'::uuid,
    'a3333333-3333-3333-3333-333333333333'::uuid,
    'COLLABORATOR'
);

-- Verify the users were created
SELECT u.email, u.full_name, ur.role 
FROM users u 
JOIN user_roles ur ON u.id = ur.user_id 
WHERE u.email IN ('admin@iberia.tn', 'manager@iberia.tn', 'collaborator@iberia.tn')
ORDER BY u.email;
