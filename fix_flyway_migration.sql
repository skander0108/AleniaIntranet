-- INSTRUCTIONS TO FIX FLYWAY MIGRATION CONFLICT
-- Run these commands in your PostgreSQL database (using pgAdmin, DBeaver, or psql)

-- 1. Delete the failed V4 migration record
DELETE FROM flyway_schema_history WHERE version = '4' AND success = false;

-- 2. (Optional) If you want to see the current migration status first:
-- SELECT * FROM flyway_schema_history ORDER BY installed_rank;

-- 3. After deleting the failed record, restart your Spring Boot application
-- and Flyway will re-run the V4 migration with the updated script
