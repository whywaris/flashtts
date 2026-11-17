-- Blog metadata fixes (Nov 2026). Run step by step in the Supabase SQL editor for the FlashTTS project.
-- Read each SELECT result before running the UPDATE under it. Slugs/URLs are never changed.
-- Note: if blog_posts has an updated_at trigger, these updates will bump "Last updated" on the touched posts.

-- 0. Overview: every published post with its dates (use this for the re-dating TODO list).
select slug, title, meta_title, published_at, updated_at
from blog_posts
where status = 'published'
order by published_at, slug;

-- 1. Titles/meta containing 2027 (e.g. "Best ElevenLabs Alternatives in 2027") -> 2026.
select slug, title, meta_title, meta_description
from blog_posts
where title ilike '%2027%' or meta_title ilike '%2027%' or meta_description ilike '%2027%';

update blog_posts
set title            = replace(title, '2027', '2026'),
    meta_title       = replace(meta_title, '2027', '2026'),
    meta_description = replace(meta_description, '2027', '2026')
where title ilike '%2027%' or meta_title ilike '%2027%' or meta_description ilike '%2027%';

-- 2. "(Tested)" titles. First see which bodies have audio samples, screenshots or a testing method.
select slug, title,
       content ~* '(<audio|\.mp3|\.wav)'                         as has_audio,
       content ~* '(<img|!\[)'                                    as has_images,
       content ~* '(how we tested|testing method|methodology)'    as has_method
from blog_posts
where title ilike '%(tested)%' or meta_title ilike '%(tested)%';

-- Remove "(Tested)" only where the body has none of the above.
update blog_posts
set title      = trim(regexp_replace(title, '\s*\(tested\)', '', 'gi')),
    meta_title = trim(regexp_replace(meta_title, '\s*\(tested\)', '', 'gi'))
where (title ilike '%(tested)%' or meta_title ilike '%(tested)%')
  and content !~* '(<audio|\.mp3|\.wav|<img|!\[|how we tested|testing method|methodology)';

-- 3. "Best tools" posts that list FlashTTS: add "FlashTTS is our product." at the top.
--    Uses an HTML <p> for HTML posts and a markdown line for markdown posts (the parser switches mode on HTML tags).
select slug, title
from blog_posts
where (title ~* '(best|alternatives|top [0-9]+)') and content ilike '%flashtts%'
  and content not ilike '%FlashTTS is our product%';

update blog_posts
set content = case
  when content ~* '</(p|h1|h2|h3|h4|h5|h6|ul|ol|article|blockquote)>'
    then '<p><em>FlashTTS is our product.</em></p>' || content
  else E'*FlashTTS is our product.*\n\n' || content
end
where (title ~* '(best|alternatives|top [0-9]+)') and content ilike '%flashtts%'
  and content not ilike '%FlashTTS is our product%';

-- 4. Author name stored on posts (pages now always show the founder from lib/siteStats.ts).
update blog_posts set author_name = 'Theo Green' where author_name = 'Avis Littel';

-- 5. MANUAL (body edits, not scripted):
--    /blog/is-ai-voice-allowed-on-youtube-monetization
--    - Replace the screenshot placeholder for YouTube's upload "AI use" / altered-content setting with:
--        <!-- TODO image: YouTube Studio upload > "Altered content" setting screenshot -->
--    - Where the post names YouTube Help / monetization / copyright guidance, wrap those words in a link to the
--      matching support.google.com/youtube page once you have confirmed the exact URL. (TODO: URLs not verified here.)
select slug, position('screenshot' in lower(content)) as screenshot_at
from blog_posts
where slug = 'is-ai-voice-allowed-on-youtube-monetization';
