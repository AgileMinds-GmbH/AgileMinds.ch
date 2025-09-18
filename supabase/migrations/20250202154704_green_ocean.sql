/*
  # CMS Schema Implementation

  1. New Tables
    - `courses`
      - Core course information
      - Status management
      - SEO metadata
    - `course_sections`
      - Modular course content storage
      - Ordered sections with rich text
    - `team_members`
      - Team member profiles
      - Social links and expertise
    - `team_member_expertise`
      - Many-to-many relationship for expertise areas
    - `expertise_areas`
      - Reusable expertise categories

  2. Security
    - Enable RLS on all tables
    - Admin-only write access
    - Public read access for published content
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Courses Table
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text NOT NULL,
  thumbnail_url text,
  duration text NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  price decimal(10,2) NOT NULL,
  instructor_id uuid REFERENCES auth.users(id),
  spots_available integer NOT NULL DEFAULT 14,
  language text NOT NULL,
  skill_level text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  -- SEO fields
  meta_title text,
  meta_description text,
  meta_keywords text[],
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  published_at timestamptz,
  -- Version control
  version integer DEFAULT 1,
  is_latest boolean DEFAULT true
);

-- Course Sections Table
CREATE TABLE IF NOT EXISTS course_sections (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Team Members Table
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id uuid REFERENCES auth.users(id),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  bio text NOT NULL,
  profile_image_url text,
  email text UNIQUE,
  phone text,
  linkedin_url text,
  twitter_url text,
  github_url text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Expertise Areas Table
CREATE TABLE IF NOT EXISTS expertise_areas (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Team Member Expertise Junction Table
CREATE TABLE IF NOT EXISTS team_member_expertise (
  team_member_id uuid REFERENCES team_members(id) ON DELETE CASCADE,
  expertise_id uuid REFERENCES expertise_areas(id) ON DELETE CASCADE,
  PRIMARY KEY (team_member_id, expertise_id),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE expertise_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_member_expertise ENABLE ROW LEVEL SECURITY;

-- Policies for courses
CREATE POLICY "Enable read access for published courses"
  ON courses FOR SELECT
  USING (status = 'published');

CREATE POLICY "Enable admin write access for courses"
  ON courses FOR ALL
  USING (auth.role() = 'authenticated');

-- Policies for course sections
CREATE POLICY "Enable read access for published course sections"
  ON course_sections FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = course_sections.course_id
    AND courses.status = 'published'
  ));

CREATE POLICY "Enable admin write access for course sections"
  ON course_sections FOR ALL
  USING (auth.role() = 'authenticated');

-- Policies for team members
CREATE POLICY "Enable read access for active team members"
  ON team_members FOR SELECT
  USING (status = 'active');

CREATE POLICY "Enable admin write access for team members"
  ON team_members FOR ALL
  USING (auth.role() = 'authenticated');

-- Policies for expertise areas
CREATE POLICY "Enable read access for expertise areas"
  ON expertise_areas FOR SELECT
  TO PUBLIC USING (true);

CREATE POLICY "Enable admin write access for expertise areas"
  ON expertise_areas FOR ALL
  USING (auth.role() = 'authenticated');

-- Policies for team member expertise
CREATE POLICY "Enable read access for team member expertise"
  ON team_member_expertise FOR SELECT
  TO PUBLIC USING (true);

CREATE POLICY "Enable admin write access for team member expertise"
  ON team_member_expertise FOR ALL
  USING (auth.role() = 'authenticated');

-- Functions
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_course_sections_updated_at
  BEFORE UPDATE ON course_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON team_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Indexes
CREATE INDEX idx_courses_slug ON courses(slug);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_courses_instructor ON courses(instructor_id);
CREATE INDEX idx_course_sections_course ON course_sections(course_id);
CREATE INDEX idx_course_sections_order ON course_sections(course_id, order_index);
CREATE INDEX idx_team_members_slug ON team_members(slug);
CREATE INDEX idx_team_members_status ON team_members(status);
CREATE INDEX idx_expertise_areas_name ON expertise_areas(name);