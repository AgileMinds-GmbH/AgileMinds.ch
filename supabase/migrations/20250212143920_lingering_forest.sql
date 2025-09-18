-- Add test email fields to email_config table
ALTER TABLE email_config
ADD COLUMN test_email text,
ADD COLUMN last_test_result jsonb,
ADD COLUMN last_test_timestamp timestamptz;

-- Add index for better performance
CREATE INDEX idx_email_config_last_test ON email_config(last_test_timestamp);

-- Update existing rows with default values
UPDATE email_config
SET 
  test_email = '',
  last_test_result = '{}',
  last_test_timestamp = NULL
WHERE test_email IS NULL;