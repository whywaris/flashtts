-- Admin Panel Migration

-- 1.-- 1. FIX PROFILES TABLE
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role text DEFAULT 'user',
ADD COLUMN IF NOT EXISTS full_name text,
ADD COLUMN IF NOT EXISTS plan text DEFAULT 'Free',
ADD COLUMN IF NOT EXISTS credits_limit bigint DEFAULT 5000,
ADD COLUMN IF NOT EXISTS credits_used bigint DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_banned boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS banned_reason text,
ADD COLUMN IF NOT EXISTS username text;

-- 2. FIX VOICES TABLE (Rename to match frontend)
CREATE TABLE IF NOT EXISTS tts_voices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  voice_id text UNIQUE, -- External ID if using ElevenLabs
  name text NOT NULL,
  language text DEFAULT 'English',
  gender text DEFAULT 'Male',
  description text,
  sample_url text,
  is_active boolean DEFAULT true,
  is_premium boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- 3. OTHER ADMIN TABLES
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text,
  excerpt text,
  cover_image text,
  author_id uuid REFERENCES auth.users(id),
  status text DEFAULT 'draft',
  tags text[],
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS abuse_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid REFERENCES auth.users(id),
  target_id uuid, -- user or content
  reason text,
  status text DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject text,
  recipient_count int,
  status text,
  created_at timestamp with time zone DEFAULT now()
);

-- 4. MAKE CURRENT USER ADMIN (Optional helper)
-- UPDATE profiles SET role = 'admin' WHERE email = 'YOUR_EMAIL@example.com';
