/*
  # Create course images storage tables

  1. Tables
    - Creates a buckets table to store bucket metadata
    - Creates an objects table to store file metadata
    - Adds necessary indexes and constraints

  2. Security
    - Enables RLS on both tables
    - Adds policies for public read access
    - Adds policies for authenticated write access
*/

-- Create buckets table
CREATE TABLE IF NOT EXISTS storage_buckets (
  id text PRIMARY KEY,
  name text NOT NULL,
  owner uuid REFERENCES auth.users,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  public boolean DEFAULT false,
  file_size_limit bigint, -- in bytes
  allowed_mime_types text[]
);

-- Create objects table
CREATE TABLE IF NOT EXISTS storage_objects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket_id text REFERENCES storage_buckets(id),
  name text NOT NULL,
  owner uuid REFERENCES auth.users,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_accessed_at timestamptz DEFAULT now(),
  metadata jsonb,
  path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/')) STORED,
  size bigint,
  mime_type text,
  etag text,
  is_uploaded boolean DEFAULT false
);

-- Add indexes
CREATE INDEX idx_storage_objects_name ON storage_objects(name);
CREATE INDEX idx_storage_objects_bucket_id ON storage_objects(bucket_id);
CREATE INDEX idx_storage_objects_path_tokens ON storage_objects USING gin(path_tokens);

-- Enable RLS
ALTER TABLE storage_buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_objects ENABLE ROW LEVEL SECURITY;

-- Create course-images bucket
INSERT INTO storage_buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
) VALUES (
  'course-images',
  'course-images',
  true,
  2097152, -- 2MB in bytes
  ARRAY['image/jpeg', 'image/png']
) ON CONFLICT (id) DO NOTHING;

-- Policies for buckets
CREATE POLICY "Buckets are publicly accessible"
  ON storage_buckets FOR SELECT
  USING (true);

CREATE POLICY "Users can create buckets"
  ON storage_buckets FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own buckets"
  ON storage_buckets FOR UPDATE
  TO authenticated
  USING (owner = auth.uid())
  WITH CHECK (owner = auth.uid());

-- Policies for objects
CREATE POLICY "Objects are publicly accessible"
  ON storage_objects FOR SELECT
  USING (
    bucket_id = 'course-images' OR
    (bucket_id IN (
      SELECT id FROM storage_buckets
      WHERE public = true
    ))
  );

CREATE POLICY "Users can upload objects"
  ON storage_objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'course-images' AND
    (CASE
      WHEN mime_type = 'image/jpeg' THEN true
      WHEN mime_type = 'image/png' THEN true
      ELSE false
    END)
  );

CREATE POLICY "Users can update their own objects"
  ON storage_objects FOR UPDATE
  TO authenticated
  USING (owner = auth.uid())
  WITH CHECK (owner = auth.uid());

CREATE POLICY "Users can delete their own objects"
  ON storage_objects FOR DELETE
  TO authenticated
  USING (owner = auth.uid());