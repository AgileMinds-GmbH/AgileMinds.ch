/*
  # Add March 2025 Courses

  1. New Courses
    - SAFe Scrum Master - März 2025
    - Scrum Product Owner - März 2025
    - Leading SAFe - Februar 2025

  2. Changes
    - All courses set as published
    - Standard configuration:
      - Duration: 2 days
      - Time: 09:00 - 17:00
      - Price: 1112
      - Spots: 14
      - Language: German
      - Skill Level: Beginner
*/

INSERT INTO courses (
  title,
  slug,
  description,
  duration,
  start_time,
  end_time,
  start_date,
  end_date,
  price,
  spots_available,
  language,
  skill_level,
  status,
  created_at,
  updated_at
) VALUES
  (
    'SAFe Scrum Master',
    'safe-scrum-master-march-2025',
    'SAFe Scrum Master - März 2025',
    '2 days',
    '09:00',
    '17:00',
    '2025-03-06',
    '2025-03-07',
    1112,
    14,
    'de',
    'beginner',
    'published',
    NOW(),
    NOW()
  ),
  (
    'Scrum Product Owner',
    'scrum-product-owner-march-2025',
    'Scrum Product Owner - März 2025',
    '2 days',
    '09:00',
    '17:00',
    '2025-03-03',
    '2025-03-04',
    1112,
    14,
    'de',
    'beginner',
    'published',
    NOW(),
    NOW()
  ),
  (
    'Leading SAFe',
    'leading-safe-february-2025',
    'Leading SAFe - Februar 2025',
    '2 days',
    '09:00',
    '17:00',
    '2025-02-13',
    '2025-02-14',
    1112,
    14,
    'de',
    'beginner',
    'published',
    NOW(),
    NOW()
  );