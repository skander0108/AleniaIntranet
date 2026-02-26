-- Rename ispring_email column to email to match JPA entity
DO $$
BEGIN
    -- Check if 'ispring_email' column exists and 'email' does not
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='lms_user_map' AND column_name='ispring_email') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='lms_user_map' AND column_name='email') THEN
        
        ALTER TABLE lms_user_map RENAME COLUMN ispring_email TO email;
        
    END IF;

    -- Fallback: If 'email' still doesn't exist (e.g. neither did), create it
     IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='lms_user_map' AND column_name='email') THEN
        ALTER TABLE lms_user_map ADD COLUMN email VARCHAR(255);
     END IF;
END $$;
