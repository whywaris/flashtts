'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import {
  BookOpen, Mic, Zap, Download, Play, Pause,
  Plus, Trash2, GripVertical, ChevronDown, ChevronUp,
  RotateCcw, X, Search, Settings2, AlertCircle, Lock
} from 'lucide-react'

// ─── Constants ───────────────────────────────────────────────────────────────
const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'ar', label: 'Arabic', flag: '🇸🇦' },
  { code: 'hi', label: 'Hindi', flag: '🇮🇳' },
  { code: 'es', label: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', label: 'French', flag: '🇫🇷' },
  { code: 'de', label: 'German', flag: '🇩🇪' },
  { code: 'ja', label: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', label: 'Korean', flag: '🇰🇷' },
  { code: 'tr', label: 'Turkish', flag: '🇹🇷' },
  { code: 'ru', label: 'Russian', flag: '🇷🇺' },
  { code: 'it', label: 'Italian', flag: '🇮🇹' },
  { code: 'pt', label: 'Portuguese', flag: '🇵🇹' },
]

const GENRES = ['Fiction', 'Non-Fiction', 'Self-Help', 'Education', 'Business', 'Biography', 'Science', 'History', 'Other']

// ─── Types ────────────────────────────────────────────────────────────────────
interface Chapter {
  id: string
  title: string
  text: string
  wordCount: number
  charCount: number
  voiceId: string | null
  voiceName: string | null
  status: 'pending' | 'generating' | 'done' | 'error'
  audioBlob: Blob | null
  audioUrl: string | null
  errorMsg: string | null
}

interface Voice { id: string; name: string; language: string }

// ─── Helpers ──────────────────────────────────────────────────────────────────
const wc = (t: string) => t.trim().split(/\s+/).filter(w => w.length > 0).length
const uid = () => `c_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
const durLabel = (words: number, speed: number) => {
  const m = Math.ceil(words / (150 * speed))
  return m < 60 ? `~${m}m` : `~${Math.floor(m / 60)}h ${m % 60}m`
}

function parseChapters(raw: string): Chapter[] {
  const headingRx = /(?:^|\n)((?:chapter|ch.?\s*|part\s+|section\s+)[\d]+[^\n]*)/gi
  const parts = raw.split(headingRx)
  let chapters: Chapter[] = []

  if (parts.length > 1) {
    if (parts[0].trim().length > 100) {
      const t = parts[0].trim()
      chapters.push({ id: uid(), title: 'Introduction', text: t, wordCount: wc(t), charCount: t.length, voiceId: null, voiceName: null, status: 'pending', audioBlob: null, audioUrl: null, errorMsg: null })
    }
    for (let i = 1; i < parts.length; i += 2) {
      const heading = parts[i]?.trim() || `Chapter ${chapters.length + 1}`
      const body = (parts[i + 1] || '').trim()
      if (!body) continue
      chapters.push({ id: uid(), title: heading, text: body, wordCount: wc(body), charCount: body.length, voiceId: null, voiceName: null, status: 'pending', audioBlob: null, audioUrl: null, errorMsg: null })
    }
  }

  if (chapters.length === 0) {
    const words = raw.split(/\s+/)
    for (let i = 0; i < words.length; i += 2000) {
      const t = words.slice(i, i + 2000).join(' ')
      if (!t.trim()) continue
      const n = chapters.length + 1
      chapters.push({ id: uid(), title: `Part ${n}`, text: t, wordCount: wc(t), charCount: t.length, voiceId: null, voiceName: null, status: 'pending', audioBlob: null, audioUrl: null, errorMsg: null })
    }
  }

  return chapters.filter(c => c.text.trim().length > 0)
}

// ─── Status pill colors ───────────────────────────────────────────────────────
const statusColor: Record<string, string> = {
  pending: 'var(--muted)',
  generating: '#a855f7',
  done: '#22d3a5',
  error: '#f05b5b',
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AudioBooksPage() {
  const supabase = createClient()
  const router = useRouter()

  const [profile, setProfile] = useState<any>(null)
  const [bookTitle, setBookTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [genre, setGenre] = useState('Fiction')
  const [language, setLanguage] = useState('en')
  const [rawText, setRawText] = useState('')
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [globalVoice, setGlobalVoice] = useState<Voice | null>(null)
  const [savedVoices, setSavedVoices] = useState<any[]>([])
  const [speed, setSpeed] = useState(1.0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [genError, setGenError] = useState('')
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showVoicePicker, setShowVoicePicker] = useState(false)
  const [pickerTarget, setPickerTarget] = useState<'global' | string>('global')
  const [voiceSearch, setVoiceSearch] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [dragOverId, setDragOverId] = useState<string | null>(null)

  const cancelledRef = useRef(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const dragIdx = useRef<number | null>(null)

  // ── Load ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(prof)
      const { data: sv } = await supabase.from('saved_voices').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      setSavedVoices(sv || [])
      try {
        const raw = localStorage.getItem('ab_draft_v3')
        if (raw) {
          const d = JSON.parse(raw)
          if (d.bookTitle) setBookTitle(d.bookTitle)
          if (d.author) setAuthor(d.author)
          if (d.genre) setGenre(d.genre)
          if (d.language) setLanguage(d.language)
          if (d.rawText) setRawText(d.rawText)
          if (d.speed) setSpeed(d.speed)
          if (d.globalVoice) setGlobalVoice(d.globalVoice)
          if (Array.isArray(d.chapters) && d.chapters.length > 0)
            setChapters(d.chapters.map((c: any) => ({ ...c, audioBlob: null, audioUrl: null })))
        }
      } catch { }
    }
    load()
  }, [])

  // ── Auto-save ────────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      localStorage.setItem('ab_draft_v3', JSON.stringify({
        bookTitle, author, genre, language, rawText, speed, globalVoice,
        chapters: chapters.map(c => ({ ...c, audioBlob: null, audioUrl: null, status: c.status === 'generating' ? 'pending' : c.status }))
      }))
    } catch { }
  }, [bookTitle, author, genre, language, rawText, speed, globalVoice, chapters])

  // ── Logic Variables ────────────────────────────────────────────────────────
  const isFree = profile?.plan === 'free' || !profile?.plan
  const creditsLeft = profile?.credits ?? 0
  const activeChapters = chapters.filter(c => c.text.trim())
  const totalChars = activeChapters.reduce((acc, c) => acc + c.charCount, 0)
  const totalWords = activeChapters.reduce((acc, c) => acc + c.wordCount, 0)
  const doneCount = chapters.filter(c => c.status === 'done').length
  const progress = activeChapters.length > 0 ? Math.round((doneCount / activeChapters.length) * 100) : 0

  const filteredSV = savedVoices.filter(v => 
    (v.name || v.voice_name || 'Voice').toLowerCase().includes(voiceSearch.toLowerCase()) ||
    (v.language || '').toLowerCase().includes(voiceSearch.toLowerCase())
  )

  // ── Chapter helpers ───────────────────────────────────────────────────────
  function setChapter(id: string, patch: Partial<Chapter>) {
    setChapters(prev => prev.map(c => {
      if (c.id !== id) return c
      const u = { ...c, ...patch }
      if (patch.text !== undefined) { u.wordCount = wc(patch.text); u.charCount = patch.text.length }
      return u
    }))
  }

  function addChapter() {
    const n = chapters.length + 1
    const ch: Chapter = { id: uid(), title: `Chapter ${n}`, text: '', wordCount: 0, charCount: 0, voiceId: null, voiceName: null, status: 'pending', audioBlob: null, audioUrl: null, errorMsg: null }
    setChapters(p => [...p, ch])
    setEditingId(ch.id)
    setExpandedId(ch.id)
  }

  function deleteChapter(id: string) {
    setChapters(p => p.filter(c => c.id !== id))
    if (editingId === id) setEditingId(null)
  }

  // ── Parse ─────────────────────────────────────────────────────────────────
  function handleParse() {
    if (!rawText.trim()) return
    setChapters(parseChapters(rawText))
  }

  // ── Drag reorder ──────────────────────────────────────────────────────────
  function onDragStart(idx: number) { dragIdx.current = idx }
  function onDrop(targetIdx: number) {
    if (dragIdx.current === null || dragIdx.current === targetIdx) { setDragOverId(null); return }
    setChapters(prev => {
      const arr = [...prev]
      const [m] = arr.splice(dragIdx.current!, 1)
      arr.splice(targetIdx, 0, m)
      return arr
    })
    dragIdx.current = null; setDragOverId(null)
  }

  // ── Voice picker ──────────────────────────────────────────────────────────
  function openPicker(target: 'global' | string) { setPickerTarget(target); setVoiceSearch(''); setShowVoicePicker(true) }
  function pickVoice(sv: any) {
    const v: Voice = { id: sv.voice_id || sv.id, name: sv.voice_name || sv.name || 'Voice', language: sv.language || language }
    if (pickerTarget === 'global') { setGlobalVoice(v); if (v.language) setLanguage(v.language) }
    else setChapter(pickerTarget, { voiceId: v.id, voiceName: v.name })
    setShowVoicePicker(false)
  }

  // ── Playback & Downloads ──────────────────────────────────────────────────
  function playChapter(ch: Chapter) {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
    if (playingId === ch.id) { setPlayingId(null); return }
    if (!ch.audioBlob && !ch.audioUrl) return
    const url = ch.audioUrl || (ch.audioBlob ? URL.createObjectURL(ch.audioBlob) : '')
    if (!url) return
    const a = new Audio(url)
    a.play(); a.onended = () => setPlayingId(null)
    audioRef.current = a; setPlayingId(ch.id)
  }

  function downloadChapter(ch: Chapter) {
    if (!ch.audioUrl) return
    const a = document.createElement('a')
    a.href = ch.audioUrl
    a.download = `${bookTitle || 'Book'} - ${ch.title}.mp3`
    a.click()
  }

  async function downloadAll() {
    const done = chapters.filter(c => c.status === 'done' && c.audioUrl)
    if (!done.length) return
    for (const ch of done) {
      downloadChapter(ch)
      await new Promise(r => setTimeout(r, 600)) // slight delay to open multiple prompts
    }
  }

  // ── Generate single ───────────────────────────────────────────────────────
  async function genChapter(ch: Chapter): Promise<void> {
    if (!ch.text.trim()) return
    if (ch.charCount > creditsLeft) {
      setChapter(ch.id, { status: 'error', errorMsg: 'Not enough credits to generate this chapter.' })
      return
    }
    setChapter(ch.id, { status: 'generating', errorMsg: null })
    try {
      const voiceId = ch.voiceId || globalVoice?.id || null
      const voiceName = ch.voiceName || globalVoice?.name || 'AI Voice'
      const lang = globalVoice?.language || language
      const segments: string[] = []
      let remaining = ch.text.trim()
      while (remaining.length > 0) {
        if (remaining.length <= 8000) { segments.push(remaining); break }
        let cut = 8000
        const se = remaining.lastIndexOf('.', cut)
        if (se > 5000) cut = se + 1
        segments.push(remaining.slice(0, cut).trim())
        remaining = remaining.slice(cut).trim()
      }
      const blobs: Blob[] = []
      for (const seg of segments) {
        if (cancelledRef.current) throw new Error('Cancelled')
        const res = await fetch('/api/tts', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: seg, voice_id: voiceId, voice_name: voiceName, language: lang, speed, format: 'mp3' }),
        })
        if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || `HTTP ${res.status}`) }
        blobs.push(new Blob([await res.blob()], { type: 'audio/mpeg' }))
      }
      const merged = new Blob(blobs, { type: 'audio/mpeg' })
      setChapters(prev => {
        const old = prev.find(c => c.id === ch.id)
        if (old?.audioUrl) URL.revokeObjectURL(old.audioUrl)
        return prev
      })
      setChapter(ch.id, { status: 'done', audioBlob: merged, audioUrl: URL.createObjectURL(merged) })
    } catch (e: any) {
      setChapter(ch.id, e.message === 'Cancelled' ? { status: 'pending' } : { status: 'error', errorMsg: e.message })
    }
  }

  // ── Generate all ──────────────────────────────────────────────────────────
  async function handleGenerateAll() {
    const toGen = chapters.filter(c => c.text.trim())
    if (!toGen.length) { setGenError('No chapters with content'); return }
    if (totalChars > creditsLeft) { setGenError('Not enough credits'); return }
    setIsGenerating(true); setGenError(''); cancelledRef.current = false
    setChapters(p => p.map(c => ({ ...c, status: c.text.trim() && c.status !== 'done' ? 'pending' : c.status })))
    for (const ch of toGen) {
      if (ch.status === 'done') continue
      if (cancelledRef.current) break
      await genChapter(ch)
      await new Promise(r => setTimeout(r, 300))
    }
    setIsGenerating(false)
  }

  // ─── Render Helpers ───
  const UpgradeBanner = () => (
    <div style={{
      padding: '16px',
      background: 'rgba(245,197,24,0.06)',
      border: '1px solid rgba(245,197,24,0.2)',
      borderRadius: '14px',
      textAlign: 'center',
      marginBottom: '12px',
      animation: 'fade-in 0.3s ease'
    }}>
      <div style={{ fontSize: '24px', marginBottom: '8px' }}>
        📚
      </div>
      <p style={{ 
        fontFamily: 'Syne, sans-serif', fontWeight: 800,
        fontSize: '15px', color: 'var(--text)',
        margin: '0 0 6px'
      }}>
        Audiobooks is a paid feature
      </p>
      <p style={{
        fontSize: '13px', color: 'var(--muted)',
        margin: '0 0 14px', lineHeight: 1.6
      }}>
        Upgrade to Starter or higher to generate audiobook chapters. Free plan includes preview only.
      </p>
      <button
        onClick={() => router.push('/dashboard/billing')}
        style={{
          padding: '10px 24px',
          background: '#f5c518', color: '#000',
          border: 'none', borderRadius: '10px',
          fontFamily: 'Syne, sans-serif', fontWeight: 800,
          fontSize: '13px', cursor: 'pointer'
        }}
      >
        ⚡ Upgrade to Generate
      </button>
    </div>
  )

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif', width: '100%', animation: 'fade-in 0.3s ease' }}>
      <title>eBook to AudioBook Studio</title>

      {/* ── Page Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
            📚
          </div>
          <div>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '24px', fontWeight: 800, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>
              eBook to AudioBook
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0 }}>
              Paste · Split · Generate MP3s
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ background: 'rgba(245,197,24,0.08)', border: '1px solid rgba(245,197,24,0.15)', padding: '6px 14px', borderRadius: '99px', color: '#f5c518', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            ⚡ {creditsLeft.toLocaleString()} available
          </div>
          <button onClick={() => setShowSettings(s => !s)} style={{ width: '38px', height: '38px', borderRadius: '12px', background: showSettings ? 'rgba(168,85,247,0.1)' : 'var(--card-bg)', border: `1px solid ${showSettings ? 'rgba(168,85,247,0.3)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: showSettings ? '#a855f7' : 'var(--muted)', transition: 'all 0.2s' }}>
            <Settings2 size={18} />
          </button>
          {doneCount > 0 && (
            <button onClick={downloadAll} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#f5c518', border: 'none', borderRadius: '12px', color: '#000', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Syne, sans-serif', boxShadow: '0 8px 16px rgba(245,197,24,0.15)' }}>
              <Download size={14} /> Download All
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* ── LEFT COLUMN ── */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* SECTION 01: BOOK INFO */}
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '20px', padding: '20px' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid var(--border)' }}>
              01 — Book Info
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px' }}>📖</span>
                <input
                  value={bookTitle}
                  onChange={e => setBookTitle(e.target.value)}
                  placeholder="Book Title..."
                  className="book-title-input focus-purple"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '12px 14px 12px 42px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text)', fontSize: '15px', fontWeight: 600, fontFamily: 'DM Sans, sans-serif', outline: 'none', transition: 'all 0.2s' }}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input value={author} onChange={e => setAuthor(e.target.value)} placeholder="Author" className="focus-purple" style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', outline: 'none', transition: 'all 0.2s' }} />
                <select value={genre} onChange={e => setGenre(e.target.value)} className="focus-purple" style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', outline: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>
                  {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                <select value={language} onChange={e => setLanguage(e.target.value)} className="focus-purple" style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', outline: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>
                  {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 02: PAASTE YOUR BOOK */}
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '20px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted)' }}>
                02 — Paste Your Book
              </div>
              <div style={{ fontSize: '11px', background: 'var(--glass)', padding: '2px 10px', borderRadius: '8px', color: 'var(--muted)' }}>
                {wc(rawText).toLocaleString()} words
              </div>
            </div>

            <textarea
              value={rawText}
              onChange={e => setRawText(e.target.value)}
              placeholder={'Paste the entire book content here...\n\nWe will detect chapters and sections for you.'}
              className="book-textarea focus-purple"
              style={{ width: '100%', minHeight: '220px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', outline: 'none', resize: 'vertical', color: 'var(--text)', fontSize: '14px', lineHeight: '1.8', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box', transition: 'all 0.2s' }}
            />

            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button
                onClick={handleParse}
                disabled={!rawText.trim()}
                style={{ flex: 1, height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '0 20px', background: rawText.trim() ? '#a855f7' : 'var(--glass)', border: rawText.trim() ? 'none' : '1px solid var(--border)', borderRadius: '12px', color: rawText.trim() ? '#fff' : 'var(--muted)', fontSize: '13px', fontWeight: 700, cursor: rawText.trim() ? 'pointer' : 'not-allowed', fontFamily: 'Syne, sans-serif', transition: 'all 0.2s' }}
              >
                <Zap size={14} fill={rawText.trim() ? 'currentColor' : 'none'} />
                Auto-Detect
              </button>
              <button
                onClick={addChapter}
                style={{ display: 'flex', height: '44px', alignItems: 'center', gap: '8px', padding: '0 20px', background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--muted)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}
              >
                <Plus size={14} /> Add Manually
              </button>
            </div>
          </div>

          {/* SECTION 03: CHAPTERS LIST */}
          {chapters.length > 0 && (
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '20px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted)' }}>
                  03 — Chapters
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{chapters.length} items</span>
                  <button onClick={addChapter} style={{ width: '24px', height: '24px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--muted)' }}>
                    <Plus size={12} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {chapters.map((ch, idx) => {
                  const isExpanded = expandedId === ch.id
                  const isEditing = editingId === ch.id
                  const isDragOver = dragOverId === ch.id
                  const sc = statusColor[ch.status]

                  return (
                    <div
                      key={ch.id}
                      draggable={!isEditing}
                      onDragStart={() => onDragStart(idx)}
                      onDragEnter={() => setDragOverId(ch.id)}
                      onDragOver={e => e.preventDefault()}
                      onDrop={() => onDrop(idx)}
                      onDragEnd={() => { setDragOverId(null); dragIdx.current = null }}
                      className="chapter-row"
                      style={{ 
                        background: 'var(--bg)', border: `1px solid ${isDragOver ? '#a855f7' : 'var(--border)'}`, 
                        borderRadius: '14px', overflow: 'hidden', transition: 'all 0.2s', 
                        opacity: isDragOver ? 0.6 : 1 
                      }}
                    >
                      {/* Header row */}
                      <div
                        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', cursor: 'pointer' }}
                        onClick={() => setExpandedId(isExpanded ? null : ch.id)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                          <span style={{ color: 'var(--muted)', cursor: 'grab', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                            <GripVertical size={14} />
                          </span>
                          
                          <div style={{ minWidth: '24px', height: '24px', borderRadius: '50%', background: ch.status === 'done' ? 'rgba(34,211,165,0.1)' : 'rgba(255,255,255,0.05)', border: `1px solid ${ch.status === 'done' ? 'rgba(34,211,165,0.2)' : 'rgba(255,255,255,0.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, color: ch.status === 'done' ? '#22d3a5' : 'var(--muted)' }}>
                             {ch.status === 'done' ? '✓' : idx + 1}
                          </div>

                          {isEditing ? (
                            <input
                              value={ch.title}
                              onChange={e => setChapter(ch.id, { title: e.target.value })}
                              onClick={e => e.stopPropagation()}
                              autoFocus
                              style={{ flex: 1, padding: '4px 8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: '6px', color: 'var(--text)', fontSize: '13px', fontWeight: 700, outline: 'none' }}
                            />
                          ) : (
                            <span style={{ flex: 1, fontSize: '14px', fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {ch.title}
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }} onClick={e => e.stopPropagation()}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: '45px' }} className="hidden sm:flex">
                             <span style={{ fontSize: '10px', color: 'var(--muted)' }}>{ch.wordCount}w</span>
                             <span style={{ fontSize: '9px', fontWeight: 800, color: sc, textTransform: 'uppercase' }}>{ch.status !== 'pending' ? ch.status : ''}</span>
                          </div>

                          <div style={{ display: 'flex', gap: '4px' }}>
                            {ch.audioUrl && (
                              <button onClick={() => playChapter(ch)} style={{ width: '28px', height: '28px', borderRadius: '8px', background: playingId === ch.id ? 'rgba(168,85,247,0.1)' : 'var(--glass)', border: '1px solid var(--border)', color: playingId === ch.id ? '#a855f7' : 'var(--muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {playingId === ch.id ? <Pause size={12} /> : <Play size={12} />}
                              </button>
                            )}
                            
                            {isFree ? (
                               <button onClick={() => router.push('/dashboard/billing')} title="Upgrade to generate" style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(245,197,24,0.08)', border: '1px solid rgba(245,197,24,0.2)', color: '#f5c518', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <Lock size={12} />
                               </button>
                            ) : (
                              <button onClick={() => genChapter(ch)} disabled={!ch.text.trim()} style={{ width: '28px', height: '28px', borderRadius: '8px', background: ch.status === 'done' ? 'rgba(34,211,165,0.1)' : 'rgba(168,85,247,0.1)', border: `1px solid ${ch.status === 'done' ? 'rgba(34,211,165,0.2)' : 'rgba(168,85,247,0.2)'}`, color: ch.status === 'done' ? '#22d3a5' : '#a855f7', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: !ch.text.trim() ? 0.3 : 1 }}>
                                {ch.status === 'done' ? <RotateCcw size={12} /> : <Zap size={12} fill="currentColor" />}
                              </button>
                            )}

                            <button onClick={() => openPicker(ch.id)} style={{ width: '28px', height: '28px', borderRadius: '8px', background: ch.voiceName ? 'rgba(168,85,247,0.1)' : 'var(--glass)', border: '1px solid var(--border)', color: ch.voiceName ? '#a855f7' : 'var(--muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Mic size={12} />
                            </button>
                            <button onClick={() => setEditingId(isEditing ? null : ch.id)} style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'var(--glass)', border: '1px solid var(--border)', color: isEditing ? '#a855f7' : 'var(--muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              ✏
                            </button>
                            <button onClick={() => deleteChapter(ch.id)} style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'transparent', border: 'none', color: '#f05b5b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Content Area */}
                      {isExpanded && (
                         <div style={{ padding: '0 16px 16px', animation: 'fade-in 0.2s ease' }}>
                            <textarea
                              value={ch.text}
                              onChange={e => setChapter(ch.id, { text: e.target.value })}
                              style={{ width: '100%', minHeight: '160px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px', color: 'var(--text)', fontSize: '13px', lineHeight: '1.7', outline: 'none', resize: 'vertical' }}
                            />
                            {ch.status === 'error' && (
                              <div style={{ marginTop: '8px', color: '#f05b5b', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <AlertCircle size={12} /> {ch.errorMsg}
                              </div>
                            )}
                         </div>
                      )}

                      {/* Generating Progress */}
                      {ch.status === 'generating' && (
                        <div style={{ height: '3px', background: 'rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}>
                           <div className="generating-purple-bar" style={{ position: 'absolute', height: '100%', width: '40%', background: '#a855f7', borderRadius: '99px' }} />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* SECTION 04: GENERATE CONTROLS */}
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '20px', padding: '20px' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid var(--border)' }}>
              04 — Generate
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              {[
                { label: 'Chapters', value: activeChapters.length },
                { label: 'Duration', value: durLabel(totalWords, speed) },
                { label: 'Credits', value: totalChars.toLocaleString() },
                { label: 'Available', value: creditsLeft.toLocaleString() },
              ].map((s, i) => (
                <div key={i} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 16px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '4px' }}>{s.label}</div>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 800, color: 'var(--text)' }}>{s.value}</div>
                </div>
              ))}
            </div>

            {isGenerating && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                   <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Generating: {doneCount} / {activeChapters.length} chapters</span>
                   <span style={{ fontSize: '12px', fontWeight: 800, color: '#a855f7' }}>{progress}%</span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px', overflow: 'hidden' }}>
                   <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #a855f7, #7c3aed)', borderRadius: '99px', transition: 'width 0.4s ease' }} />
                </div>
              </div>
            )}

            {isFree ? (
              <UpgradeBanner />
            ) : (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={handleGenerateAll}
                  disabled={isGenerating || !activeChapters.length || totalChars > creditsLeft}
                  className="generate-all-btn"
                  style={{ flex: 3, height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: '#a855f7', border: 'none', borderRadius: '14px', color: '#fff', fontSize: '14px', fontWeight: 800, fontFamily: 'Syne, sans-serif', cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  <Zap size={18} fill="currentColor" />
                  {isGenerating ? `Generating (${doneCount}/${activeChapters.length})...` : `Generate All Chapters`}
                </button>
                {isGenerating && (
                  <button onClick={() => { cancelledRef.current = true; setIsGenerating(false) }} style={{ flex: 1, padding: '0 20px', background: 'rgba(240,91,91,0.1)', border: '1px solid rgba(240,91,91,0.2)', borderRadius: '14px', color: '#f05b5b', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                    Cancel
                  </button>
                )}
              </div>
            )}
            {genError && !isGenerating && (
              <div style={{ marginTop: '12px', color: '#f05b5b', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <AlertCircle size={14} /> {genError}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="w-full lg:w-[280px] shrink-0 flex flex-col gap-4">
          
          {/* BOOK CARD */}
          <div style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.12), rgba(91,142,240,0.08))', border: '1px solid rgba(168,85,247,0.2)', borderRadius: '20px', padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>📚</div>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: 800, color: 'var(--text)', margin: '0 0 4px', lineBreak: 'anywhere' }}>{bookTitle || 'Untitled Book'}</h3>
            <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '0 0 16px' }}>by {author || 'Unknown Author'}</p>
            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
               <span style={{ fontSize: '10px', fontWeight: 700, background: 'rgba(168,85,247,0.15)', color: '#a855f7', padding: '4px 10px', borderRadius: '8px' }}>{genre}</span>
               <span style={{ fontSize: '10px', fontWeight: 700, background: 'rgba(255,255,255,0.05)', color: 'var(--muted)', padding: '4px 10px', borderRadius: '8px' }}>{language.toUpperCase()}</span>
            </div>
          </div>

          {/* VOICE SELECTION */}
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '20px', padding: '20px' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '16px' }}>Primary Voice</div>
            {globalVoice ? (
               <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: 'rgba(168,85,247,0.05)', borderRadius: '12px', marginBottom: '12px', border: '1px solid rgba(168,85,247,0.15)' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#a855f7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px' }}>
                    {globalVoice.name[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{globalVoice.name}</div>
                    <div style={{ fontSize: '10px', color: 'var(--muted)' }}>{globalVoice.language?.toUpperCase()}</div>
                  </div>
               </div>
            ) : (
              <div style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '12px', opacity: 0.6 }}>No voice selected</div>
            )}
            <button
              onClick={() => openPicker('global')}
              style={{ width: '100%', height: '40px', background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)', color: '#a855f7', borderRadius: '10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}
            >
              <Mic size={14} /> {globalVoice ? 'Change Voice' : 'Choose Voice'}
            </button>
          </div>

          {/* ADDITIONAL SETTINGS */}
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '20px', padding: '20px' }}>
             <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '16px' }}>Settings</div>
             <div style={{ marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Speed</span>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#a855f7' }}>{speed}x</span>
             </div>
             <input type="range" min="0.5" max="2.0" step="0.1" value={speed} onChange={e => setSpeed(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#a855f7', marginBottom: '16px', cursor: 'pointer' }} />
             
             {chapters.length > 0 && (
                <>
                  <div style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                       <span style={{ color: 'var(--muted)' }}>Progress</span>
                       <span style={{ color: '#22d3a5', fontWeight: 700 }}>{progress}%</span>
                    </div>
                    <div style={{ height: '3px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px', overflow: 'hidden' }}>
                       <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #a855f7, #22d3a5)', borderRadius: '99px' }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--muted)' }}>
                    <span>Total Words</span>
                    <span style={{ color: 'var(--text)', fontWeight: 600 }}>{totalWords.toLocaleString()}</span>
                  </div>
                </>
             )}
          </div>

          {/* CLEAR ACTION */}
          <button
            onClick={() => {
              if (!confirm('Clear everything and start fresh?')) return
              setBookTitle(''); setAuthor(''); setGenre('Fiction'); setLanguage('en')
              setRawText(''); setChapters([]); setGlobalVoice(null); setSpeed(1.0)
              localStorage.removeItem('ab_draft_v3')
            }}
            style={{ width: '100%', height: '42px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: '12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
          >
            Clear Project
          </button>
        </div>
      </div>

      {/* ─── VOICE PICKER MODAL (FULL REDESIGN) ─── */}
      {showVoicePicker && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={() => setShowVoicePicker(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }} />
          
          <div style={{ position: 'relative', width: 'min(560px, 92vw)', maxHeight: '80vh', background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '24px', boxShadow: '0 25px 60px rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'fade-in 0.2s ease-out' }}>
            
            {/* Modal Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>Choose a Voice</h2>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>{filteredSV.length} saved voices</p>
              </div>
              <button onClick={() => setShowVoicePicker(false)} style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
                <X size={16} />
              </button>
            </div>

            {/* Search Input */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search voices..."
                  value={voiceSearch}
                  onChange={e => setVoiceSearch(e.target.value)}
                  className="voice-search-input"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '12px 16px 12px 42px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '14px', outline: 'none', transition: 'all 0.2s' }}
                />
              </div>
            </div>

            {/* Voice List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
              {filteredSV.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', margin: '0 0 16px' }}>No saved voices yet.</p>
                  <button onClick={() => { setShowVoicePicker(false); router.push('/dashboard/library') }} style={{ background: 'none', border: 'none', color: '#f5c518', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
                    Browse Library →
                  </button>
                </div>
              ) : (
                filteredSV.map(v => {
                  const name = v.voice_name || v.name || 'Voice'
                  return (
                    <div key={v.id} className="voice-list-item" onClick={() => pickVoice(v)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'all 0.2s' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(168,85,247,0.15)', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 800 }}>
                          {name[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '14px', fontWeight: 700, color: '#fff' }}>{name}</div>
                          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{(v.language || language).toUpperCase()}</div>
                        </div>
                      </div>
                      <button className="voice-select-btn" style={{ background: '#a855f7', color: '#fff', padding: '6px 12px', borderRadius: '8px', border: 'none', fontSize: '12px', fontWeight: 700, cursor: 'pointer', pointerEvents: 'none' }}>
                        Select →
                      </button>
                    </div>
                  )
                })
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '14px 24px', background: '#1a1a2e', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'center' }}>
              <button onClick={() => { setShowVoicePicker(false); router.push('/dashboard/library') }} style={{ background: 'none', border: 'none', color: '#f5c518', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                Browse Full Library →
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes ab-blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes ab-slide { 0%{transform:translateX(-200%)} 100%{transform:translateX(300%)} }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        textarea::placeholder { color: var(--muted); opacity: 0.5; }
        input::placeholder { color: var(--muted); opacity: 0.5; }
        select option { background: var(--bg); color: var(--text); }
        
        /* Interactive focus styles */
        .focus-purple:focus { border-color: rgba(168,85,247,0.4) !important; }
        .book-title-input:focus { border-color: #a855f7 !important; }
        .voice-search-input:focus { border-color: rgba(168,85,247,0.5) !important; }

        /* Generating bar animation */
        .generating-purple-bar { animation: ab-slide 1.5s infinite linear; }

        /* Generate all hover */
        .generate-all-btn:not(:disabled):hover { background: #9333ea !important; }

        /* Voice picker hover states */
        .voice-list-item { background: transparent; }
        .voice-list-item:hover { background: rgba(255,255,255,0.05); }
        .voice-select-btn { opacity: 0; transform: translateX(-10px); transition: all 0.2s; }
        .voice-list-item:hover .voice-select-btn { opacity: 1; transform: translateX(0); }
        
        /* Chapter row hover */
        .chapter-row:hover { border-color: rgba(168,85,247,0.3) !important; }
      `}</style>
    </div>
  )
}