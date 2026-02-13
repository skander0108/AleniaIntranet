-- Verify the column type of ticket_number
-- Run this to check if the fix was applied correctly

SELECT 
    table_name,
    column_name,
    data_type,
    character_maximum_length
FROM 
    information_schema.columns
WHERE 
    table_name = 'it_support_tickets' 
    AND column_name = 'ticket_number';

-- This should return: data_type = 'character varying', character_maximum_length = 50
-- If it returns: data_type = 'bytea', the fix didn't work
