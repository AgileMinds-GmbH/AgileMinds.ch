/*
  # Migrate Categories to Database

  1. New Data
    - Insert default categories into expertise_areas table
  2. Changes
    - Add unique constraint to name column
*/

-- Add unique constraint to name column if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conname = 'expertise_areas_name_key'
  ) THEN
    ALTER TABLE expertise_areas ADD CONSTRAINT expertise_areas_name_key UNIQUE (name);
  END IF;
END $$;

-- Insert default categories
INSERT INTO expertise_areas (name, created_at)
VALUES 
  ('Web Development', NOW()),
  ('Data Science', NOW()),
  ('Design', NOW()),
  ('Business', NOW()),
  ('Marketing', NOW()),
  ('Cloud Computing', NOW()),
  ('DevOps', NOW()),
  ('Programming', NOW()),
  ('UX/UI', NOW()),
  ('Agile', NOW()),
  ('Scrum', NOW()),
  ('SAFe', NOW()),
  ('Project Management', NOW()),
  ('Leadership', NOW())
ON CONFLICT (name) DO NOTHING;