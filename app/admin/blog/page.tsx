'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import sanitizeHtml from 'sanitize-html'
import toast, { Toaster } from 'react-hot-toast'
import {
  Plus, Edit3, Trash2, Globe, Eye,
  Calendar, Info, ArrowLeft, Image as ImageIcon,
  CheckCircle2, Clock, FileText, Layout, ChevronRight,
  MoreVertical, Search, Save, X, ExternalLink
} from 'lucide-react'
import Link from 'next/link'

const ALLOWED_HTML_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'iframe']),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    img: ['src', 'alt', 'width', 'height'],
    iframe: ['src', 'width', 'height', 'frameborder', 'allowfullscreen'],
    '*': ['class', 'id'],
  },
  allowedSchemes: ['https', 'http', 'mailto'],
}

interface BlogPost {
  id?: string
  title: string
  slug: string
  content: string
  excerpt: string
  cover_image: string
  author_id?: string
  author_name?: string
  tags?: string
  is_published?: boolean
  published_at?: string
  seo_title?: string
  seo_description?: string
  status: 'draft' | 'published' | 'scheduled'
  meta_title: string
  meta_description: string
  schema_markup?: any
  created_at?: string
  updated_at?: string
}

const INITIAL_POST: BlogPost = {
  title: '', slug: '', content: '', excerpt: '',
  cover_image: '', status: 'draft',
  meta_title: '', meta_description: '',
  schema_markup: '', tags: '',
  seo_title: '', seo_description: ''
}

