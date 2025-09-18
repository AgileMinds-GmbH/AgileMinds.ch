/*
  # Create admin user and role

  1. Changes
    - Creates an admin role
    - Creates an admin user with email/password authentication
    - Sets up necessary permissions and identity
*/

-- Create admin role if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'admin') THEN
    CREATE ROLE admin;
  END IF;
END
$$;

-- Create admin user if not exists
DO $$
DECLARE
  admin_id uuid;
  provider_id text;
BEGIN
  -- Check if user exists
  SELECT id INTO admin_id
  FROM auth.users
  WHERE email = 'admin@edutech.com';

  -- Create user if not exists
  IF admin_id IS NULL THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'admin@edutech.com',
      crypt('admin123', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"role":"admin"}',
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    )
    RETURNING id INTO admin_id;
  END IF;

  -- Generate a consistent provider_id
  provider_id := encode(sha256(admin_id::text::bytea), 'hex');

  -- Ensure user has identity
  IF NOT EXISTS (
    SELECT 1 
    FROM auth.identities 
    WHERE user_id = admin_id AND provider = 'email'
  ) THEN
    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      admin_id,
      format('{"sub":"%s","email":"%s"}', admin_id::text, 'admin@edutech.com')::jsonb,
      'email',
      provider_id,
      NOW(),
      NOW(),
      NOW()
    );
  END IF;
END
$$;