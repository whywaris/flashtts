'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import {
  BookOpen, Mic, Zap, Download, Play, Pause,
  Plus, Trash2, GripVertical, ChevronDown, ChevronUp,
  RotateCcw, X, Search, Settings2, AlertCircle
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
  generating: '#f5c518',
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

  // ── Playback ──────────────────────────────────────────────────────────────
  function playChapter(ch: Chapter) {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
    if (playingId === ch.id) { setPlayingId(null); return }
    if (!ch.audioBlob) return
    const a = new Audio(URL.createObjectURL(ch.audioBlob))
    a.play(); a.onended = () => setPlayingId(null)
    audioRef.current = a; setPlayingId(ch.id)
  }

  // ── Generate single ───────────────────────────────────────────────────────
  async function genChapter(ch: Chapter): Promise<void> {
    if (!ch.text.trim()) return
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
    setChapters(p => p.map(c => ({ ...c, status: c.text.trim() ? 'pending' : c.status, audioBlob: null, audioUrl: null })))
    for (const ch of toGen) {
      if (cancelledRef.current) break
      await genChapter(ch)
      await new Promise(r => setTimeout(r, 300))
    }
    setIsGenerating(false)
  }

  // ── Download ──────────────────────────────────────────────────────────────
  function downloadChapter(ch: Chapter) {
    if (!ch.audioBlob) return
    const a = document.createElement('a')
    a.href = URL.createObjectURL(ch.audioBlob)
    a.download = `${(bookTitle || 'book').replace(/[^a-z0-9]/gi, '-').slice(0, 30)}-${ch.title.replace(/[^a-z0-9]/gi, '-').slice(0, 30)}.mp3`
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
  }

  function downloadAll() {
    chapters.filter(c => c.audioBlob).forEach((c, i) => setTimeout(() => downloadChapter(c), i * 600))
  }

  // ── Derived ───────────────────────────────────────────────────────────────
  const totalWords = chapters.reduce((s, c) => s + c.wordCount, 0)
  const totalChars = chapters.reduce((s, c) => s + c.charCount, 0)
  const doneCount = chapters.filter(c => c.status === 'done').length
  const activeChapters = chapters.filter(c => c.text.trim())
  const progress = activeChapters.length > 0 ? Math.round((doneCount / activeChapters.length) * 100) : 0
  const creditsLeft = Math.max(0, (profile?.credits_limit || 10000) - (profile?.credits_used || 0))
  const filteredSV = savedVoices.filter(v => !voiceSearch || (v.voice_name || v.name || '').toLowerCase().includes(voiceSearch.toLowerCase()))

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif', maxWidth: '1080px' }}>

      {/* ── Page Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(245,197,24,0.12)', border: '1px solid rgba(245,197,24,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={16} color="#f5c518" />
            </div>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '22px', fontWeight: 800, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>
              Audiobook Studio
            </h1>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0, paddingLeft: '42px' }}>
            Paste your book · auto-split chapters · generate MP3s
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {doneCount > 0 && (
            <button onClick={downloadAll} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#f5c518', border: 'none', borderRadius: '10px', color: '#000', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Syne, sans-serif' }}>
              <Download size={14} /> Download All ({doneCount})
            </button>
          )}
          <button onClick={() => setShowSettings(s => !s)} style={{ width: '36px', height: '36px', borderRadius: '10px', background: showSettings ? 'rgba(245,197,24,0.1)' : 'var(--card-bg)', border: `1px solid ${showSettings ? 'rgba(245,197,24,0.3)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: showSettings ? '#f5c518' : 'var(--muted)' }}>
            <Settings2 size={16} />
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>

        {/* ── LEFT COLUMN ── */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* ── Section 1: Book Info ── */}
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '16px', padding: '18px' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '14px' }}>
              01 — Book Info
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input
                value={bookTitle}
                onChange={e => setBookTitle(e.target.value)}
                placeholder="Book title *"
                style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', background: 'var(--glass)', border: `1.5px solid ${bookTitle ? 'rgba(245,197,24,0.3)' : 'var(--border)'}`, borderRadius: '10px', color: 'var(--text)', fontSize: '14px', fontFamily: 'DM Sans, sans-serif', outline: 'none' }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                <input value={author} onChange={e => setAuthor(e.target.value)} placeholder="Author" style={{ padding: '9px 12px', background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', outline: 'none' }} />
                <select value={genre} onChange={e => setGenre(e.target.value)} style={{ padding: '9px 12px', background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', outline: 'none', cursor: 'pointer' }}>
                  {GENRES.map(g => <option key={g}>{g}</option>)}
                </select>
                <select value={language} onChange={e => setLanguage(e.target.value)} style={{ padding: '9px 12px', background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', outline: 'none', cursor: 'pointer' }}>
                  {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* ── Section 2: Paste Text ── */}
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '16px', padding: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)' }}>
                02 — Paste Your Book
              </div>
              <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                {wc(rawText).toLocaleString()} words
              </span>
            </div>

            <textarea
              value={rawText}
              onChange={e => setRawText(e.target.value)}
              placeholder={'Paste your entire book here.\n\nTip: Chapter headings like "Chapter 1:" will be auto-detected.\nNo headings? Auto-splits every ~2,000 words.'}
              style={{ width: '100%', minHeight: '200px', background: 'transparent', border: 'none', outline: 'none', resize: 'vertical', color: 'var(--text)', fontSize: '14px', lineHeight: '1.7', fontFamily: 'DM Sans, sans-serif', textAlign: 'left', direction: 'ltr', boxSizing: 'border-box' }}
            />

            <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={handleParse}
                disabled={!rawText.trim()}
                style={{ flex: 1, minWidth: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', background: rawText.trim() ? '#f5c518' : 'var(--glass)', border: rawText.trim() ? 'none' : '1px solid var(--border)', borderRadius: '10px', color: rawText.trim() ? '#000' : 'var(--muted)', fontSize: '13px', fontWeight: 700, cursor: rawText.trim() ? 'pointer' : 'not-allowed', fontFamily: 'Syne, sans-serif' }}
              >
                <Zap size={14} fill={rawText.trim() ? 'currentColor' : 'none'} />
                Auto-Detect Chapters
              </button>
              <button
                onClick={addChapter}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--muted)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}
              >
                <Plus size={14} /> Add Manually
              </button>
            </div>
          </div>

          {/* ── Section 3: Chapters List ── */}
          {chapters.length > 0 && (
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '16px', padding: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)' }}>
                  03 — Chapters ({chapters.length})
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{totalWords.toLocaleString()} words · {durLabel(totalWords, speed)}</span>
                  <button onClick={addChapter} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--muted)', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                    <Plus size={12} /> Add
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
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
                      style={{ border: `1px solid ${isDragOver ? '#f5c518' : 'var(--border)'}`, borderRadius: '12px', overflow: 'hidden', transition: 'border-color 0.15s', opacity: isDragOver ? 0.6 : 1 }}
                    >
                      {/* Chapter header row */}
                      <div
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: 'var(--bg)', cursor: 'pointer' }}
                        onClick={() => setExpandedId(isExpanded ? null : ch.id)}
                      >
                        {/* Drag handle */}
                        <div style={{ color: 'var(--muted)', cursor: 'grab', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                          <GripVertical size={14} />
                        </div>

                        {/* Index */}
                        <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: ch.status === 'done' ? 'rgba(34,211,165,0.15)' : 'var(--glass)', border: `1px solid ${ch.status === 'done' ? 'rgba(34,211,165,0.3)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: ch.status === 'done' ? '#22d3a5' : 'var(--muted)', flexShrink: 0 }}>
                          {ch.status === 'done' ? '✓' : idx + 1}
                        </div>

                        {/* Title */}
                        {isEditing ? (
                          <input
                            value={ch.title}
                            onChange={e => setChapter(ch.id, { title: e.target.value })}
                            onClick={e => e.stopPropagation()}
                            autoFocus
                            style={{ flex: 1, padding: '3px 8px', background: 'var(--glass)', border: '1px solid rgba(245,197,24,0.3)', borderRadius: '6px', color: 'var(--text)', fontSize: '13px', fontWeight: 600, fontFamily: 'DM Sans, sans-serif', outline: 'none' }}
                          />
                        ) : (
                          <span style={{ flex: 1, fontSize: '13px', fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {ch.title}
                          </span>
                        )}

                        {/* Meta */}
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                          <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{ch.wordCount.toLocaleString()}w</span>

                          {/* Status dot */}
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 700, color: sc }}>
                            {ch.status === 'generating' && (
                              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: sc, display: 'inline-block', animation: 'ab-blink 1s infinite' }} />
                            )}
                            {ch.status !== 'pending' && ch.status}
                          </span>

                          {/* Actions */}
                          <div style={{ display: 'flex', gap: '3px' }}>
                            {ch.audioBlob && (
                              <button onClick={() => playChapter(ch)} style={{ width: '26px', height: '26px', borderRadius: '6px', background: playingId === ch.id ? 'rgba(245,197,24,0.15)' : 'var(--glass)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: playingId === ch.id ? '#f5c518' : 'var(--muted)' }}>
                                {playingId === ch.id ? <Pause size={11} /> : <Play size={11} />}
                              </button>
                            )}
                            {ch.audioBlob && (
                              <button onClick={() => downloadChapter(ch)} style={{ width: '26px', height: '26px', borderRadius: '6px', background: 'var(--glass)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--muted)' }}>
                                <Download size={11} />
                              </button>
                            )}
                            {ch.status !== 'generating' && (
                              <button onClick={() => genChapter(ch)} disabled={!ch.text.trim()} title="Generate" style={{ width: '26px', height: '26px', borderRadius: '6px', background: ch.status === 'done' ? 'rgba(34,211,165,0.1)' : 'rgba(245,197,24,0.1)', border: `1px solid ${ch.status === 'done' ? 'rgba(34,211,165,0.2)' : 'rgba(245,197,24,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: ch.text.trim() ? 'pointer' : 'not-allowed', color: ch.status === 'done' ? '#22d3a5' : '#f5c518', opacity: !ch.text.trim() ? 0.4 : 1 }}>
                                {ch.status === 'done' ? <RotateCcw size={11} /> : <Zap size={11} />}
                              </button>
                            )}
                            <button onClick={() => openPicker(ch.id)} title="Voice" style={{ width: '26px', height: '26px', borderRadius: '6px', background: ch.voiceName ? 'rgba(91,142,240,0.1)' : 'var(--glass)', border: `1px solid ${ch.voiceName ? 'rgba(91,142,240,0.25)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: ch.voiceName ? '#5b8ef0' : 'var(--muted)' }}>
                              <Mic size={11} />
                            </button>
                            <button onClick={() => { setEditingId(isEditing ? null : ch.id); setExpandedId(ch.id) }} style={{ width: '26px', height: '26px', borderRadius: '6px', background: 'var(--glass)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: isEditing ? '#f5c518' : 'var(--muted)', fontSize: '11px' }}>
                              ✏
                            </button>
                            <button onClick={() => deleteChapter(ch.id)} style={{ width: '26px', height: '26px', borderRadius: '6px', background: 'var(--glass)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#f05b5b' }}>
                              <Trash2 size={11} />
                            </button>
                          </div>

                          {/* Expand chevron */}
                          <div style={{ color: 'var(--muted)', marginLeft: '2px' }}>
                            {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                          </div>
                        </div>
                      </div>

                      {/* Expanded body */}
                      {isExpanded && (
                        <div style={{ padding: '0 12px 12px', background: 'var(--bg)' }} onClick={e => e.stopPropagation()}>
                          <textarea
                            value={ch.text}
                            onChange={e => setChapter(ch.id, { text: e.target.value })}
                            placeholder="Chapter content..."
                            style={{ width: '100%', minHeight: '140px', background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 12px', color: 'var(--text)', fontSize: '13px', lineHeight: '1.7', outline: 'none', resize: 'vertical', fontFamily: 'DM Sans, sans-serif', textAlign: 'left', direction: 'ltr', boxSizing: 'border-box' }}
                          />
                          <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>
                            {ch.wordCount.toLocaleString()} words · {ch.charCount.toLocaleString()} chars
                          </div>
                          {ch.status === 'error' && ch.errorMsg && (
                            <div style={{ marginTop: '8px', padding: '8px 12px', background: 'rgba(240,91,91,0.08)', border: '1px solid rgba(240,91,91,0.2)', borderRadius: '8px', fontSize: '12px', color: '#f05b5b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <AlertCircle size={13} /> {ch.errorMsg}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Generating bar */}
                      {ch.status === 'generating' && (
                        <div style={{ height: '2px', background: 'var(--border)' }}>
                          <div style={{ height: '100%', width: '60%', background: '#f5c518', animation: 'ab-slide 1.5s ease-in-out infinite' }} />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── Section 4: Generate ── */}
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '16px', padding: '18px' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '14px' }}>
              04 — Generate
            </div>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '14px' }}>
              {[
                { label: 'Chapters', value: activeChapters.length },
                { label: 'Duration', value: durLabel(totalWords, speed) },
                { label: 'Credits', value: totalChars.toLocaleString() },
                { label: 'Available', value: creditsLeft.toLocaleString(), warn: totalChars > creditsLeft },
              ].map((s, i) => (
                <div key={i} style={{ padding: '10px', background: 'var(--bg)', borderRadius: '10px', border: s.warn ? '1px solid rgba(240,91,91,0.3)' : '1px solid var(--border)' }}>
                  <div style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '3px' }}>{s.label}</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, fontFamily: 'Syne, sans-serif', color: s.warn ? '#f05b5b' : 'var(--text)' }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            {(isGenerating || doneCount > 0) && (
              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                    {isGenerating ? 'Generating…' : doneCount === activeChapters.length ? '✅ Complete!' : `${doneCount} / ${activeChapters.length} chapters`}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#f5c518' }}>{progress}%</span>
                </div>
                <div style={{ height: '4px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #f5c518, #f59e0b)', borderRadius: '99px', transition: 'width 0.4s' }} />
                </div>
              </div>
            )}

            {/* Errors */}
            {(genError || chapters.length === 0 || totalChars > creditsLeft) && (
              <div style={{ padding: '10px 14px', background: 'rgba(240,91,91,0.06)', border: '1px solid rgba(240,91,91,0.2)', borderRadius: '10px', fontSize: '12px', color: '#f05b5b', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={13} />
                {genError || (chapters.length === 0 ? 'Add chapters first' : 'Not enough credits — upgrade your plan')}
                {totalChars > creditsLeft && <button onClick={() => router.push('/dashboard/billing')} style={{ background: 'none', border: 'none', color: '#f5c518', cursor: 'pointer', fontWeight: 700, fontSize: '12px', padding: 0 }}>Upgrade →</button>}
              </div>
            )}

            {/* Generate / Cancel */}
            {!isGenerating ? (
              <button
                onClick={handleGenerateAll}
                disabled={!activeChapters.length || totalChars > creditsLeft}
                style={{ width: '100%', padding: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: !activeChapters.length || totalChars > creditsLeft ? 'var(--glass)' : '#f5c518', border: !activeChapters.length || totalChars > creditsLeft ? '1px solid var(--border)' : 'none', borderRadius: '12px', color: !activeChapters.length || totalChars > creditsLeft ? 'var(--muted)' : '#000', fontSize: '14px', fontWeight: 800, cursor: !activeChapters.length || totalChars > creditsLeft ? 'not-allowed' : 'pointer', fontFamily: 'Syne, sans-serif', boxShadow: !activeChapters.length || totalChars > creditsLeft ? 'none' : '0 8px 24px rgba(245,197,24,0.2)' }}
              >
                <Zap size={16} fill={!activeChapters.length || totalChars > creditsLeft ? 'none' : 'currentColor'} />
                Generate All {activeChapters.length} Chapters
              </button>
            ) : (
              <button
                onClick={() => { cancelledRef.current = true; setIsGenerating(false) }}
                style={{ width: '100%', padding: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'rgba(240,91,91,0.08)', border: '1px solid rgba(240,91,91,0.25)', borderRadius: '12px', color: '#f05b5b', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Syne, sans-serif' }}
              >
                <X size={16} /> Stop Generating
              </button>
            )}
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{ width: '240px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Book card */}
          <div style={{ background: 'linear-gradient(135deg, rgba(245,197,24,0.1), rgba(91,142,240,0.08))', border: '1px solid rgba(245,197,24,0.15)', borderRadius: '16px', padding: '18px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📚</div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '14px', fontWeight: 800, color: 'var(--text)', marginBottom: '3px', wordBreak: 'break-word' }}>
              {bookTitle || 'Your Book'}
            </div>
            {author && <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '8px' }}>by {author}</div>}
            <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '10px', background: 'rgba(245,197,24,0.12)', color: '#f5c518', padding: '2px 8px', borderRadius: '99px' }}>{genre}</span>
              <span style={{ fontSize: '10px', background: 'var(--glass)', color: 'var(--muted)', padding: '2px 8px', borderRadius: '99px' }}>{LANGUAGES.find(l => l.code === language)?.flag} {language.toUpperCase()}</span>
            </div>
          </div>

          {/* Global voice */}
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '16px', padding: '16px' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '10px' }}>Voice</div>
            {globalVoice ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', background: 'rgba(245,197,24,0.06)', border: '1px solid rgba(245,197,24,0.15)', borderRadius: '10px', marginBottom: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(245,197,24,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#f5c518', flexShrink: 0 }}>
                  {globalVoice.name[0].toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#f5c518', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{globalVoice.name}</div>
                  <div style={{ fontSize: '10px', color: 'var(--muted)' }}>{globalVoice.language?.toUpperCase()}</div>
                </div>
                <button onClick={() => setGlobalVoice(null)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 0 }}>
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '8px', opacity: 0.7 }}>No voice — AI default</div>
            )}
            <button onClick={() => openPicker('global')} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '9px', color: 'var(--muted)', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
              <Mic size={13} /> {globalVoice ? 'Change Voice' : 'Select Voice'}
            </button>
          </div>

          {/* Settings panel */}
          {showSettings && (
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '16px', padding: '16px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '12px' }}>Settings</div>
              <div style={{ marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Speed</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#f5c518' }}>{speed}x</span>
              </div>
              <input type="range" min="0.5" max="2.0" step="0.1" value={speed} onChange={e => setSpeed(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#f5c518', marginBottom: '4px' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--muted)' }}>
                <span>0.5x</span><span>1.0x</span><span>2.0x</span>
              </div>
            </div>
          )}

          {/* Stats */}
          {chapters.length > 0 && (
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '16px', padding: '16px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '10px' }}>Progress</div>
              {[
                { label: 'Chapters', value: `${chapters.length}` },
                { label: 'Words', value: totalWords.toLocaleString() },
                { label: 'Est. Time', value: durLabel(totalWords, speed) },
                { label: 'Done', value: `${doneCount}/${activeChapters.length}` },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '6px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
                  <span style={{ color: 'var(--muted)' }}>{s.label}</span>
                  <span style={{ color: 'var(--text)', fontWeight: 600, fontFamily: 'Syne, sans-serif' }}>{s.value}</span>
                </div>
              ))}

              {/* Mini progress bar */}
              {doneCount > 0 && (
                <div style={{ marginTop: '10px' }}>
                  <div style={{ height: '3px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${progress}%`, background: '#22d3a5', borderRadius: '99px', transition: 'width 0.4s' }} />
                  </div>
                  <div style={{ fontSize: '10px', color: '#22d3a5', marginTop: '4px', fontWeight: 700 }}>{progress}% complete</div>
                </div>
              )}
            </div>
          )}

          {/* Clear */}
          <button
            onClick={() => {
              if (!confirm('Clear everything and start fresh?')) return
              setBookTitle(''); setAuthor(''); setGenre('Fiction'); setLanguage('en')
              setRawText(''); setChapters([]); setGlobalVoice(null); setSpeed(1.0)
              localStorage.removeItem('ab_draft_v3')
            }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '9px', background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--muted)', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
          >
            <Trash2 size={13} /> Clear & Start New
          </button>
        </div>
      </div>

      {/* ── Voice Picker Modal ── */}
      {showVoicePicker && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setShowVoicePicker(false)}>
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '20px', padding: '20px', width: '100%', maxWidth: '420px', maxHeight: '65vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: 700, color: 'var(--text)' }}>
                {pickerTarget === 'global' ? 'Global Voice' : 'Chapter Voice'}
              </div>
              <button onClick={() => setShowVoicePicker(false)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ position: 'relative', marginBottom: '10px' }}>
              <Search size={13} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
              <input value={voiceSearch} onChange={e => setVoiceSearch(e.target.value)} placeholder="Search voices…" autoFocus style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px 9px 32px', background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', outline: 'none' }} />
            </div>

            <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {filteredSV.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--muted)', fontSize: '13px' }}>
                  No voices found.{' '}
                  <button onClick={() => { setShowVoicePicker(false); router.push('/dashboard/library') }} style={{ background: 'none', border: 'none', color: '#f5c518', cursor: 'pointer', fontWeight: 700 }}>Browse Library →</button>
                </div>
              ) : filteredSV.map(v => {
                const name = v.voice_name || v.name || 'Voice'
                return (
                  <button key={v.id} onClick={() => pickVoice(v)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '10px', cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'border-color 0.15s' }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(245,197,24,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#f5c518', flexShrink: 0 }}>
                      {name[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{name}</div>
                      {v.language && <div style={{ fontSize: '10px', color: 'var(--muted)' }}>{v.language.toUpperCase()}</div>}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes ab-blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes ab-slide { 0%{transform:translateX(-200%)} 100%{transform:translateX(300%)} }
        textarea::placeholder { color: var(--muted); opacity: 0.5; }
        input::placeholder { color: var(--muted); opacity: 0.5; }
        select option { background: var(--bg); color: var(--text); }
      `}</style>
    </div>
  )
}