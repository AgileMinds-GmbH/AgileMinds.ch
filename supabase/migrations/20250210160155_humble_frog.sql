-- Create email configuration table if it doesn't exist
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

-- Enable RLS if not already enabled
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename = 'email_config'
      AND rowsecurity = true
  ) THEN
    ALTER TABLE email_config ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create policies if they don't exist
DO $$ 
BEGIN
  -- Check and create read policy
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE tablename = 'email_config'
      AND policyname = 'Enable read access for authenticated users'
  ) THEN
    CREATE POLICY "Enable read access for authenticated users"
      ON email_config FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  -- Check and create write policy
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE tablename = 'email_config'
      AND policyname = 'Enable insert/update for authenticated users'
  ) THEN
    CREATE POLICY "Enable insert/update for authenticated users"
      ON email_config FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Create or replace timestamp update function
CREATE OR REPLACE FUNCTION update_email_config_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and create new one
DROP TRIGGER IF EXISTS update_email_config_timestamp ON email_config;
CREATE TRIGGER update_email_config_timestamp
  BEFORE UPDATE ON email_config
  FOR EACH ROW
  EXECUTE FUNCTION update_email_config_timestamp();