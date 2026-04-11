'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

// ─── Constants ──────────────────────────────────────────────────
const LANGUAGES = [
  { code: 'en', label: 'English',    flag: '🇺🇸' },
  { code: 'ar', label: 'Arabic',     flag: '🇸🇦' },
  { code: 'hi', label: 'Hindi',      flag: '🇮🇳' },
  { code: 'es', label: 'Spanish',    flag: '🇪🇸' },
  { code: 'fr', label: 'French',     flag: '🇫🇷' },
  { code: 'de', label: 'German',     flag: '🇩🇪' },
  { code: 'ja', label: 'Japanese',   flag: '🇯🇵' },
  { code: 'ko', label: 'Korean',     flag: '🇰🇷' },
  { code: 'tr', label: 'Turkish',    flag: '🇹🇷' },
  { code: 'ru', label: 'Russian',    flag: '🇷🇺' },
  { code: 'it', label: 'Italian',    flag: '🇮🇹' },
  { code: 'pt', label: 'Portuguese', flag: '🇵🇹' },
  { code: 'nl', label: 'Dutch',      flag: '🇳🇱' },
  { code: 'pl', label: 'Polish',     flag: '🇵🇱' },
]

const GENRES = [
  'Fiction','Non-Fiction','Self-Help','Education',
  'Business','Biography','Science','History','Other',
]

// Status color mapping
const SC: Record<string, string> = {
  pending:    'var(--muted)',
  generating: '#f5c518',
  done:       '#22d3a5',
  error:      '#f05b5b',
}

// ─── Types ──────────────────────────────────────────────────────
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

interface Voice {
  id: string
  name: string
  language: string
}

// ─── Helpers ────────────────────────────────────────────────────
function wc(t: string) {
  return t.trim().split(/\s+/).filter(w => w.length > 0).length
}

function durLabel(words: number, speed: number) {
  const m = Math.ceil(words / (150 * speed))
  return m < 60 ? `~${m} min` : `~${Math.floor(m/60)}h ${m%60}m`
}

function uid() {
  return `c_${Date.now()}_${Math.random().toString(36).slice(2,7)}`
}

// Auto-split pasted text into chapters
function parseChapters(raw: string): Chapter[] {
  // Try to detect common chapter patterns
  const headingRx = /(?:^|\n)((?:chapter|ch.?\s*|part\s+|section\s+)[\d]+[^\n]*)/gi
  const parts = raw.split(headingRx)
  let chapters: Chapter[] = []

  if (parts.length > 1) {
    // Found chapter headings
    // parts = [text before first heading, heading1, body1, heading2, body2, ...]
    let start = 0
    // If there's intro text before first heading (and it's meaningful)
    if (parts[0].trim().length > 100) {
      const t = parts[0].trim()
      chapters.push({ id: uid(), title: 'Introduction', text: t, wordCount: wc(t), charCount: t.length, voiceId: null, voiceName: null, status: 'pending', audioBlob: null, audioUrl: null, errorMsg: null })
    }
    start = 1
    for (let i = start; i < parts.length; i += 2) {
      const heading = parts[i]?.trim() || `Chapter ${chapters.length + 1}`
      const body = (parts[i + 1] || '').trim()
      if (!body) continue
      chapters.push({ id: uid(), title: heading, text: body, wordCount: wc(body), charCount: body.length, voiceId: null, voiceName: null, status: 'pending', audioBlob: null, audioUrl: null, errorMsg: null })
    }
  }

  if (chapters.length === 0) {
    // No chapter headings — split every 2000 words
    const words = raw.split(/\s+/)
    const SIZE = 2000
    for (let i = 0; i < words.length; i += SIZE) {
      const t = words.slice(i, i + SIZE).join(' ')
      if (!t.trim()) continue
      const n = chapters.length + 1
      chapters.push({ id: uid(), title: `Part ${n}`, text: t, wordCount: wc(t), charCount: t.length, voiceId: null, voiceName: null, status: 'pending', audioBlob: null, audioUrl: null, errorMsg: null })
    }
  }

  return chapters.filter(c => c.text.trim().length > 0)
}

