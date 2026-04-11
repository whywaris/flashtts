-- Allow public (anon) to read published posts
DROP POLICY IF EXISTS "Public read published" ON blog_posts;

CREATE POLICY "Public read published"
  ON blog_posts
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');
