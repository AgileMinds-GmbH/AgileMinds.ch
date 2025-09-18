/*
  # Add confirmation number to enrollments

  1. Changes
    - Add confirmation_number column to enrollments table
    - Add index for faster lookups by confirmation number

  2. Purpose
    - Store booking confirmation numbers for tracking related bookings
    - Enable querying enrollments by confirmation number
    - Group multiple tickets under the same confirmation number
*/

-- Add confirmation number column
ALTER TABLE enrollments 
ADD COLUMN IF NOT EXISTS confirmation_number text;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_enrollments_confirmation_number 
ON enrollments(confirmation_number);