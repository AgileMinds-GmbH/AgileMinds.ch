/*
  # Update Course Archiving Logic

  1. Changes
    - Update archiving logic to use start_date instead of end_date
    - Drop existing trigger and function
    - Create new function and trigger with updated logic
    - Update existing courses

  2. Details
    - Courses will be archived on their start date
    - Prevents same-day bookings
    - Only affects published courses
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS archive_expired_courses ON courses;
DROP FUNCTION IF EXISTS check_course_expiration();

-- Create new function with updated logic
CREATE OR REPLACE FUNCTION check_course_start()
RETURNS TRIGGER AS $$
BEGIN
  -- Archive course if it's published and start date has arrived or passed
  IF NEW.status = 'published' AND NEW.start_date <= CURRENT_DATE THEN
    NEW.status := 'archived';
    NEW.updated_at := now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create new trigger
CREATE TRIGGER archive_started_courses
  BEFORE INSERT OR UPDATE ON courses
  FOR EACH ROW
  EXECUTE FUNCTION check_course_start();

-- Drop old index and create new one
DROP INDEX IF EXISTS idx_courses_end_date_status;
CREATE INDEX idx_courses_start_date_status 
ON courses(start_date, status);

-- Archive any existing courses that have started
UPDATE courses
SET 
  status = 'archived',
  updated_at = now()
WHERE 
  status = 'published' 
  AND start_date <= CURRENT_DATE;