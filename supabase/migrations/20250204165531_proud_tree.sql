/*
  # Fix spots available count for courses

  1. Changes
    - Updates spots_available for all courses based on actual enrollment count
*/

DO $$ 
DECLARE
  course_record RECORD;
BEGIN
  FOR course_record IN 
    SELECT 
      c.id,
      c.spots_available as current_spots,
      14 - COUNT(e.id) as correct_spots
    FROM courses c
    LEFT JOIN enrollments e ON c.id = e.course_id
    GROUP BY c.id, c.spots_available
    HAVING c.spots_available != (14 - COUNT(e.id))
  LOOP
    UPDATE courses 
    SET spots_available = course_record.correct_spots
    WHERE id = course_record.id;
  END LOOP;
END $$;