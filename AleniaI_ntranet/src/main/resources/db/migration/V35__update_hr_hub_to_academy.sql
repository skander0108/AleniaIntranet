-- Replace Talentia (HR Hub) with Alenia Academy

UPDATE quick_links 
SET label = 'Alenia Academy', 
    url = 'https://aleniaprodacademy.ispring.eu/', 
    description = 'Learning Platform', 
    icon = 'school'
WHERE label = 'Talentia';
