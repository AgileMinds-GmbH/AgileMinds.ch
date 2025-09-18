/*
  # Add SSL/TLS configuration columns to email_config table

  1. Changes
    - Add smtp_secure column for SSL configuration
    - Add smtp_tls_enabled column for STARTTLS support
    - Set default values for existing rows
*/

-- Add new columns if they don't exist
ALTER TABLE email_config
ADD COLUMN IF NOT EXISTS smtp_secure boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS smtp_tls_enabled boolean DEFAULT true;

-- Update existing rows with default values
UPDATE email_config
SET 
  smtp_secure = false,
  smtp_tls_enabled = true
WHERE smtp_secure IS NULL OR smtp_tls_enabled IS NULL;