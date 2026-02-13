ALTER TABLE new_joiners
ADD COLUMN cv_file_id VARCHAR(255),
ADD COLUMN cv_file_name VARCHAR(255),
ADD COLUMN cv_mime_type VARCHAR(255),
ADD COLUMN cv_size_bytes BIGINT;
