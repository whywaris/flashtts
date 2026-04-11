import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export const revalidate = 0

export const metadata = {
  title: 'Blog | FlashTTS',
  description: 'Latest insights, guides, and tutorials on AI text-to-speech from the FlashTTS team.',
}

export default async function BlogPage() {
  const supabase = await createClient()
  
  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  if (error) {
    console.error('Blog fetch error:', error)
  }

  const gradients = [
    'linear-gradient(135deg, #ff4d1c, #ff8c42)',
    'linear-gradient(135deg, #5b21b6, #7c3aed)',
    'linear-gradient(135deg, #0d9488, #14b8a6)',
    'linear-gradient(135deg, #db2777, #ec4899)',
    'linear-gradient(135deg, #111827, #374151)',
  ]

  function getReadTime(content: string) {
    const words = content?.split(' ').length || 200
    return Math.ceil(words / 200)
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    })
  }

  return (
      <div style={{ minHeight: '100vh', background: '#faf8f3', color: '#0a0a0f', fontFamily: "'Geist', sans-serif" }}>
        <Navbar />

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 24px' }}>
          
          {/* Header */}
          <div style={{ marginBottom: '48px', textAlign: 'center' }}>
            <span style={{ background: 'rgba(255, 77, 28, 0.1)', color: '#ff4d1c', padding: '4px 14px', borderRadius: '99px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              BLOG
            </span>
            <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: '48px', fontWeight: 700, color: '#0a0a0f', margin: '16px 0 12px', lineHeight: 1.2 }}>
              Insights & Guides
            </h1>
            <p style={{ fontSize: '18px', color: '#6b6878', maxWidth: '500px', margin: '0 auto' }}>
              Tips, tutorials and news from the FlashTTS team
            </p>
          </div>

          {/* No posts state */}
          {(!posts || posts.length === 0) && (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
              <div style={{ fontSize: '18px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>No posts yet</div>
              <div style={{ fontSize: '14px', color: '#9ca3af' }}>Check back soon for articles and guides</div>
            </div>
          )}

          {/* Featured post */}
          {posts && posts.length > 0 && (
            <Link href={`/blog/${posts[0].slug}`} style={{ textDecoration: 'none', display: 'block', marginBottom: '40px' }}>
              <div className="featured-card" style={{
                background: '#ffffff', border: '1px solid #e9ecef',
                borderRadius: '24px', overflow: 'hidden',
                display: 'grid', gridTemplateColumns: '1fr 1fr',
                transition: 'all 0.3s ease',
              }}>
                <div style={{
                  height: '320px',
                  background: posts[0].cover_image ? `url(${posts[0].cover_image}) center/cover` : gradients[0],
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '48px',
                }}>
                  {!posts[0].cover_image && '⚡'}
                </div>
                <div style={{ padding: '40px' }}>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    <span style={{ background: 'rgba(255, 77, 28, 0.1)', color: '#ff4d1c', padding: '3px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 700 }}>FEATURED</span>
                  </div>
                  <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: '26px', fontWeight: 700, color: '#0a0a0f', marginBottom: '12px', lineHeight: 1.3 }}>
                    {posts[0].title}
                  </h2>
                  <p style={{ fontSize: '15px', color: '#6b6878', lineHeight: 1.6, marginBottom: '20px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {posts[0].excerpt || posts[0].content?.replace(/<[^>]*>/g, '').slice(0, 200)}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', color: 'rgba(10,10,15,0.4)', marginBottom: '20px' }}>
                    <span>FlashTTS Team</span>
                    <span>•</span>
                    <span>{formatDate(posts[0].published_at || posts[0].created_at)}</span>
                    <span>•</span>
                    <span>{getReadTime(posts[0].content || '')} min read</span>
                  </div>
                  <span style={{ display: 'inline-block', padding: '10px 20px', background: '#f5c518', color: '#000', borderRadius: '10px', fontSize: '13px', fontWeight: 700 }}>
                    Read Article →
                  </span>
                </div>
              </div>
            </Link>
          )}

          {/* Posts grid */}
          {posts && posts.length > 1 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              {posts.slice(1).map((post, i) => (
                <Link key={post.id} href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
                  <div className="grid-card" style={{
                    background: '#ffffff', border: '1px solid rgba(10,10,15,0.08)',
                    borderRadius: '20px', overflow: 'hidden',
                    transition: 'all 0.3s ease', height: '100%',
                  }}>
                    <div style={{
                      height: '180px',
                      background: post.cover_image ? `url(${post.cover_image}) center/cover` : gradients[(i + 1) % gradients.length],
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '36px',
                    }}>
                      {!post.cover_image && '⚡'}
                    </div>
                    <div style={{ padding: '20px' }}>
                      <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: '1.2rem', fontWeight: 700, color: '#0a0a0f', marginBottom: '8px', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {post.title}
                      </h3>
                      <p style={{ fontSize: '13px', color: '#6b6878', lineHeight: 1.5, marginBottom: '14px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {post.excerpt || post.content?.replace(/<[^>]*>/g, '').slice(0, 120)}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: 'rgba(10,10,15,0.4)' }}>
                        <span>{formatDate(post.published_at || post.created_at)}</span>
                        <span>•</span>
                        <span>{getReadTime(post.content || '')} min read</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

        </div>

        <Footer />
      </div>
  )
}
