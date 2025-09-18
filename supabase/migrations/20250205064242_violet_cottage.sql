/*
  # Storage Implementation for Course Images

  1. Tables
    - Creates storage schema and tables
    - Adds necessary indexes for performance
    - Sets up RLS policies

  2. Security
    - Enables RLS on all tables
    - Adds policies for public read access
    - Adds policies for authenticated write access
*/

-- Create schema if not exists
CREATE SCHEMA IF NOT EXISTS storage;

-- Create storage schema tables
CREATE TABLE IF NOT EXISTS storage.buckets (
  id text PRIMARY KEY,
  name text NOT NULL,
  owner uuid REFERENCES auth.users,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  public boolean DEFAULT false,
  avif_autodetection boolean DEFAULT false,
  file_size_limit bigint,
  allowed_mime_types text[]
);

CREATE TABLE IF NOT EXISTS storage.objects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket_id text,
  name text,
  owner uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_accessed_at timestamptz DEFAULT now(),
  metadata jsonb,
  path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/')) STORED,
  version text,
  size bigint,
  mime_type text,
  etag text,
  is_uploaded boolean DEFAULT false,
  CONSTRAINT objects_bucketid_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS bname ON storage.buckets(name);
CREATE INDEX IF NOT EXISTS objects_path_tokens_idx ON storage.objects USING gin(path_tokens);
CREATE INDEX IF NOT EXISTS objects_bucketid_name_idx ON storage.objects(bucket_id, name);

-- Enable RLS
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create course-images bucket
INSERT INTO storage.buckets (
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

-- Bucket Policies
CREATE POLICY "Public Access"
  ON storage.buckets FOR SELECT
  USING (public = true);

CREATE POLICY "Authenticated users can insert buckets"
  ON storage.buckets FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own buckets"
  ON storage.buckets FOR UPDATE
  TO authenticated
  USING (owner = auth.uid());

CREATE POLICY "Users can delete own buckets"
  ON storage.buckets FOR DELETE
  TO authenticated
  USING (owner = auth.uid());

-- Object Policies
CREATE POLICY "Public read access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'course-images');

CREATE POLICY "Authenticated users can upload files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'course-images');

CREATE POLICY "Users can update own files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (owner = auth.uid());

CREATE POLICY "Users can delete own files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (owner = auth.uid());