import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

// Revalidate sitemap every hour so newly published blog posts appear automatically
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.flashtts.com'

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/text-to-speech`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/voice-cloning`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/audiobook`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/pricing`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/tools`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${baseUrl}/refund`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${baseUrl}/voice-cloning-policy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    // Comparison Pages
    { url: `${baseUrl}/vs`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/vs/elevenlabs`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/vs/murf`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/vs/speechify`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/vs/lovo`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/vs/wellsaid`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/vs/naturalreader`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/vs/cartesia`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/vs/fish-audio`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    // Regional Indic Language Pages
    { url: `${baseUrl}/text-to-speech/hindi`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/text-to-speech/punjabi`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/text-to-speech/marathi`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/text-to-speech/gujarati`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/text-to-speech/kannada`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/text-to-speech/malayalam`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
  ]

  let blogRoutes: MetadataRoute.Sitemap = []
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey)
      const { data: posts, error } = await supabase
        .from('blog_posts')
        .select('slug, published_at, updated_at')
        .or('status.eq.published,is_published.eq.true')

      if (error) {
        console.error('Error fetching blog posts for sitemap:', error)
      } else if (posts && posts.length > 0) {
        blogRoutes = posts
          .filter((post) => post.slug && typeof post.slug === 'string')
          .map((post) => {
            const cleanSlug = post.slug.trim().replace(/^[\/\\]+|[\/\\]+$/g, '')
            const lastModDate = post.updated_at
              ? new Date(post.updated_at)
              : post.published_at
              ? new Date(post.published_at)
              : new Date()

            return {
              url: `${baseUrl}/blog/${cleanSlug}`,
              lastModified: lastModDate,
              changeFrequency: 'weekly' as const,
              priority: 0.7,
            }
          })
      }
    }
  } catch (err) {
    console.error('Failed to generate blog sitemap entries:', err)
  }

  return [...staticRoutes, ...blogRoutes]
}
