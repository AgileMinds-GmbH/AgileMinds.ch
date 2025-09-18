/*
  # Add test enrollments for courses

  1. Changes
    - Temporarily disable trigger
    - Add test enrollments for first 5 courses
    - Re-enable trigger
    - Update spots available
*/

-- Temporarily disable the trigger
ALTER TABLE enrollments DISABLE TRIGGER before_enrollment_insert;

-- Get the first 5 course IDs and insert enrollments
WITH first_five_courses AS (
  SELECT id
  FROM courses
  ORDER BY created_at DESC
  LIMIT 5
)
INSERT INTO enrollments (
  course_id,
  full_name,
  email,
  phone,
  registration_date,
  payment_status,
  special_requirements
)
SELECT
  c.id,
  attendee.full_name,
  attendee.email,
  attendee.phone,
  attendee.registration_date,
  attendee.payment_status,
  attendee.special_requirements
FROM first_five_courses c
CROSS JOIN LATERAL (
  VALUES
    -- Course 1 attendees
    (
      'Sarah Johnson',
      'sarah.j@example.com',
      '+41 76 123 45 67',
      NOW() - INTERVAL '5 days',
      'paid',
      'Vegetarian lunch preferred'
    ),
    (
      'Michael Schmidt',
      'michael.s@example.com',
      '+41 77 234 56 78',
      NOW() - INTERVAL '4 days',
      'paid',
      NULL
    ),
    (
      'Emma Weber',
      'emma.w@example.com',
      '+41 78 345 67 89',
      NOW() - INTERVAL '3 days',
      'pending',
      'Gluten-free meals required'
    ),
    -- Course 2 attendees
    (
      'Thomas Müller',
      'thomas.m@example.com',
      '+41 79 456 78 90',
      NOW() - INTERVAL '6 days',
      'paid',
      NULL
    ),
    (
      'Anna Keller',
      'anna.k@example.com',
      '+41 76 567 89 01',
      NOW() - INTERVAL '5 days',
      'failed',
      NULL
    ),
    (
      'David Fischer',
      'david.f@example.com',
      '+41 77 678 90 12',
      NOW() - INTERVAL '4 days',
      'paid',
      'Requires parking space'
    ),
    -- Course 3 attendees
    (
      'Laura Schneider',
      'laura.s@example.com',
      '+41 78 789 01 23',
      NOW() - INTERVAL '7 days',
      'paid',
      NULL
    ),
    (
      'Marco Rossi',
      'marco.r@example.com',
      '+41 79 890 12 34',
      NOW() - INTERVAL '6 days',
      'pending',
      'Needs power outlet for laptop'
    ),
    -- Course 4 attendees
    (
      'Julia Wagner',
      'julia.w@example.com',
      '+41 76 901 23 45',
      NOW() - INTERVAL '8 days',
      'paid',
      NULL
    ),
    (
      'Daniel Meyer',
      'daniel.m@example.com',
      '+41 77 012 34 56',
      NOW() - INTERVAL '7 days',
      'paid',
      'Requires wheelchair access'
    ),
    (
      'Sophie Brunner',
      'sophie.b@example.com',
      '+41 78 123 45 67',
      NOW() - INTERVAL '6 days',
      'pending',
      NULL
    ),
    -- Course 5 attendees
    (
      'Andreas Koch',
      'andreas.k@example.com',
      '+41 79 234 56 78',
      NOW() - INTERVAL '9 days',
      'paid',
      NULL
    ),
    (
      'Nina Huber',
      'nina.h@example.com',
      '+41 76 345 67 89',
      NOW() - INTERVAL '8 days',
      'paid',
      'Dairy-free meals required'
    )
  ) AS attendee(
    full_name,
    email,
    phone,
    registration_date,
    payment_status,
    special_requirements
  );

-- Update spots_available for the courses
UPDATE courses c
SET spots_available = 14 - (
  SELECT COUNT(*)
  FROM enrollments e
  WHERE e.course_id = c.id
)
WHERE id IN (
  SELECT course_id
  FROM enrollments
);

-- Re-enable the trigger
ALTER TABLE enrollments ENABLE TRIGGER before_enrollment_insert;