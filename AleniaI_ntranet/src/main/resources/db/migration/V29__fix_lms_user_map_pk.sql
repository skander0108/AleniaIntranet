-- Fix lms_user_map schema to match JPA entity (add ID column and update PK)
DO $$
BEGIN
    -- Check if 'id' column exists. If not, we assume we need to migrate from V27 schema.
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='lms_user_map' AND column_name='id') THEN
        
        -- 1. Add id column with default UUID
        ALTER TABLE lms_user_map ADD COLUMN id UUID DEFAULT gen_random_uuid();
        
        -- 2. Drop existing Primary Key (likely on local_user_id)
        -- We try to cascade just in case, though standard DROP constraint should work if name is known
        -- V27 created it as PRIMARY KEY inline, so likely lms_user_map_pkey
        ALTER TABLE lms_user_map DROP CONSTRAINT IF EXISTS lms_user_map_pkey CASCADE;
        
        -- 3. Set the new ID as Primary Key
        ALTER TABLE lms_user_map ADD PRIMARY KEY (id);
        
        -- 4. Ensure local_user_id is still unique (as it was the PK before)
        -- Check if constraint exists first to be safe, or just try adding
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_lms_user_map_local_user_id') THEN
             ALTER TABLE lms_user_map ADD CONSTRAINT uq_lms_user_map_local_user_id UNIQUE (local_user_id);
        END IF;

    END IF;
END $$;
