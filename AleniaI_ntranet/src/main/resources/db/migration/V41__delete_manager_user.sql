-- Comprehensive cleanup: dynamically finds and removes ALL references to the manager user
-- This approach queries pg_constraint so we never miss a foreign key again

DO $$
DECLARE
    mgr_id UUID;
    r RECORD;
BEGIN
    -- Look up the manager's user ID
    SELECT id INTO mgr_id FROM users WHERE email = 'manager@iberia.tn';

    -- If the user doesn't exist, nothing to do
    IF mgr_id IS NULL THEN
        RAISE NOTICE 'manager@iberia.tn not found, skipping cleanup';
        RETURN;
    END IF;

    -- Dynamically find ALL foreign key constraints that reference the users table
    -- and clean up or nullify the manager's references in each one
    FOR r IN
        SELECT
            tc.table_name,
            kcu.column_name,
            rc.delete_rule
        FROM information_schema.referential_constraints rc
        JOIN information_schema.table_constraints tc
            ON tc.constraint_name = rc.constraint_name
            AND tc.constraint_schema = rc.constraint_schema
        JOIN information_schema.key_column_usage kcu
            ON kcu.constraint_name = rc.constraint_name
            AND kcu.constraint_schema = rc.constraint_schema
        JOIN information_schema.constraint_column_usage ccu
            ON ccu.constraint_name = rc.unique_constraint_name
            AND ccu.constraint_schema = rc.unique_constraint_schema
        WHERE ccu.table_name = 'users'
          AND ccu.column_name = 'id'
          AND tc.table_name <> 'users'
        ORDER BY tc.table_name
    LOOP
        BEGIN
            -- Try to DELETE rows referencing the manager; if the column is nullable, SET NULL instead
            IF r.delete_rule = 'SET NULL' THEN
                EXECUTE format('UPDATE %I SET %I = NULL WHERE %I = $1', r.table_name, r.column_name, r.column_name) USING mgr_id;
            ELSE
                EXECUTE format('DELETE FROM %I WHERE %I = $1', r.table_name, r.column_name) USING mgr_id;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            -- If anything goes wrong (e.g. cascading issue), just log and continue
            RAISE NOTICE 'Could not clean %.%: %', r.table_name, r.column_name, SQLERRM;
        END;
    END LOOP;

    -- Also handle the self-referencing manager_id column
    BEGIN
        UPDATE users SET manager_id = NULL WHERE manager_id = mgr_id;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;

    -- Finally, delete the user
    DELETE FROM users WHERE id = mgr_id;

    RAISE NOTICE 'manager@iberia.tn (%) successfully removed', mgr_id;
END $$;
