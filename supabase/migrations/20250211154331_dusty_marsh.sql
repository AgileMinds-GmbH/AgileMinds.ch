-- Add logo_url column to courses table
ALTER TABLE courses
ADD COLUMN logo_url text;

-- Add index for faster lookups
CREATE INDEX idx_courses_logo_url ON courses(logo_url);

-- Update existing courses to use thumbnail as logo if available
UPDATE courses 
SET logo_url = thumbnail_url 
WHERE thumbnail_url IS NOT NULL;