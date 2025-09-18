/*
  # Add course content fields

  1. New Fields
    - learning_objectives: Array of learning objectives for the course
    - prerequisites: Array of prerequisites for the course
    - materials: Array of course materials
  
  2. Changes
    - Add new fields to courses table
*/

ALTER TABLE courses
ADD COLUMN IF NOT EXISTS learning_objectives text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS prerequisites text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS materials text[] DEFAULT '{}';