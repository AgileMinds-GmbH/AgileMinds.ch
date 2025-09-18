-- Add new TLS configuration columns
ALTER TABLE email_config
ADD COLUMN IF NOT EXISTS smtp_tls_min_version text DEFAULT 'TLSv1.2',
ADD COLUMN IF NOT EXISTS smtp_tls_ciphers text DEFAULT 'HIGH:MEDIUM:!aNULL:!eNULL:!NULL:!DH:!EDH:!RC4',
ADD COLUMN IF NOT EXISTS smtp_tls_reject_unauthorized boolean DEFAULT true;

-- Update existing rows with default values
UPDATE email_config
SET 
  smtp_tls_min_version = 'TLSv1.2',
  smtp_tls_ciphers = 'HIGH:MEDIUM:!aNULL:!eNULL:!NULL:!DH:!EDH:!RC4',
  smtp_tls_reject_unauthorized = true
WHERE smtp_tls_min_version IS NULL 
   OR smtp_tls_ciphers IS NULL 
   OR smtp_tls_reject_unauthorized IS NULL;