export default function BlogManager() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showSEO, setShowSEO] = useState(false)
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null)
  
  // Individual field states for better persistence
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [schemaMarkup, setSchemaMarkup] = useState('')
  const [status, setStatus] = useState<'draft' | 'published' | 'scheduled'>('draft')
  const [scheduledDate, setScheduledDate] = useState('')
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    fetchPosts()
    fetchProfile()
  }, [])

  async function fetchProfile() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
      setProfile(data)
    }
  }

  async function fetchPosts() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) console.error('Fetch posts error:', error)
    if (!error) setPosts(data || [])
    setLoading(false)
  }

  function handleCreateNew() {
    setEditingPost(null)
    setIsAddingNew(true)
    setTitle('')
    setSlug('')
    setContent('')
    setExcerpt('')
    setCoverImage('')
    setMetaTitle('')
    setMetaDescription('')
    setSchemaMarkup('')
    setStatus('draft')
    setScheduledDate('')
  }

  function handleEdit(post: BlogPost) {
    setEditingPost(post)
    setIsAddingNew(false)
    setTitle(post.title || '')
    setSlug(post.slug || '')
    setContent(post.content || '')
    setExcerpt(post.excerpt || '')
    setCoverImage(post.cover_image || '')
    setMetaTitle(post.meta_title || '')
    setMetaDescription(post.meta_description || '')
    
    const markup = typeof post.schema_markup === 'object' 
      ? JSON.stringify(post.schema_markup, null, 2) 
      : post.schema_markup || ''
    setSchemaMarkup(markup)
    
    setStatus(post.status || 'draft')
    setScheduledDate(post.published_at ? new Date(post.published_at).toISOString().slice(0, 16) : '')
  }

  function handleTitleChange(val: string) {
    setTitle(val)
    if (!editingPost?.id) {
      const generatedSlug = val.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
      setSlug(generatedSlug)
    }
  }

  async function handleSave(newStatus: string) {
    if (!title.trim()) { toast.error('Title is required'); return }
    if (!slug.trim()) { toast.error('Slug is required'); return }

    setSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { toast.error('Not logged in'); return }

      const postData: any = {
        title: title,
        slug: slug,
        content: sanitizeHtml(content, ALLOWED_HTML_OPTIONS),
        excerpt: excerpt,
        cover_image: coverImage || null,
        meta_title: metaTitle || null,
        meta_description: metaDescription || null,
        seo_title: metaTitle || title,
        seo_description: metaDescription || excerpt,
        author_id: user.id,
        author_name: profile?.full_name || user.email,
        status: newStatus,
        is_published: newStatus === 'published',
        updated_at: new Date().toISOString(),
        tags: [], // Could be expanded to a tags input later
      }

      // Handle schema markup safely
      if (schemaMarkup && schemaMarkup.trim()) {
        try {
          postData.schema_markup = JSON.parse(schemaMarkup)
        } catch {
          postData.schema_markup = {}
        }
      } else {
        postData.schema_markup = {}
      }

      // Set published_at
      if (newStatus === 'published') {
        postData.published_at = editingPost?.published_at || new Date().toISOString()
      } else if (newStatus === 'scheduled' && scheduledDate) {
        postData.published_at = new Date(scheduledDate).toISOString()
      }

      let result
      if (editingPost?.id) {
        result = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', editingPost.id)
          .select()
      } else {
        result = await supabase
          .from('blog_posts')
          .insert(postData)
          .select()
      }

      if (result.error) {
        console.error('Save error:', result.error)
        toast.error('Error saving: ' + result.error.message)
        return
      }

      if (!editingPost?.id && result.data?.[0]) {
        setEditingPost(result.data[0])
      }

      toast.success(
        newStatus === 'published' ? 'Published successfully!' :
        newStatus === 'scheduled' ? 'Scheduled!' :
        'Draft saved!'
      )
      await fetchPosts()

    } catch (err: any) {
      console.error(err)
      toast.error('Unexpected error: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from('blog_posts').delete().eq('id', id)
    if (!error) {
      setPosts(posts.filter(p => p.id !== id))
      if (editingPost?.id === id) handleCreateNew()
      toast.success('Post deleted')
    } else {
      toast.error('Failed to delete post')
    }
    setDeleteModalId(null)
  }

  if (loading) return <div className="text-gray-400 font-medium">Fetching publications...</div>

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Toaster position="top-right" />

      {/* Delete Confirm Modal */}
      {deleteModalId && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-[20px] p-8 border border-[#e9ecef] shadow-2xl space-y-5">
            <h2 className="text-lg font-black font-['Syne'] text-[#111827] m-0">Delete Post?</h2>
            <p className="text-sm text-[#6b7280]">This will permanently delete the post. This action cannot be undone.</p>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setDeleteModalId(null)} className="flex-1 py-3 text-xs font-black uppercase text-[#6b7280] hover:bg-[#f8f9fa] rounded-xl transition-colors">Cancel</button>
              <button onClick={() => handleDelete(deleteModalId)} className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-black text-xs uppercase hover:bg-rose-700 transition-all">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-2">
        <div>
           <h1 className="text-2xl font-black font-['Syne'] tracking-tight m-0 text-[#111827]">Publication Hub</h1>
           <p className="text-[#6b7280] text-[13px] font-medium mt-1">Strategic content management and search optimization.</p>
        </div>
        <button 
          onClick={handleCreateNew}
          className="flex items-center gap-2 px-6 py-3 bg-[#f5c518] text-[#111827] rounded-xl font-black text-xs tracking-widest uppercase shadow-xl shadow-yellow-500/20 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <Plus size={18} strokeWidth={3} /> NEW PUBLICATION
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 min-h-[700px]">
        {/* Left: Posts List (30%) */}
        <aside className="w-full lg:w-[360px] flex flex-col gap-4 shrink-0">
          <div className="bg-white border border-[#e9ecef] rounded-[24px] p-6 shadow-sm flex flex-col h-full sticky top-[100px]">
            <div className="flex items-center justify-between mb-6 px-1">
              <span className="text-[10px] font-black text-[#6b7280] uppercase tracking-widest">Article Inventory ({posts.length})</span>
              <Search size={14} className="text-[#9ca3af]" />
            </div>

            <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar flex-1">
              {posts.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-[#f1f3f5] rounded-3xl">
                   <div className="w-12 h-12 bg-[#f8f9fa] rounded-full flex items-center justify-center mx-auto mb-4 text-[#9ca3af]">
                      <FileText size={20} />
                   </div>
                   <p className="text-[10px] font-black text-[#9ca3af] uppercase tracking-widest">Null Set</p>
                </div>
              ) : posts.map(post => {
                const isSelected = editingPost?.id === post.id
                const statusColor = post.status === 'published' ? 'bg-[#dcfce7] text-[#166534]' : post.status === 'scheduled' ? 'bg-[#dbeafe] text-[#1d4ed8]' : 'bg-[#f3f4f6] text-[#374151]'
                
                return (
                  <div 
                    key={post.id} 
                    onClick={() => handleEdit(post)}
                    className={`
                      p-4 rounded-2xl border transition-all cursor-pointer group relative
                      ${isSelected ? 'bg-[#fffbeb] border-[#f5c518] shadow-lg shadow-yellow-500/5' : 'bg-white border-[#e9ecef] hover:border-[#f5c518]/30'}
                    `}
                  >
                    <div className="flex items-start justify-between mb-3">
                       <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter shadow-sm ${statusColor}`}>
                          {post.status}
                       </span>
                       <span className="text-[10px] font-bold text-[#9ca3af]">{new Date(post.created_at!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                    <h3 className={`text-[13.5px] font-black leading-tight line-clamp-2 transition-colors ${isSelected ? 'text-[#111827]' : 'text-[#374151] group-hover:text-[#111827]'}`}>
                       {post.title || 'Untitled Draft'}
                    </h3>
                    {isSelected && (
                      <div className="absolute top-1/2 -translate-y-1/2 -right-3 w-1 h-8 bg-[#f5c518] rounded-full" />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </aside>

        {/* Right: Editor (70%) */}
        <section className="flex-1">
          {editingPost || isAddingNew ? (
            <div className="bg-white border border-[#e9ecef] rounded-[24px] shadow-sm flex flex-col h-full animate-in fade-in zoom-in-95 duration-300">
               {/* Editor Header */}
               <div className="px-8 py-6 border-b border-[#e9ecef] flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-md rounded-t-[24px] z-10">
                  <div className="flex items-center gap-5">
                     <button onClick={() => handleCreateNew()} className="w-10 h-10 border border-[#e9ecef] rounded-xl flex items-center justify-center text-[#6b7280] hover:bg-[#111827] hover:text-white transition-all shadow-sm">
                        <ArrowLeft size={16} strokeWidth={2.5} />
                     </button>
                     <div>
                        <h2 className="text-lg font-black font-['Syne'] m-0 text-[#111827]">{editingPost?.id ? 'Refine Article' : 'Drafting Phase'}</h2>
                        <p className="text-[10px] font-black text-[#9ca3af] uppercase tracking-widest mt-0.5">Manifest ID: {editingPost?.id || 'Pending Allocation'}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-4">
                     {editingPost?.id && (
                       <button
                          onClick={() => setDeleteModalId(editingPost.id!)}
                          className="w-10 h-10 border border-rose-100 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                          title="Purge Document"
                       >
                          <Trash2 size={16} />
                       </button>
                     )}
                     <button onClick={() => handleSave(status)} disabled={saving} className="px-7 py-3 bg-[#111827] text-white rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-navy/20 hover:bg-black active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                        <Save size={14} strokeWidth={3} /> {saving ? 'SYNCING...' : 'COMMIT CHANGES'}
                     </button>
                  </div>
               </div>

               {/* Editor Content */}
               <div className="p-10 space-y-12 flex-1 overflow-y-auto custom-scrollbar">
                  {/* Title and Slug */}
                  <div className="space-y-8">
                     <input 
                        type="text" 
                        placeholder="Article Headline..."
                        className="w-full text-4xl font-black font-['Syne'] placeholder:text-[#f1f3f5] text-[#111827] border-none outline-none focus:ring-0 p-0 leading-tight"
                        value={title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                     />
                     
                     <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1 space-y-2">
                           <label className="text-[10px] font-black text-[#374151] uppercase tracking-widest px-1">Permanent Resource Identifier (Slug)</label>
                           <div className="flex items-center gap-2 bg-[#f8f9fa] border border-[#e9ecef] rounded-2xl px-5 py-3.5 focus-within:ring-4 focus-within:ring-[#f5c518]/5 focus-within:border-[#f5c518]/20 transition-all">
                              <span className="text-[11px] font-black text-[#9ca3af]">/blog/</span>
                              <input 
                                 type="text" 
                                 className="bg-transparent border-none outline-none text-[13px] font-black text-[#111827] flex-1 p-0"
                                 value={slug}
                                 onChange={(e) => setSlug(e.target.value)}
                              />
                           </div>
                        </div>
                        <div className="w-full md:w-[240px] space-y-2">
                           <label className="text-[10px] font-black text-[#374151] uppercase tracking-widest px-1">Deployment Status</label>
                           <select 
                              className="w-full bg-[#f8f9fa] border border-[#e9ecef] rounded-2xl px-5 py-3.5 text-[11px] font-black text-[#111827] uppercase tracking-widest outline-none cursor-pointer focus:ring-4 focus:ring-[#f5c518]/5 transition-all shadow-sm"
                              value={status}
                              onChange={(e) => setStatus(e.target.value as any)}
                           >
                              <option value="draft">DRAFT PHASE</option>
                              <option value="published">LIVE PUBLICATION</option>
                              <option value="scheduled">SCHEDULED TASK</option>
                           </select>
                        </div>
                     </div>
                  </div>

                  {/* Imagery & Intro */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-[#f1f3f5]">
                     <div className="space-y-4">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-[#374151] uppercase tracking-widest px-1 flex items-center gap-2">
                              <ImageIcon size={12} className="text-[#f5c518]" /> Feature Image URI
                           </label>
                           <input 
                              type="text" 
                              placeholder="URI to high-res asset..."
                              className="w-full bg-[#f8f9fa] border border-[#e9ecef] rounded-2xl px-5 py-3.5 text-[13px] font-medium text-[#111827] placeholder:text-[#9ca3af] outline-none focus:bg-white transition-all shadow-sm"
                              value={coverImage}
                              onChange={(e) => setCoverImage(e.target.value)}
                           />
                        </div>
                        {coverImage && (
                          <div className="aspect-video w-full rounded-2xl border border-[#e9ecef] overflow-hidden shadow-2xl shadow-black/5 group relative">
                             <img src={coverImage} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-1000" alt="Preview" />
                             <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                          </div>
                        )}
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-[#374151] uppercase tracking-widest px-1">Executive Summary (Excerpt)</label>
                        <textarea 
                           placeholder="Craft a compelling narrative hook..."
                           className="w-full bg-[#f8f9fa] border border-[#e9ecef] rounded-3xl p-6 text-[14px] font-medium text-[#374151] h-48 resize-none outline-none focus:ring-4 focus:ring-[#f5c518]/5 focus:bg-white transition-all leading-relaxed shadow-sm"
                           value={excerpt}
                           onChange={(e) => setExcerpt(e.target.value)}
                        />
                     </div>
                  </div>

                  {/* Main Editor Body */}
                  <div className="space-y-3 pt-10 border-t border-[#f1f3f5]">
                     <label className="text-[10px] font-black text-[#374151] uppercase tracking-widest px-1">Principal Content Body (Markdown/HTML Compatible)</label>
                     <textarea 
                        className="w-full min-h-[600px] border border-[#f1f3f5] outline-none text-[16px] font-medium leading-[1.8] bg-[#fcfdfe] p-10 rounded-[32px] focus:ring-8 focus:ring-[#f5c518]/5 focus:bg-white transition-all font-sans text-[#111827] shadow-inner"
                        placeholder="Ignite the discourse here..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                     />
                  </div>

                  {/* SEO Section */}
                  <div className="pt-8 border-t border-[#f1f3f5]">
                     <button 
                        onClick={() => setShowSEO(!showSEO)}
                        className={`flex items-center gap-3 text-[11px] font-black uppercase tracking-widest px-5 py-3 rounded-xl transition-all ${showSEO ? 'bg-[#111827] text-white shadow-lg shadow-navy/20' : 'bg-[#f8f9fa] text-[#6b7280] hover:text-[#111827]'}`}
                     >
                        <Layout size={14} /> METADATA OPTIMIZATION {showSEO ? ' (Retract)' : ' (Calibrate)'}
                     </button>
                     
                     {showSEO && (
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-[#f8f9fa] rounded-3xl border border-[#e9ecef] animate-in slide-in-from-top-4 duration-500 shadow-inner">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-[#374151] uppercase tracking-widest px-1">Meta Title Tag</label>
                              <input 
                                 type="text" 
                                 className="w-full bg-white border border-[#e9ecef] rounded-2xl px-5 py-3.5 text-[13px] font-black text-[#111827] shadow-sm focus:ring-4 focus:ring-[#f5c518]/5 transition-all outline-none"
                                 value={metaTitle}
                                 onChange={(e) => setMetaTitle(e.target.value)}
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-[#374151] uppercase tracking-widest px-1">Meta Narrative Description</label>
                              <textarea 
                                 className="w-full bg-white border border-[#e9ecef] rounded-2xl px-5 py-3.5 text-[13px] font-medium text-[#374151] h-32 resize-none shadow-sm focus:ring-4 focus:ring-[#f5c518]/5 transition-all outline-none text-[#111827]"
                                 value={metaDescription}
                                 onChange={(e) => setMetaDescription(e.target.value)}
                              />
                           </div>
                           <div className="col-span-1 md:col-span-2 space-y-2">
                              <label className="text-[10px] font-black text-[#374151] uppercase tracking-widest px-1 text-near-black">Schema Markup (JSON)</label>
                              <textarea 
                                 className="w-full bg-white border border-[#e9ecef] rounded-2xl px-5 py-3.5 text-[13px] font-medium text-[#374151] h-32 resize-none shadow-sm focus:ring-4 focus:ring-[#f5c518]/5 transition-all outline-none text-[#111827] font-mono"
                                 value={schemaMarkup}
                                 onChange={(e) => setSchemaMarkup(e.target.value)}
                              />
                           </div>
                        </div>
                     )}
                  </div>
               </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-20 bg-white border-2 border-dashed border-[#e9ecef] rounded-[24px] text-center">
               <div className="w-20 h-20 bg-[#f8f9fa] rounded-full flex items-center justify-center mb-8 text-[#adb5bd]">
                  <Edit3 size={32} />
               </div>
               <h2 className="text-xl font-black font-['Syne'] text-[#111827] mb-2">Editor Terminal</h2>
               <p className="text-[#6b7280] text-[13px] font-medium max-w-xs mx-auto mb-8">Select an existing publication to edit, or initialize a fresh draft to begin writing.</p>
               <button 
                 onClick={handleCreateNew} 
                 className="px-8 py-3 bg-[#111827] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-navy/20"
               >
                 Initialize Fresh Draft
               </button>
            </div>
          )}
        </section>
      </div>
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e9ecef;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #adb5bd;
        }
      `}</style>
    </div>
  )
}
