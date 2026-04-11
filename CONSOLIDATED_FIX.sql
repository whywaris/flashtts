-- ⚡ FLASHTTS CONSOLIDATED DATABASE FIX
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. FIX PROFILES TABLE COLUMNS
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role text DEFAULT 'user',
ADD COLUMN IF NOT EXISTS full_name text,
ADD COLUMN IF NOT EXISTS plan text DEFAULT 'Free',
ADD COLUMN IF NOT EXISTS credits_limit bigint DEFAULT 5000,
ADD COLUMN IF NOT EXISTS credits_used bigint DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_banned boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS banned_reason text,
ADD COLUMN IF NOT EXISTS username text;

-- 2. CREATE TTS_VOICES TABLE (Standardized Name)
CREATE TABLE IF NOT EXISTS tts_voices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  voice_id text UNIQUE,
  name text NOT NULL,
  language text DEFAULT 'English',
  gender text DEFAULT 'Male',
  description text,
  sample_url text,
  is_active boolean DEFAULT true,
  is_premium boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- 3. ENSURE OTHER TABLES EXIST
CREATE TABLE IF NOT EXISTS saved_voices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  voice_id text,
  name text,
  language text,
  gender text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text,
  author_id uuid REFERENCES auth.users(id),
  status text DEFAULT 'draft',
  created_at timestamp with time zone DEFAULT now()
);

-- 4. FIX YOUR USER (Make Admin & Create Profile)
-- ID from logs: 4fab0162-2cd1-4bdc-b14e-27e3e1cdb161
INSERT INTO profiles (id, role, full_name, plan, credits_limit, credits_used)
VALUES ('4fab0162-2cd1-4bdc-b14e-27e3e1cdb161', 'admin', 'Admin User', 'Pro', 50000, 0)
ON CONFLICT (id) DO UPDATE SET role = 'admin', plan = 'Pro';

-- 5. SEED SOME SAMPLE VOICES
INSERT INTO tts_voices (name, language, gender, description)
VALUES 
('Rachel', 'English', 'Female', 'Professional and clear'),
('Clyde', 'English', 'Male', 'Warm and authoritative'),
('Bella', 'English', 'Female', 'Soft and friendly')
ON CONFLICT DO NOTHING;
