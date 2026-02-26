-- Add Boondmanager, Talentia, Alenia Pulse to External Hubs

INSERT INTO quick_links (id, label, url, is_active, user_id, description, icon) VALUES
(gen_random_uuid(), 'Boondmanager', 'https://ui.boondmanager.com', true, NULL, 'ERP Management', 'work'),
(gen_random_uuid(), 'Talentia', 'https://www.talentia-software.com', true, NULL, 'HR & Financial', 'people'),
(gen_random_uuid(), 'Alenia Pulse', '#', true, NULL, 'Internal Network', 'hub');
