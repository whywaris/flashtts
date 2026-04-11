-- Fix Blog Admin RLS and Schema

-- 1. Ensure all columns exist (based on user request metadata)
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS author_name text,
ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS published_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS seo_title text,
ADD COLUMN IF NOT EXISTS seo_description text,
ADD COLUMN IF NOT EXISTS meta_title text,
ADD COLUMN IF NOT EXISTS meta_description text,
ADD COLUMN IF NOT EXISTS schema_markup jsonb DEFAULT '{}'::jsonb;

-- 2. Enable RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public read published" ON blog_posts;
DROP POLICY IF EXISTS "Admins can do everything" ON blog_posts;
DROP POLICY IF EXISTS "Admin insert" ON blog_posts;
DROP POLICY IF EXISTS "Admin update" ON blog_posts;
DROP POLICY IF EXISTS "Admin delete" ON blog_posts;

-- 4. Create Public Read Policy
CREATE POLICY "Public read published"
  ON blog_posts
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

-- 5. Create Admin Full Access Policy
-- This allows admins to SELECT, INSERT, UPDATE, and DELETE
CREATE POLICY "Admins can do everything"
  ON blog_posts
  FOR ALL 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 6. Optional: Ensure current user is admin (if known)
-- UPDATE profiles SET role = 'admin' WHERE email = 'YOUR_EMAIL@example.com';
