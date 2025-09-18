/*
  # Add CORS configuration table

  1. New Tables
    - `cors_config`
      - `id` (integer, primary key)
      - `allowed_origins` (text[])
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  2. Security
    - Enable RLS on `cors_config` table
    - Add policies for authenticated users
*/

-- Create CORS configuration table
CREATE TABLE IF NOT EXISTS cors_config (
  id integer PRIMARY KEY DEFAULT 1,
  allowed_origins text[] NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Enable RLS
ALTER TABLE cors_config ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for authenticated users"
  ON cors_config FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert/update for authenticated users"
  ON cors_config FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_cors_config_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_cors_config_timestamp
  BEFORE UPDATE ON cors_config
  FOR EACH ROW
  EXECUTE FUNCTION update_cors_config_timestamp();

-- Insert default configuration
INSERT INTO cors_config (id, allowed_origins)
VALUES (1, ARRAY['*'])
ON CONFLICT (id) DO NOTHING;