-- Rename the existing admin user to hr for databases that already ran V8
UPDATE users 
SET 
    email = 'hr@iberia.tn',
    full_name = 'HR User'
WHERE email = 'admin@iberia.tn';