// ─── Component ──────────────────────────────────────────────────
export default function AudioBookPage() {
  const supabase = createClient()
  const router   = useRouter()

  // Auth
  const [user, setUser]       = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)

  // Book meta
  const [bookTitle, setBookTitle] = useState('')
  const [author, setAuthor]       = useState('')
  const [genre, setGenre]         = useState('Fiction')
  const [language, setLanguage]   = useState('en')

  // Content + chapters
  const [rawText, setRawText]   = useState('')
  const [chapters, setChapters] = useState<Chapter[]>([])

  // Voice
  const [globalVoice, setGlobalVoice]       = useState<Voice | null>(null)
  const [savedVoices, setSavedVoices]       = useState<any[]>([])
  const [showVoicePicker, setShowVoicePicker] = useState(false)
  const [pickerTarget, setPickerTarget]     = useState<'global' | string>('global')
  const [voiceSearch, setVoiceSearch]       = useState('')

  // Settings
  const [speed, setSpeed] = useState(1.0)

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false)
  const [genError, setGenError]         = useState('')
  const cancelledRef = useRef(false)

  // Audio playback
  const [playingId, setPlayingId] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Drag-to-reorder
  const dragIdx = useRef<number | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)

  // Editing
  const [editingId, setEditingId] = useState<string | null>(null)

  // Active tab: 'setup' | 'chapters' | 'generate'
  const [tab, setTab] = useState<'setup' | 'chapters' | 'generate'>('setup')

  // ── Load ──────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)

      const { data: prof } = await supabase
        .from('profiles').select('*').eq('id', user.id).single()
      setProfile(prof)

      const { data: sv } = await supabase
        .from('saved_voices').select('*').eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setSavedVoices(sv || [])

      // Restore draft
      try {
        const raw = localStorage.getItem('ab_draft_v2')
        if (raw) {
          const d = JSON.parse(raw)
          if (d.bookTitle) setBookTitle(d.bookTitle)
          if (d.author)    setAuthor(d.author)
          if (d.genre)     setGenre(d.genre)
          if (d.language)  setLanguage(d.language)
          if (d.rawText)   setRawText(d.rawText)
          if (d.speed)     setSpeed(d.speed)
          if (d.globalVoice) setGlobalVoice(d.globalVoice)
          if (Array.isArray(d.chapters) && d.chapters.length > 0) {
            // Restore chapters without blobs
            setChapters(d.chapters.map((c: any) => ({ ...c, audioBlob: null, audioUrl: null })))
          }
        }
      } catch {}
    }
    load()
  }, [])

  // ── Auto-save draft ───────────────────────────────────────────
  useEffect(() => {
    try {
      const draft = {
        bookTitle, author, genre, language, rawText, speed, globalVoice,
        chapters: chapters.map(c => ({
          id: c.id, title: c.title, text: c.text,
          wordCount: c.wordCount, charCount: c.charCount,
          voiceId: c.voiceId, voiceName: c.voiceName,
          status: c.status === 'generating' ? 'pending' : c.status,
          audioBlob: null, audioUrl: null, errorMsg: c.errorMsg,
        }))
      }
      localStorage.setItem('ab_draft_v2', JSON.stringify(draft))
    } catch {}
  }, [bookTitle, author, genre, language, rawText, speed, globalVoice, chapters])

  // ── Chapter helpers ───────────────────────────────────────────
  function setChapter(id: string, patch: Partial<Chapter>) {
    setChapters(prev => prev.map(c => {
      if (c.id !== id) return c
      const u = { ...c, ...patch }
      if (patch.text !== undefined) {
        u.wordCount = wc(patch.text)
        u.charCount = patch.text.length
      }
      return u
    }))
  }

  function addChapter() {
    const n = chapters.length + 1
    const ch: Chapter = {
      id: uid(), title: `Chapter ${n}`, text: '',
      wordCount: 0, charCount: 0,
      voiceId: null, voiceName: null,
      status: 'pending', audioBlob: null, audioUrl: null, errorMsg: null,
    }
    setChapters(p => [...p, ch])
    setEditingId(ch.id)
  }

  function deleteChapter(id: string) {
    setChapters(p => p.filter(c => c.id !== id))
    if (editingId === id) setEditingId(null)
  }

  // ── Parse text ────────────────────────────────────────────────
  function handleParse() {
    if (!rawText.trim()) return
    const parsed = parseChapters(rawText)
    setChapters(parsed)
    setTab('chapters')
  }

  // ── Drag-to-reorder ───────────────────────────────────────────
  function onDragStart(idx: number) { dragIdx.current = idx }
  function onDragEnter(id: string) { setDragOverId(id) }
  function onDrop(targetIdx: number) {
    if (dragIdx.current === null || dragIdx.current === targetIdx) {
      setDragOverId(null); return
    }
    setChapters(prev => {
      const arr = [...prev]
      const [m] = arr.splice(dragIdx.current!, 1)
      arr.splice(targetIdx, 0, m)
      return arr
    })
    dragIdx.current = null
    setDragOverId(null)
  }

  // ── Voice picker ─────────────────────────────────────────────
  function openPicker(target: 'global' | string) {
    setPickerTarget(target)
    setVoiceSearch('')
    setShowVoicePicker(true)
  }

  function pickVoice(sv: any) {
    const v: Voice = {
      id: sv.voice_id || sv.id,
      name: sv.voice_name || sv.name || 'Voice',
      language: sv.language || language,
    }
    if (pickerTarget === 'global') {
      setGlobalVoice(v)
      if (v.language) setLanguage(v.language)
    } else {
      setChapter(pickerTarget, { voiceId: v.id, voiceName: v.name })
    }
    setShowVoicePicker(false)
  }

  // ── Audio playback ────────────────────────────────────────────
  function playChapter(ch: Chapter) {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
    if (playingId === ch.id) { setPlayingId(null); return }
    if (!ch.audioBlob) return
    const url = URL.createObjectURL(ch.audioBlob)
    const a = new Audio(url)
    a.play()
    a.onended = () => setPlayingId(null)
    audioRef.current = a
    setPlayingId(ch.id)
  }

  // ── Generate single chapter ───────────────────────────────────
  async function genChapter(ch: Chapter): Promise<void> {
    if (!ch.text.trim()) return
    setChapter(ch.id, { status: 'generating', errorMsg: null })

    try {
      const voiceId   = ch.voiceId   || globalVoice?.id   || null
      const voiceName = ch.voiceName || globalVoice?.name || 'AI Voice'
      const lang      = globalVoice?.language || language
      
      // Long text: split into segments of max 8000 chars, then merge blobs
      const segments: string[] = []
      let remaining = ch.text.trim()
      while (remaining.length > 0) {
        if (remaining.length <= 8000) {
          segments.push(remaining)
          break
        }
        // Split at sentence boundary near 8000 chars
        let cutAt = 8000
        const sentenceEnd = remaining.lastIndexOf('.', cutAt)
        if (sentenceEnd > 5000) cutAt = sentenceEnd + 1
        segments.push(remaining.slice(0, cutAt).trim())
        remaining = remaining.slice(cutAt).trim()
      }

      const blobs: Blob[] = []
      for (const seg of segments) {
        if (cancelledRef.current) throw new Error('Cancelled')
        const res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: seg,
            voice_id: voiceId,
            voice_name: voiceName,
            language: lang,
            speed,
            format: 'mp3',
          }),
        })
        if (!res.ok) {
          const d = await res.json().catch(() => ({}))
          throw new Error(d.error || `HTTP ${res.status}`)
        }
        const raw = await res.blob()
        blobs.push(new Blob([raw], { type: 'audio/mpeg' }))
      }

      // Merge blobs (simple concatenation — works for MP3)
      const merged = new Blob(blobs, { type: 'audio/mpeg' })
      const url = URL.createObjectURL(merged)
      setChapter(ch.id, { status: 'done', audioBlob: merged, audioUrl: url })

    } catch (e: any) {
      if (e.message === 'Cancelled') {
        setChapter(ch.id, { status: 'pending' })
      } else {
        setChapter(ch.id, { status: 'error', errorMsg: e.message })
      }
    }
  }

  // ── Generate all ──────────────────────────────────────────────
  async function handleGenerateAll() {
    const toGen = chapters.filter(c => c.text.trim().length > 0)
    if (toGen.length === 0) { setGenError('No chapters with content'); return }
    if (totalChars > creditsLeft) { setGenError('Not enough credits'); return }
    
    setIsGenerating(true)
    setGenError('')
    cancelledRef.current = false

    // Reset all to pending
    setChapters(p => p.map(c => ({ ...c, status: c.text.trim() ? 'pending' : c.status, audioBlob: null, audioUrl: null })))

    for (const ch of toGen) {
      if (cancelledRef.current) break
      await genChapter(ch)
      await new Promise(r => setTimeout(r, 400))
    }

    setIsGenerating(false)
  }

  // ── Download ──────────────────────────────────────────────────
  function downloadChapter(ch: Chapter) {
    if (!ch.audioBlob) return
    const safe = (bookTitle || 'audiobook').replace(/[^a-z0-9]/gi, '-').slice(0, 40)
    const chSafe = ch.title.replace(/[^a-z0-9]/gi, '-').slice(0, 40)
    const a = document.createElement('a')
    a.href = URL.createObjectURL(ch.audioBlob)
    a.download = `${safe}-${chSafe}.mp3`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  function downloadAll() {
    const done = chapters.filter(c => c.audioBlob)
    done.forEach((c, i) => setTimeout(() => downloadChapter(c), i * 700))
  }

  // ── Derived stats ─────────────────────────────────────────────
  const totalWords  = chapters.reduce((s, c) => s + c.wordCount, 0)
  const totalChars  = chapters.reduce((s, c) => s + c.charCount, 0)
  const doneCount   = chapters.filter(c => c.status === 'done').length
  const progress    = chapters.length > 0 ? Math.round((doneCount / chapters.filter(c => c.text.trim()).length) * 100) : 0
  
  const creditsLimit = profile?.credits_limit || 10000
  const creditsUsed  = profile?.credits_used  || 0
  const creditsLeft  = Math.max(0, creditsLimit - creditsUsed)

  // ── Styles ────────────────────────────────────────────────────
  const card = (extra?: any) => ({
    background: 'var(--card-bg)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    padding: '20px',
    ...extra,
  })

  const tabBtn = (active: boolean) => ({
    padding: '9px 20px',
    borderRadius: '10px',
    border: 'none',
    background: active ? '#f5c518' : 'var(--bg)',
    color: active ? '#000' : 'var(--muted)',
    fontWeight: active ? 700 : 500,
    fontSize: '13px',
    cursor: 'pointer',
    fontFamily: 'DM Sans, sans-serif',
    transition: 'all 0.15s',
  })

  const inp = (extra?: any) => ({
    width: '100%',
    padding: '10px 14px',
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    color: 'var(--text)',
    fontSize: '13px',
    outline: 'none',
    fontFamily: 'DM Sans, sans-serif',
    boxSizing: 'border-box' as const,
    ...extra,
  })

  const yBtn = (extra?: any) => ({
    padding: '9px 20px',
    background: '#f5c518',
    color: '#000',
    border: 'none',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'Syne, sans-serif',
    ...extra,
  })

  const gBtn = (extra?: any) => ({
    padding: '7px 14px',
    background: 'var(--bg)',
    color: 'var(--muted)',
    border: '1px solid var(--border)',
    borderRadius: '9px',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'DM Sans, sans-serif',
    ...extra,
  })

  const filteredSV = savedVoices.filter(v => {
    const n = (v.voice_name || v.name || '').toLowerCase()
    return !voiceSearch || n.includes(voiceSearch.toLowerCase())
  })

  // ─────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: '1100px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '26px', fontWeight: 800, color: 'var(--text)', marginBottom: '4px' }}>
            📚 AudioBook Studio
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
            Paste your book, split into chapters, generate audio for each
          </p>
        </div>
        {doneCount > 0 && (
          <button onClick={downloadAll} style={yBtn()}>
            ⬇ Download All ({doneCount}/{chapters.filter(c=>c.text.trim()).length})
          </button>
        )}
      </div>

      {/* Layout */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        
        {/* ── LEFT ── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <button style={tabBtn(tab === 'setup')}    onClick={() => setTab('setup')}>✍️ Book Setup</button>
            <button style={tabBtn(tab === 'chapters')} onClick={() => setTab('chapters')}>
              📑 Chapters {chapters.length > 0 ? `(${chapters.length})` : ''}
            </button>
            <button style={tabBtn(tab === 'generate')} onClick={() => setTab('generate')}>🚀 Generate</button>
          </div>

          {/* ══ TAB: SETUP ══ */}
          {tab === 'setup' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* Book Info */}
              <div style={card()}>
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '14px' }}>BOOK INFO</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '5px' }}>Book Title *</label>
                    <input value={bookTitle} onChange={e => setBookTitle(e.target.value)} placeholder="e.g. Atomic Habits" style={inp()} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '5px' }}>Author</label>
                      <input value={author} onChange={e => setAuthor(e.target.value)} placeholder="Author name" style={inp()} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '5px' }}>Genre</label>
                      <select value={genre} onChange={e => setGenre(e.target.value)} style={inp({ cursor: 'pointer' })}>
                        {GENRES.map(g => <option key={g}>{g}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '5px' }}>Language</label>
                    <select value={language} onChange={e => setLanguage(e.target.value)} style={inp({ cursor: 'pointer' })}>
                      {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Text Paste */}
              <div style={card()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)' }}>PASTE YOUR BOOK</div>
                  <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                    {wc(rawText).toLocaleString()} words · {rawText.length.toLocaleString()} chars
                  </span>
                </div>
                <textarea
                  value={rawText}
                  onChange={e => setRawText(e.target.value)}
                  placeholder={'Paste your entire book or article here.\n\nTip: If your book has chapter headings like "Chapter 1: Title" or "Part I", the system will auto-detect them.\n\nIf no headings found, it will auto-split every ~2,000 words.\n\nSupports 50,000+ words.'}
                  style={{
                    width: '100%', minHeight: '300px',
                    background: 'transparent',
                    border: 'none', outline: 'none',
                    resize: 'vertical', color: 'var(--text)',
                    fontSize: '14px', lineHeight: '1.7',
                    fontFamily: 'DM Sans, sans-serif',
                    textAlign: 'left', direction: 'ltr',
                    boxSizing: 'border-box',
                  }}
                />
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button
                    onClick={handleParse}
                    disabled={!rawText.trim()}
                    style={yBtn({ flex: 1, opacity: rawText.trim() ? 1 : 0.5 })}
                  >
                    ✨ Auto-Detect Chapters
                  </button>
                  <button
                    onClick={() => { setTab('chapters'); addChapter() }}
                    style={gBtn({ padding: '9px 16px' })}
                  >
                    + Add Manually
                  </button>
                </div>

                {/* Tip */}
                <div style={{ marginTop: '10px', padding: '10px 14px', background: 'rgba(245,197,24,0.06)', border: '1px solid rgba(245,197,24,0.15)', borderRadius: '10px', fontSize: '12px', color: 'var(--muted)', lineHeight: '1.5' }}>
                  💡 <strong style={{ color: '#f5c518' }}>Tip for long books:</strong> If your book has chapters, paste the full text and click "Auto-Detect Chapters". Each chapter will be generated separately as a downloadable MP3.
                </div>
              </div>
            </div>
          )}

          {/* ══ TAB: CHAPTERS ══ */}
          {tab === 'chapters' && (
            <div>
              {/* Top bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
                  {chapters.length} chapters · {totalWords.toLocaleString()} words · {durLabel(totalWords, speed)}
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={addChapter} style={gBtn()}>+ Add Chapter</button>
                  <button onClick={() => setTab('generate')} style={yBtn({ padding: '7px 16px' })}>Continue →</button>
                </div>
              </div>

              {/* Empty state */}
              {chapters.length === 0 && (
                <div style={{ ...card(), textAlign: 'center', padding: '60px 20px' }}>
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>📑</div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '8px' }}>No chapters yet</div>
                  <div style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '16px' }}>
                    Go to Book Setup → paste your text → click "Auto-Detect Chapters"
                  </div>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button onClick={() => setTab('setup')} style={gBtn()}>← Book Setup</button>
                    <button onClick={addChapter} style={yBtn()}>+ Add Chapter Manually</button>
                  </div>
                </div>
              )}

              {/* Chapter list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {chapters.map((ch, idx) => {
                  const isEditing  = editingId === ch.id
                  const isDragOver = dragOverId === ch.id
                  const sc         = SC[ch.status] || 'var(--muted)'

                  return (
                    <div
                      key={ch.id}
                      draggable={!isEditing}
                      onDragStart={() => onDragStart(idx)}
                      onDragEnter={() => onDragEnter(ch.id)}
                      onDragOver={e => e.preventDefault()}
                      onDrop={() => onDrop(idx)}
                      onDragEnd={() => { setDragOverId(null); dragIdx.current = null }}
                      style={{
                        background: 'var(--card-bg)',
                        border: `1px solid ${isDragOver ? '#f5c518' : 'var(--border)'}`,
                        borderRadius: '14px',
                        padding: '14px 16px',
                        cursor: isEditing ? 'default' : 'grab',
                        opacity: isDragOver ? 0.6 : 1,
                        transition: 'all 0.15s',
                      }}
                    >
                      {/* Header row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

                        {/* Drag handle */}
                        <span style={{ color: 'var(--muted)', fontSize: '14px', cursor: 'grab', userSelect: 'none', flexShrink: 0 }}>⠿</span>

                        {/* Index circle */}
                        <div style={{
                          width: '26px', height: '26px', borderRadius: '50%',
                          background: ch.status === 'done' ? 'rgba(34,211,165,0.2)' : 'var(--border)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '11px', fontWeight: 700, color: ch.status === 'done' ? '#22d3a5' : 'var(--muted)',
                          flexShrink: 0,
                        }}>
                          {ch.status === 'done' ? '✓' : idx + 1}
                        </div>

                        {/* Title — editable when editing */}
                        {isEditing ? (
                          <input
                            value={ch.title}
                            onChange={e => setChapter(ch.id, { title: e.target.value })}
                            onClick={e => e.stopPropagation()}
                            autoFocus
                            style={{ ...inp(), flex: 1, fontSize: '14px', fontWeight: 600 }}
                          />
                        ) : (
                          <div style={{ flex: 1, fontSize: '14px', fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {ch.title}
                          </div>
                        )}

                        {/* Metadata */}
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
                          <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{ch.wordCount.toLocaleString()}w</span>

                          {/* Status badge */}
                          <span style={{
                            fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '99px',
                            background: 'var(--bg)', color: sc, textTransform: 'capitalize',
                            display: 'flex', alignItems: 'center', gap: '4px',
                          }}>
                            {ch.status === 'generating' && (
                              <span style={{ display: 'inline-block', width: '5px', height: '5px', borderRadius: '50%', background: '#f5c518', animation: 'ab-pulse 1s infinite' }} />
                            )}
                            {ch.status}
                          </span>

                          {/* Per-chapter voice badge */}
                          {ch.voiceName && (
                            <span style={{ fontSize: '10px', background: 'rgba(91,142,240,0.15)', color: '#5b8ef0', padding: '2px 8px', borderRadius: '99px' }}>
                              🎙 {ch.voiceName}
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }} onClick={e => e.stopPropagation()}>

                          {/* Play */}
                          {ch.audioBlob && (
                            <button onClick={() => playChapter(ch)} style={gBtn({ padding: '5px 9px', color: playingId === ch.id ? '#f5c518' : 'var(--muted)' })}>
                              {playingId === ch.id ? '⏸' : '▶'}
                            </button>
                          )}

                          {/* Download */}
                          {ch.audioBlob && (
                            <button onClick={() => downloadChapter(ch)} style={gBtn({ padding: '5px 9px' })}>⬇</button>
                          )}

                          {/* Regenerate / Generate */}
                          {ch.status !== 'generating' && (
                            <button
                              onClick={() => genChapter(ch)}
                              disabled={isGenerating || !ch.text.trim()}
                              title={ch.status === 'done' ? 'Re-generate' : 'Generate this chapter'}
                              style={gBtn({
                                padding: '5px 9px',
                                color: ch.status === 'done' ? '#22d3a5' : '#f5c518',
                                borderColor: ch.status === 'done' ? 'rgba(34,211,165,0.3)' : 'rgba(245,197,24,0.3)',
                                opacity: !ch.text.trim() ? 0.4 : 1,
                              })}
                            >
                              {ch.status === 'done' ? '↺' : '⚡'}
                            </button>
                          )}

                          {/* Voice override */}
                          <button onClick={() => openPicker(ch.id)} title="Set voice for this chapter" style={gBtn({ padding: '5px 9px' })}>🎙</button>

                          {/* Edit */}
                          <button
                            onClick={() => setEditingId(isEditing ? null : ch.id)}
                            style={gBtn({ padding: '5px 9px', color: isEditing ? '#f5c518' : 'var(--muted)' })}
                          >✏</button>

                          {/* Delete */}
                          <button onClick={() => deleteChapter(ch.id)} style={gBtn({ padding: '5px 9px', color: '#f05b5b' })}>✕</button>
                        </div>
                      </div>

                      {/* Editable text area */}
                      {isEditing && (
                        <div style={{ marginTop: '12px' }} onClick={e => e.stopPropagation()}>
                          <textarea
                            value={ch.text}
                            onChange={e => setChapter(ch.id, { text: e.target.value })}
                            placeholder="Chapter content..."
                            style={{
                              width: '100%', minHeight: '160px',
                              background: 'var(--bg)',
                              border: '1px solid var(--border)',
                              borderRadius: '10px', padding: '12px',
                              color: 'var(--text)', fontSize: '13px', lineHeight: '1.7',
                              outline: 'none', resize: 'vertical',
                              fontFamily: 'DM Sans, sans-serif',
                              textAlign: 'left', direction: 'ltr',
                              boxSizing: 'border-box',
                            }}
                          />
                          <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>
                            {ch.wordCount.toLocaleString()} words · {ch.charCount.toLocaleString()} chars
                          </div>
                        </div>
                      )}

                      {/* Error */}
                      {ch.status === 'error' && ch.errorMsg && (
                        <div style={{ marginTop: '8px', padding: '8px 12px', background: 'rgba(240,91,91,0.1)', border: '1px solid rgba(240,91,91,0.2)', borderRadius: '8px', fontSize: '12px', color: '#f05b5b' }}>
                          ⚠️ {ch.errorMsg}
                        </div>
                      )}

                      {/* Generating bar */}
                      {ch.status === 'generating' && (
                        <div style={{ marginTop: '8px', height: '3px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: '40%', background: '#f5c518', borderRadius: '99px', animation: 'ab-slide 1.4s infinite linear' }} />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ══ TAB: GENERATE ══ */}
          {tab === 'generate' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* Pre-flight */}
              <div style={card()}>
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '14px' }}>PRE-FLIGHT SUMMARY</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '14px' }}>
                  {[
                    { label: 'Chapters',       value: chapters.length },
                    { label: 'Total Words',     value: totalWords.toLocaleString() },
                    { label: 'Chars to Use',    value: totalChars.toLocaleString() },
                    { label: 'Est. Duration',   value: durLabel(totalWords, speed) },
                    { label: 'Credits Needed',  value: totalChars.toLocaleString() },
                    { label: 'Credits Left',    value: creditsLeft.toLocaleString() },
                  ].map((s, i) => (
                    <div key={i} style={{ padding: '12px', background: 'var(--bg)', borderRadius: '10px' }}>
                      <div style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>{s.label}</div>
                      <div style={{
                        fontSize: '18px', fontWeight: 800, fontFamily: 'Syne, sans-serif',
                        color: i === 5 && totalChars > creditsLeft ? '#f05b5b' : 'var(--text)',
                      }}>{s.value}</div>
                    </div>
                  ))}
                </div>

                {/* Warnings */}
                {chapters.length === 0 && (
                  <div style={{ padding: '10px 14px', background: 'rgba(245,197,24,0.07)', border: '1px solid rgba(245,197,24,0.2)', borderRadius: '10px', fontSize: '13px', color: '#f5c518', marginBottom: '10px' }}>
                    ⚠️ No chapters yet. Go to Chapters tab first.
                  </div>
                )}
                {totalChars > creditsLeft && (
                  <div style={{ padding: '10px 14px', background: 'rgba(240,91,91,0.07)', border: '1px solid rgba(240,91,91,0.2)', borderRadius: '10px', fontSize: '13px', color: '#f05b5b', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    ⚠️ Not enough credits.
                    <button onClick={() => router.push('/dashboard/billing')} style={{ background: 'none', border: 'none', color: '#f5c518', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}>Upgrade →</button>
                  </div>
                )}
                {genError && (
                  <div style={{ padding: '10px 14px', background: 'rgba(240,91,91,0.07)', border: '1px solid rgba(240,91,91,0.2)', borderRadius: '10px', fontSize: '13px', color: '#f05b5b', marginBottom: '10px' }}>
                    ⚠️ {genError}
                  </div>
                )}
              </div>

              {/* Progress tracker */}
              {(isGenerating || doneCount > 0) && (
                <div style={card()}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
                      {isGenerating ? 'Generating...' : doneCount === chapters.filter(c=>c.text.trim()).length ? '✅ All done!' : `${doneCount} of ${chapters.filter(c=>c.text.trim()).length} generated`}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#f5c518' }}>{progress}%</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden', marginBottom: '14px' }}>
                    <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #f5c518, #f59e0b)', borderRadius: '99px', transition: 'width 0.4s' }} />
                  </div>

                  {/* Per-chapter status rows */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {chapters.filter(c => c.text.trim()).map((c, i) => {
                      const sc = SC[c.status] || 'var(--muted)'
                      return (
                        <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}>
                          <span style={{ color: 'var(--muted)', width: '20px', textAlign: 'right', flexShrink: 0 }}>{i+1}</span>
                          <div style={{ flex: 1, height: '3px', background: 'var(--bg)', borderRadius: '99px' }}>
                            <div style={{ height: '100%', width: c.status==='done'?'100%':c.status==='generating'?'50%':'0%', background: sc, borderRadius: '99px', transition: 'width 0.3s' }} />
                          </div>
                          <span style={{ color: sc, width: '72px', flexShrink: 0, textTransform: 'capitalize', textAlign: 'right' }}>{c.status}</span>
                          <span style={{ color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '220px' }}>{c.title}</span>
                          {c.audioBlob && (
                            <button onClick={() => downloadChapter(c)} title="Download" style={gBtn({ padding: '3px 8px', fontSize: '11px' })}>⬇</button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Generate / Cancel / Download All */}
              <div style={{ display: 'flex', gap: '10px' }}>
                {!isGenerating ? (
                  <button
                    onClick={handleGenerateAll}
                    disabled={chapters.length === 0 || totalChars > creditsLeft}
                    style={{
                      flex: 1, padding: '14px',
                      background: chapters.length === 0 || totalChars > creditsLeft ? 'var(--border)' : '#f5c518',
                      color: chapters.length === 0 || totalChars > creditsLeft ? 'var(--muted)' : '#000',
                      border: 'none', borderRadius: '14px',
                      fontSize: '15px', fontWeight: 800, cursor: 'pointer',
                      fontFamily: 'Syne, sans-serif',
                    }}
                  >
                    🚀 Generate All {chapters.filter(c=>c.text.trim()).length} Chapters
                  </button>
                ) : (
                  <button
                    onClick={() => { cancelledRef.current = true; setIsGenerating(false) }}
                    style={{ flex: 1, padding: '14px', background: 'rgba(240,91,91,0.1)', border: '1px solid rgba(240,91,91,0.3)', borderRadius: '14px', color: '#f05b5b', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Syne, sans-serif' }}
                  >
                    ✕ Cancel
                  </button>
                )}

                {doneCount > 0 && !isGenerating && (
                  <button onClick={downloadAll} style={yBtn({ padding: '14px 20px', fontSize: '14px' })}>
                    ⬇ Download All
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{ width: '256px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          {/* Book cover */}
          <div style={{ ...card(), background: 'linear-gradient(135deg, rgba(245,197,24,0.12), rgba(91,142,240,0.1))', textAlign: 'center', padding: '24px 16px' }}>
            <div style={{ fontSize: '36px', marginBottom: '10px' }}>📚</div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: 800, color: 'var(--text)', marginBottom: '4px', wordBreak: 'break-word' }}>
              {bookTitle || 'Your Book'}
            </div>
            {author && <div style={{ fontSize: '12px', color: 'var(--muted)' }}>by {author}</div>}
            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginTop: '10px', flexWrap: 'wrap' }}>
              {genre    && <span style={{ fontSize: '10px', background: 'rgba(245,197,24,0.15)', color: '#f5c518', padding: '2px 8px', borderRadius: '99px' }}>{genre}</span>}
              {language && <span style={{ fontSize: '10px', background: 'var(--border)', color: 'var(--muted)', padding: '2px 8px', borderRadius: '99px' }}>{LANGUAGES.find(l=>l.code===language)?.flag} {language.toUpperCase()}</span>}
            </div>
          </div>

          {/* Global Voice */}
          <div style={card()}>
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '10px' }}>GLOBAL VOICE</div>
            {globalVoice ? (
              <div style={{ padding: '10px', background: 'rgba(245,197,24,0.07)', border: '1px solid rgba(245,197,24,0.2)', borderRadius: '10px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(245,197,24,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: '#f5c518', flexShrink: 0 }}>
                  {globalVoice.name[0].toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#f5c518', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{globalVoice.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{globalVoice.language?.toUpperCase()}</div>
                </div>
                <button onClick={() => setGlobalVoice(null)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '18px' }}>×</button>
              </div>
            ) : (
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '8px' }}>No voice — AI default used</div>
            )}
            <button onClick={() => openPicker('global')} style={{ ...gBtn(), width: '100%', textAlign: 'center', fontSize: '12px' }}>
              🎙 {globalVoice ? 'Change Voice' : 'Select Voice'}
            </button>
          </div>

          {/* Speed */}
          <div style={card()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)' }}>SPEED</div>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#f5c518' }}>{speed}x</span>
            </div>
            <input type="range" min="0.5" max="2.0" step="0.1" value={speed} onChange={e => setSpeed(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#f5c518' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--muted)', marginTop: '3px' }}>
              <span>Slow</span><span>Normal</span><span>Fast</span>
            </div>
          </div>

          {/* Stats */}
          {chapters.length > 0 && (
            <div style={card()}>
              <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '10px' }}>STATS</div>
              {[
                { label: 'Chapters',    value: chapters.length },
                { label: 'Words',       value: totalWords.toLocaleString() },
                { label: 'Duration',    value: durLabel(totalWords, speed) },
                { label: 'Generated',   value: `${doneCount}/${chapters.filter(c=>c.text.trim()).length}` },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '5px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
                  <span style={{ color: 'var(--muted)' }}>{s.label}</span>
                  <span style={{ color: 'var(--text)', fontWeight: 600 }}>{s.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* New book */}
          <button
            onClick={() => {
              if (!confirm('Clear everything and start a new book?')) return
              setBookTitle(''); setAuthor(''); setGenre('Fiction'); setLanguage('en')
              setRawText(''); setChapters([]); setGlobalVoice(null); setSpeed(1.0)
              setTab('setup')
              localStorage.removeItem('ab_draft_v2')
            }}
            style={{ ...gBtn(), width: '100%', textAlign: 'center', fontSize: '12px' }}
          >
            🗑 Clear & Start New
          </button>
        </div>
      </div>

      {/* ── Voice Picker Modal ── */}
      {showVoicePicker && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          onClick={() => setShowVoicePicker(false)}
        >
          <div
            style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px', width: '100%', maxWidth: '460px', maxHeight: '70vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}>
                {pickerTarget === 'global' ? '🌐 Global Voice' : '🎙 Chapter Voice'}
              </div>
              <button onClick={() => setShowVoicePicker(false)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '20px' }}>×</button>
            </div>

            <input
              value={voiceSearch}
              onChange={e => setVoiceSearch(e.target.value)}
              placeholder="Search saved voices..."
              autoFocus
              style={{ ...inp(), marginBottom: '12px' }}
            />

            <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {filteredSV.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)', fontSize: '13px' }}>
                  No saved voices found.{' '}
                  <button
                    onClick={() => { setShowVoicePicker(false); router.push('/dashboard/library') }}
                    style={{ background: 'none', border: 'none', color: '#f5c518', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Browse Library →
                  </button>
                </div>
              )}
              {filteredSV.map(v => {
                const name = v.voice_name || v.name || 'Voice'
                const lang = v.language || ''
                return (
                  <button
                    key={v.id}
                    onClick={() => pickVoice(v)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '10px 12px', background: 'var(--card-bg)',
                      border: '1px solid var(--border)', borderRadius: '10px',
                      cursor: 'pointer', textAlign: 'left', width: '100%',
                    }}
                  >
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(245,197,24,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: '#f5c518', flexShrink: 0 }}>
                      {name[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{name}</div>
                      {lang && <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{lang.toUpperCase()}</div>}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* CSS keyframes */}
      <style>{`
        @keyframes ab-pulse {
          0%,100% { opacity:1; transform:scale(1); }
          50% { opacity:0.4; transform:scale(0.8); }
        }
        @keyframes ab-slide {
          0% { transform: translateX(-150%); }
          100% { transform: translateX(350%); }
        }
      `}</style>
    </div>
  )
}
