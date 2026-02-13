-- Check if new_joiners table has bytea columns
SELECT 
    column_name,
    data_type,
    CASE 
        WHEN data_type = 'bytea' THEN '⚠️ BYTEA (PROBLEM!)'
        ELSE '✓ OK'
    END as status
FROM information_schema.columns
WHERE table_name = 'new_joiners'
  AND column_name IN ('full_name', 'job_title', 'department', 'location', 'photo_url')
ORDER BY column_name;
