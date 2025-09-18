-- Insert default configuration if it doesn't exist
INSERT INTO email_config (
  id,
  smtp_host,
  smtp_port,
  smtp_user,
  smtp_password,
  from_email,
  from_name
) VALUES (
  1,
  '',
  '587',
  '',
  '',
  '',
  'EduTech'
) ON CONFLICT (id) DO NOTHING;