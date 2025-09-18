/*
  # Email Configuration Table

  1. New Tables
    - `email_config`
      - `id` (integer, primary key)
      - `smtp_host` (text)
      - `smtp_port` (text)
      - `smtp_user` (text)
      - `smtp_password` (text)
      - `from_email` (text)
      - `from_name` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create email configuration table
CREATE TABLE IF NOT EXISTS email_config (
  id integer PRIMARY KEY DEFAULT 1,
  smtp_host text NOT NULL,
  smtp_port text NOT NULL,
  smtp_user text NOT NULL,
  smtp_password text NOT NULL,
  from_email text NOT NULL,
  from_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Enable RLS
ALTER TABLE email_config ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for authenticated users"
  ON email_config FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert/update for authenticated users"
  ON email_config FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create function to update timestamp
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