/*
  # Add Edge Functions CORS configuration

  1. New Tables
    - `edge_functions_config`
      - `id` (integer, primary key)
      - `function_name` (text)
      - `allowed_origins` (text[])
      - `allowed_methods` (text[])
      - `allowed_headers` (text[])
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  2. Security
    - Enable RLS on `edge_functions_config` table
    - Add policies for authenticated users
*/

-- Create Edge Functions configuration table
CREATE TABLE IF NOT EXISTS edge_functions_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  function_name text NOT NULL UNIQUE,
  allowed_origins text[] NOT NULL DEFAULT ARRAY['*'],
  allowed_methods text[] NOT NULL DEFAULT ARRAY['GET', 'POST', 'OPTIONS'],
  allowed_headers text[] NOT NULL DEFAULT ARRAY['Content-Type', 'Authorization'],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE edge_functions_config ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for authenticated users"
  ON edge_functions_config FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert/update for authenticated users"
  ON edge_functions_config FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_edge_functions_config_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_edge_functions_config_timestamp
  BEFORE UPDATE ON edge_functions_config
  FOR EACH ROW
  EXECUTE FUNCTION update_edge_functions_config_timestamp();

-- Insert default configurations for email functions
INSERT INTO edge_functions_config (function_name, allowed_origins, allowed_methods, allowed_headers)
VALUES 
  ('test-email-config', 
   ARRAY['*'],
   ARRAY['POST', 'OPTIONS'],
   ARRAY['Content-Type', 'Authorization']
  ),
  ('test-email',
   ARRAY['*'],
   ARRAY['POST', 'OPTIONS'],
   ARRAY['Content-Type', 'Authorization']
  ),
  ('send-booking-emails',
   ARRAY['*'],
   ARRAY['POST', 'OPTIONS'],
   ARRAY['Content-Type', 'Authorization']
  )
ON CONFLICT (function_name) DO NOTHING;