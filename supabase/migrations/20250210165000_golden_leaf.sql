/*
  # Fix Email Configuration Table

  1. Changes
    - Drop and recreate email_config table with proper structure
    - Add proper constraints and defaults
    - Set up RLS policies correctly
    - Insert default row
*/

-- First drop existing table and related objects
DROP TABLE IF EXISTS email_config CASCADE;

-- Create email configuration table
CREATE TABLE email_config (
  id integer PRIMARY KEY DEFAULT 1,
  smtp_host text NOT NULL DEFAULT '',
  smtp_port text NOT NULL DEFAULT '587',
  smtp_secure boolean NOT NULL DEFAULT false,
  smtp_tls_enabled boolean NOT NULL DEFAULT true,
  smtp_tls_min_version text NOT NULL DEFAULT 'TLSv1.2',
  smtp_tls_ciphers text NOT NULL DEFAULT 'HIGH:MEDIUM:!aNULL:!eNULL:!NULL:!DH:!EDH:!RC4',
  smtp_tls_reject_unauthorized boolean NOT NULL DEFAULT true,
  smtp_user text NOT NULL DEFAULT '',
  smtp_password text NOT NULL DEFAULT '',
  from_email text NOT NULL DEFAULT '',
  from_name text NOT NULL DEFAULT 'EduTech',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Enable RLS
ALTER TABLE email_config ENABLE ROW LEVEL SECURITY;

-- Create policies with proper checks
CREATE POLICY "Enable read access for authenticated users"
  ON email_config FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON email_config FOR INSERT
  TO authenticated
  WITH CHECK (id = 1);

CREATE POLICY "Enable update for authenticated users"
  ON email_config FOR UPDATE
  TO authenticated
  USING (id = 1)
  WITH CHECK (id = 1);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_email_config_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_email_config_timestamp
  BEFORE UPDATE ON email_config
  FOR EACH ROW
  EXECUTE FUNCTION update_email_config_timestamp();

-- Insert default configuration
INSERT INTO email_config (id) VALUES (1);