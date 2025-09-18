-- Create course audit logs table
CREATE TABLE IF NOT EXISTS course_audit_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  changes jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Add indexes for better query performance
CREATE INDEX idx_course_audit_logs_course_id ON course_audit_logs(course_id);
CREATE INDEX idx_course_audit_logs_user_id ON course_audit_logs(user_id);
CREATE INDEX idx_course_audit_logs_created_at ON course_audit_logs(created_at);

-- Enable RLS
ALTER TABLE course_audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for authenticated users"
  ON course_audit_logs FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert access for authenticated users"
  ON course_audit_logs FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Add audit log function
CREATE OR REPLACE FUNCTION log_course_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO course_audit_logs (
      course_id,
      user_id,
      changes,
      created_at
    ) VALUES (
      NEW.id,
      auth.uid(),
      jsonb_build_object(
        'old_data', to_jsonb(OLD),
        'new_data', to_jsonb(NEW),
        'operation', TG_OP
      ),
      now()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER course_audit_trigger
  AFTER UPDATE ON courses
  FOR EACH ROW
  EXECUTE FUNCTION log_course_change();