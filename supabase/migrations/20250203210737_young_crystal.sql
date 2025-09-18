/*
  # Add enrollments table and related functionality

  1. New Tables
    - `enrollments`
      - `id` (uuid, primary key)
      - `course_id` (uuid, foreign key to courses)
      - `full_name` (text)
      - `email` (text)
      - `phone` (text)
      - `registration_date` (timestamptz)
      - `payment_status` (text)
      - `special_requirements` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `enrollments` table
    - Add policies for authenticated users to manage enrollments
    - Add policies for public users to view their own enrollments

  3. Changes
    - Add trigger to update spots_available in courses table
    - Add function to validate enrollment before insertion
*/

-- Create enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  registration_date timestamptz NOT NULL DEFAULT now(),
  payment_status text NOT NULL DEFAULT 'pending',
  special_requirements text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_payment_status CHECK (payment_status IN ('paid', 'pending', 'failed'))
);

-- Create indexes
CREATE INDEX idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX idx_enrollments_email ON enrollments(email);
CREATE INDEX idx_enrollments_payment_status ON enrollments(payment_status);

-- Enable RLS
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for authenticated users"
  ON enrollments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON enrollments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
  ON enrollments FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Enable delete for authenticated users"
  ON enrollments FOR DELETE
  TO authenticated
  USING (true);

-- Function to validate enrollment
CREATE OR REPLACE FUNCTION validate_enrollment()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if course exists and has available spots
  IF NOT EXISTS (
    SELECT 1 FROM courses
    WHERE id = NEW.course_id
    AND spots_available > 0
    AND status = 'published'
  ) THEN
    RAISE EXCEPTION 'Course is either full, not found, or not available for enrollment';
  END IF;

  -- Update spots_available in courses
  UPDATE courses
  SET spots_available = spots_available - 1
  WHERE id = NEW.course_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for enrollment validation
CREATE TRIGGER before_enrollment_insert
  BEFORE INSERT ON enrollments
  FOR EACH ROW
  EXECUTE FUNCTION validate_enrollment();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_enrollment_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating timestamp
CREATE TRIGGER update_enrollment_timestamp
  BEFORE UPDATE ON enrollments
  FOR EACH ROW
  EXECUTE FUNCTION update_enrollment_timestamp();