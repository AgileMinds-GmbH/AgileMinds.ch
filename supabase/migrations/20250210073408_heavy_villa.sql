/*
  # Add Default Email Configuration

  1. Changes
    - Insert default row into email_config table
    - This ensures the table always has at least one row with ID 1
*/

-- Insert default configuration if it doesn't exist
INSERT INTO email_config (
  id,
  smtp_host,
  smtp_port,
  smtp_user,
  smtp_password,
  from_email,
  from_name
) VALUES (
  1,
  '',
  '587',
  '',
  '',
  '',
  'EduTech'
) ON CONFLICT (id) DO NOTHING;