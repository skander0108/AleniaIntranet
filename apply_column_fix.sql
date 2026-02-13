-- This script fixes the bytea column issue in it_support_tickets
-- Run this directly in your PostgreSQL database

-- Check current column types
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'it_support_tickets' 
  AND column_name IN ('ticket_number', 'title', 'description', 'category', 'priority', 'status', 'preferred_contact');

-- Fix ticket_number if it's bytea
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'it_support_tickets' 
          AND column_name = 'ticket_number' 
          AND data_type = 'bytea'
    ) THEN
        ALTER TABLE it_support_tickets 
        ALTER COLUMN ticket_number TYPE VARCHAR(50) USING ticket_number::text;
        RAISE NOTICE 'Fixed ticket_number column type';
    END IF;
END $$;

-- Fix title if it's bytea
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'it_support_tickets' 
          AND column_name = 'title' 
          AND data_type = 'bytea'
    ) THEN
        ALTER TABLE it_support_tickets 
        ALTER COLUMN title TYPE VARCHAR(255) USING title::text;
        RAISE NOTICE 'Fixed title column type';
    END IF;
END $$;

-- Fix description if it's bytea
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'it_support_tickets' 
          AND column_name = 'description' 
          AND data_type = 'bytea'
    ) THEN
        ALTER TABLE it_support_tickets 
        ALTER COLUMN description TYPE TEXT USING description::text;
        RAISE NOTICE 'Fixed description column type';
    END IF;
END $$;

-- Fix category if it's bytea
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'it_support_tickets' 
          AND column_name = 'category' 
          AND data_type = 'bytea'
    ) THEN
        ALTER TABLE it_support_tickets 
        ALTER COLUMN category TYPE VARCHAR(50) USING category::text;
        RAISE NOTICE 'Fixed category column type';
    END IF;
END $$;

-- Fix priority if it's bytea
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'it_support_tickets' 
          AND column_name = 'priority' 
          AND data_type = 'bytea'
    ) THEN
        ALTER TABLE it_support_tickets 
        ALTER COLUMN priority TYPE VARCHAR(50) USING priority::text;
        RAISE NOTICE 'Fixed priority column type';
    END IF;
END $$;

-- Fix status if it's bytea
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'it_support_tickets' 
          AND column_name = 'status' 
          AND data_type = 'bytea'
    ) THEN
        ALTER TABLE it_support_tickets 
        ALTER COLUMN status TYPE VARCHAR(50) USING status::text;
        RAISE NOTICE 'Fixed status column type';
    END IF;
END $$;

-- Fix preferred_contact if it's bytea
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'it_support_tickets' 
          AND column_name = 'preferred_contact' 
          AND data_type = 'bytea'
    ) THEN
        ALTER TABLE it_support_tickets 
        ALTER COLUMN preferred_contact TYPE VARCHAR(255) USING preferred_contact::text;
        RAISE NOTICE 'Fixed preferred_contact column type';
    END IF;
END $$;

-- Verify the fix
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'it_support_tickets' 
  AND column_name IN ('ticket_number', 'title', 'description', 'category', 'priority', 'status', 'preferred_contact')
ORDER BY ordinal_position;
