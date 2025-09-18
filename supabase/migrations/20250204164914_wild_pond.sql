/*
  # Add increment function for spots_available

  1. New Function
    - `increment(spots integer)`: Increments a number by a given value
    - Used for safely incrementing spots_available in courses table

  2. Changes
    - Added a PostgreSQL function for incrementing values
*/

-- Create increment function
CREATE OR REPLACE FUNCTION increment(spots integer)
RETURNS integer
LANGUAGE SQL
AS $$
  SELECT spots + 1;
$$;