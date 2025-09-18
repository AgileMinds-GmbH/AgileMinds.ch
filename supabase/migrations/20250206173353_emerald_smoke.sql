/*
  # Add early bird prices to courses

  1. Changes
    - Add early bird prices and deadlines to specific courses
    - Set early bird price to 700 CHF (30% discount)
    - Set deadline to 30 days before course start
*/

-- First, update prices to ensure they are valid
UPDATE courses 
SET price = 1000 
WHERE status = 'published' AND price = 0;

-- Then set early bird prices
UPDATE courses
SET 
  early_bird_price = 700,
  early_bird_deadline = start_date - INTERVAL '30 days'
WHERE status = 'published' AND price >= 700;