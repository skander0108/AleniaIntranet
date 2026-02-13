-- Connect to your database and run this query to check if the test users exist

SELECT 
    u.id,
    u.email,
    u.full_name,
    u.is_active,
    string_agg(ur.role::text, ', ') as roles
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
WHERE u.email IN ('admin@iberia.tn', 'manager@iberia.tn', 'collaborator@iberia.tn')
GROUP BY u.id, u.email, u.full_name, u.is_active
ORDER BY u.email;

-- You should see 3 users:
-- admin@iberia.tn (ADMIN)
-- manager@iberia.tn (MANAGER)
-- collaborator@iberia.tn (COLLABORATOR)
