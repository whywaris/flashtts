export const revalidate = 0;

import React from 'react';
import sanitizeHtml from 'sanitize-html';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ReadingProgress from '../../components/blog/ReadingProgress';
import TableOfContents from '../../components/blog/TableOfContents';
import ShareButtons from '../../components/blog/ShareButtons';
import { 
  Clock, Calendar, User, 
  Twitter, Linkedin, Github, 
  Zap, ChevronRight
} from 'lucide-react';

// --- SEO Metadata Generation ---

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from('blog_posts')
    .select('title, excerpt, cover_image, meta_title, meta_description')
    .eq('slug', slug)
    .single();

  if (!post) return { title: 'Post Not Found | FlashTTS' };

  return {
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt,
    openGraph: {
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt,
      images: post.cover_image ? [post.cover_image] : [],
      type: 'article',
    },
  };
}

// --- Sub-components ---

function SocialIcon({ href, icon: IconComponent }: { href: string, icon: any }) {
  return (
    <Link href={href} className="p-2.5 rounded-lg bg-[#faf8f3] border border-[rgba(10,10,15,0.1)] text-[#6b6878] hover:text-[#ff4d1c] hover:border-[#ff4d1c] transition-all">
      <IconComponent size={14} />
    </Link>
  );
}

const GRADIENTS = [
  'linear-gradient(135deg, #ff4d1c 0%, #ff8c42 100%)',
  'linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%)',
  'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
  'linear-gradient(135deg, #db2777 0%, #ec4899 100%)',
];

