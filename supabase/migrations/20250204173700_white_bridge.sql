/*
  # Fix spots available count

  1. Changes
    - Updates spots_available for Leading SAFe course (Feb 13-14) to reflect correct count
    - Sets spots_available to 5 based on 9 attendees out of 14 total spots
*/

UPDATE courses
SET spots_available = 5
WHERE title = 'Leading SAFe'
  AND start_date = '2025-02-13'
  AND end_date = '2025-02-14';