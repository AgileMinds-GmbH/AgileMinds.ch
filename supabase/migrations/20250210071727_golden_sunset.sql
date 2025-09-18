/*
  # Automatic Course Archiving

  1. Changes
    - Add function to check if a course is expired
    - Add trigger to automatically archive expired published courses
    - Add index on end_date and status for better performance

  2. Details
    - Only published courses will be archived
    - Other statuses (draft, deleted) are not affected
    - Archiving happens automatically when end_date is in the past
*/

-- Create function to check if a course is expired
CREATE OR REPLACE FUNCTION check_course_expiration()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update status if course is published and end date is in the past
  IF NEW.status = 'published' AND NEW.end_date < CURRENT_DATE THEN
    NEW.status := 'archived';
    NEW.updated_at := now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically archive expired courses
CREATE TRIGGER archive_expired_courses
  BEFORE INSERT OR UPDATE ON courses
  FOR EACH ROW
  EXECUTE FUNCTION check_course_expiration();

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_courses_end_date_status 
ON courses(end_date, status);

-- Archive any existing expired published courses
UPDATE courses
SET 
  status = 'archived',
  updated_at = now()
WHERE 
  status = 'published' 
  AND end_date < CURRENT_DATE;