function getPlaceholderGradient(id: string) {
  const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % GRADIENTS.length;
  return GRADIENTS[index];
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch current post
  const { data: post, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error) {
    console.error('Post fetch error:', error);
  }

  if (!post) notFound();

  // Fetch related posts (3 others)
  const { data: relatedPosts } = await supabase
    .from('blog_posts')
    .select('id, title, slug, excerpt, cover_image, created_at, published_at, category, content')
    .eq('status', 'published')
    .neq('id', post.id)
    .limit(3);

  const calculateReadTime = (content: string) => {
    const words = content?.split(/\s+/)?.length || 200;
    return Math.ceil(words / 200);
  };

  const publishDate = new Date(post.published_at || post.created_at).toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });

  const fullUrl = `https://flashtts.com/blog/${slug}`;

  return (
    <div className="bg-[#faf8f3] text-[#0a0a0f] font-['Geist',sans-serif] selection:bg-[#ff4d1c] selection:text-white min-h-screen">
      
      <ReadingProgress />

      {/* Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": post.title,
            "description": post.excerpt,
            "image": post.cover_image,
            "datePublished": post.published_at,
            "dateModified": post.updated_at,
            "author": {
              "@type": "Organization",
              "name": "FlashTTS"
            },
            "publisher": {
              "@type": "Organization",
              "name": "FlashTTS",
              "logo": {
                "@type": "ImageObject",
                "url": "https://flashtts.com/logo.png"
              }
            }
          })
        }}
      />

      <Navbar />

      <main className="pt-32 pb-20">
        
        {/* Header Section */}
        <div className="container max-w-[720px] mx-auto px-6 pt-10 pb-16">
          <nav className="flex items-center gap-2 text-[12px] font-bold text-[#6b6878] uppercase tracking-widest mb-8">
            <Link href="/" className="hover:text-[#0a0a0f]">Home</Link>
            <ChevronRight size={12} className="text-[rgba(10,10,15,0.15)]" />
            <Link href="/blog" className="hover:text-[#0a0a0f]">Blog</Link>
            <ChevronRight size={12} className="text-[rgba(10,10,15,0.15)]" />
            <span className="text-[#0a0a0f]">{post.category || 'Article'}</span>
          </nav>

          <div className="inline-flex px-3 py-1 bg-[rgba(255,77,28,0.1)] text-[#ff4d1c] text-[11px] font-black uppercase tracking-[0.15em] rounded-full mb-6">
            {post.category || 'Updates'}
          </div>

          <h1 className="text-3xl md:text-[42px] font-bold font-['Instrument_Serif'] leading-[1.2] text-[#0a0a0f] mb-6">
            {post.title}
          </h1>

          <p className="text-lg md:text-xl text-[#6b7280] leading-relaxed mb-10">
            {post.excerpt}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-6 py-6 border-y border-[rgba(10,10,15,0.08)]">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#ff4d1c] text-white flex items-center justify-center font-black text-xs">
                FT
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black text-[#0a0a0f]">FlashTTS Team</span>
                <div className="flex items-center gap-4 text-[11px] font-bold text-[rgba(10,10,15,0.4)] uppercase tracking-wider">
                  <span className="flex items-center gap-1.5"><Calendar size={13} strokeWidth={2.5} className="text-[#ff4d1c]" /> {publishDate}</span>
                  <span className="flex items-center gap-1.5"><Clock size={13} strokeWidth={2.5} className="text-[#ff4d1c]" /> {calculateReadTime(post.content || '')} min read</span>
                </div>
              </div>
            </div>
            
            <ShareButtons url={fullUrl} title={post.title} variant="meta" />
          </div>
        </div>

        {/* Content Section */}
        <div className="container max-w-[1300px] mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-12 relative">
            
            {/* Left Sidebar - TOC */}
            <aside className="hidden lg:block w-[240px] flex-shrink-0">
               <TableOfContents />
            </aside>

            {/* Center - Content */}
            <div className="flex-1 max-w-[720px] mx-auto lg:mx-0">
              <div className="mb-12">
                {post.cover_image ? (
                  <img 
                    src={post.cover_image} 
                    alt={post.title} 
                    className="w-full h-auto rounded-2xl border border-[#e9ecef] shadow-sm"
                  />
                ) : (
                  <div 
                    className="w-full h-[380px] rounded-2xl flex flex-col items-center justify-center text-white/30"
                    style={{ background: getPlaceholderGradient(post.id) }}
                  >
                    <Zap size={64} fill="currentColor" strokeWidth={0} className="mb-4 opacity-50" />
                    <span className="font-['Syne'] font-black text-3xl tracking-tighter">FLASH</span>
                  </div>
                )}
              </div>

              <article className="prose">
                <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content || '', {
                  allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'h3', 'h4', 'figure', 'figcaption', 'iframe']),
                  allowedAttributes: {
                    ...sanitizeHtml.defaults.allowedAttributes,
                    img: ['src', 'alt', 'width', 'height', 'loading'],
                    iframe: ['src', 'width', 'height', 'allowfullscreen', 'frameborder'],
                    a: ['href', 'target', 'rel'],
                    '*': ['class', 'id', 'style'],
                  },
                  allowedIframeHostnames: ['www.youtube.com', 'player.vimeo.com'],
                }) }} />
              </article>

              {/* Related Posts Section */}
              {relatedPosts && relatedPosts.length > 0 && (
                <div className="mt-24 pt-16 border-t border-[rgba(10,10,15,0.08)]">
                  <h3 className="text-2xl font-bold font-['Instrument_Serif'] mb-12 text-[#0a0a0f]">More from FlashTTS</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {relatedPosts.map((rp) => (
                      <Link key={rp.id} href={`/blog/${rp.slug}`} className="group block">
                        <div className="bg-white rounded-2xl border border-[rgba(10,10,15,0.08)] overflow-hidden transition-all duration-300 hover:shadow-lg h-full flex flex-col">
                          <div className="h-[140px] relative overflow-hidden">
                            {rp.cover_image ? (
                              <img src={rp.cover_image} alt={rp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-white/20" style={{ background: getPlaceholderGradient(rp.id) }}>
                                <Zap size={24} fill="currentColor" strokeWidth={0} className="opacity-50" />
                              </div>
                            )}
                            <span className="absolute top-3 left-3 px-2 py-0.5 bg-white/90 text-[#ff4d1c] text-[8px] font-black uppercase tracking-widest rounded-full shadow-sm">
                              {rp.category || 'Article'}
                            </span>
                          </div>
                          <div className="p-5 flex-1 flex flex-col">
                            <h4 className="font-bold text-[15px] font-['Instrument_Serif'] mb-3 group-hover:text-[#ff4d1c] transition-colors line-clamp-2 leading-snug text-[#0a0a0f]">{rp.title}</h4>
                            <div className="mt-auto pt-4 flex items-center justify-between text-[10px] text-[rgba(10,10,15,0.4)] font-black uppercase tracking-widest">
                              <span>{new Date(rp.published_at || rp.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                              <span className="flex items-center gap-1 font-bold">
                                <Clock size={10} strokeWidth={3} className="text-[#ff4d1c]" /> 
                                {calculateReadTime(rp.content || '')} min
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Sidebar - Author + CTA */}
            <aside className="lg:w-[260px] flex-shrink-0 flex flex-col gap-6">
               <div className="sticky top-[100px] flex flex-col gap-6">
                  
                  {/* Author Card */}
                  <div className="bg-white rounded-2xl border border-[rgba(10,10,15,0.08)] p-6 shadow-sm">
                    <div className="w-14 h-14 rounded-full bg-[#ff4d1c] text-white flex items-center justify-center font-black text-lg mb-4">
                      FT
                    </div>
                    <h4 className="font-bold font-['Instrument_Serif'] text-[#0a0a0f] text-lg mb-1">FlashTTS Team</h4>
                    <p className="text-[13px] text-[#6b6878] mb-5 leading-relaxed">
                      AI voice and audio technology experts. Building the future of text-to-speech.
                    </p>
                    <div className="flex gap-2.5">
                      <SocialIcon href="https://x.com/flashtts" icon={Twitter} />
                      <SocialIcon href="https://www.linkedin.com/company/flashtts" icon={Linkedin} />
                      <SocialIcon href="https://github.com/flashtts" icon={Github} />
                    </div>
                  </div>

                  {/* Share Card */}
                  <div className="bg-white rounded-2xl border border-[rgba(10,10,15,0.08)] p-6 shadow-sm">
                    <h4 className="text-[12px] font-bold font-['Instrument_Serif'] uppercase tracking-[0.2em] text-[#6b6878] mb-4 text-center">
                      Share article
                    </h4>
                    <ShareButtons url={fullUrl} title={post.title} />
                  </div>

                  {/* CTA Card */}
                  <div className="bg-[rgba(255,140,66,0.1)] rounded-3xl border border-[rgba(255,77,28,0.15)] p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#ff4d1c] rounded-full filter blur-[50px] opacity-10 pointer-events-none" />
                    <h4 className="text-xl font-bold font-['Instrument_Serif'] mb-3 leading-tight text-[#0a0a0f]">
                      ⚡ Try FlashTTS Free
                    </h4>
                    <p className="text-[#ff4d1c] text-xs font-bold mb-6 leading-relaxed">
                      10,000 chars/mo. 29 languages. Professional audio in seconds.
                    </p>
                    <Link href="/signup" className="w-full flex items-center justify-center gap-2 py-3 bg-[#ff4d1c] text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-[#ff4d1c]/10 hover:opacity-90 transition-opacity">
                      Start Free →
                    </Link>
                  </div>

               </div>
            </aside>

          </div>
        </div>
      </main>

      <Footer />

    </div>
  );
}
