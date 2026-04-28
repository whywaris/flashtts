'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import toast, { Toaster } from 'react-hot-toast'
import { Search, Play, Pause, ChevronDown, Star, ArrowRight } from 'lucide-react'

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  bg:         'var(--bg)',
  card:       'var(--card-bg)',
  surface:    'var(--surface)',
  border:     'var(--border)',
  accent:     '#2DD4BF',
  accentDim:  'rgba(45,212,191,0.10)',
  accentRing: 'rgba(45,212,191,0.25)',
  text:       'var(--text)',
  muted:      'var(--muted)',
  faint:      'var(--faint)',
}

// ─── Language accent colors (for avatar background tint) ─────────────────────
const LANG_COLORS: Record<string, string> = {
  en: '#3B82F6', ar: '#22C55E', es: '#F59E0B', de: '#9CA3AF',
  fr: '#6366F1', hi: '#F97316', ja: '#EC4899', ko: '#8B5CF6',
  pt: '#10B981', tr: '#EF4444', ru: '#60A5FA', it: '#4ADE80',
  nl: '#FB923C', pl: '#F472B6', sv: '#34D399', no: '#38BDF8',
  da: '#A78BFA', fi: '#6EE7B7', el: '#FCD34D', ms: '#86EFAC',
  he: '#93C5FD', zh: '#F87171', sw: '#A3E635',
}
function getLangColor(lang?: string): string {
  return (lang && LANG_COLORS[lang]) || '#2DD4BF'
}

import { getAvatarPath, getAvatarBackdrop } from '@/utils/avatar'

// ─── Voice Avatar ─────────────────────────────────────────────────────────────
function VoiceAvatar({
  name, gender, language, size = 44,
}: {
  name: string; gender?: string; language?: string; size?: number
}) {
  const avatarUrl = getAvatarPath(name, gender)
  const backdrop  = getAvatarBackdrop(name)
  const langEntry = LANGUAGES.find(l => l.code === language)
  const flag      = langEntry?.flag || ''

  return (
    <div style={{ width: size, height: size, position: 'relative', flexShrink: 0 }}>
      {/* circular clip */}
      <div style={{
        width: size, height: size, borderRadius: '50%',
        overflow: 'hidden',
        border: `1.5px solid var(--border)`,
        background: backdrop,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <img
          src={avatarUrl}
          alt={name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>

      {/* language flag badge */}
      {flag && (
        <div style={{
          position: 'absolute',
          bottom: -1,
          right: -3,
          width: 17,
          height: 17,
          borderRadius: '50%',
          background: T.card,
          border: `1.5px solid ${T.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 9,
          lineHeight: 1,
          userSelect: 'none',
        }}>
          {flag}
        </div>
      )}
    </div>
  )
}

// ─── Languages ────────────────────────────────────────────────────────────────
const LANGUAGES = [
  { code: 'all', label: 'All Languages',  flag: '🌍' },
  { code: 'en',  label: 'English',        flag: '🇺🇸' },
  { code: 'ar',  label: 'Arabic',         flag: '🇸🇦' },
  { code: 'da',  label: 'Danish',         flag: '🇩🇰' },
  { code: 'de',  label: 'German',         flag: '🇩🇪' },
  { code: 'el',  label: 'Greek',          flag: '🇬🇷' },
  { code: 'es',  label: 'Spanish',        flag: '🇪🇸' },
  { code: 'fi',  label: 'Finnish',        flag: '🇫🇮' },
  { code: 'fr',  label: 'French',         flag: '🇫🇷' },
  { code: 'he',  label: 'Hebrew',         flag: '🇮🇱' },
  { code: 'hi',  label: 'Hindi',          flag: '🇮🇳' },
  { code: 'it',  label: 'Italian',        flag: '🇮🇹' },
  { code: 'ja',  label: 'Japanese',       flag: '🇯🇵' },
  { code: 'ko',  label: 'Korean',         flag: '🇰🇷' },
  { code: 'ms',  label: 'Malay',          flag: '🇲🇾' },
  { code: 'nl',  label: 'Dutch',          flag: '🇳🇱' },
  { code: 'no',  label: 'Norwegian',      flag: '🇳🇴' },
  { code: 'pl',  label: 'Polish',         flag: '🇵🇱' },
  { code: 'pt',  label: 'Portuguese',     flag: '🇵🇹' },
  { code: 'ru',  label: 'Russian',        flag: '🇷🇺' },
  { code: 'sv',  label: 'Swedish',        flag: '🇸🇪' },
  { code: 'sw',  label: 'Swahili',        flag: '🇰🇪' },
  { code: 'tr',  label: 'Turkish',        flag: '🇹🇷' },
]

const PLAN_VOICE_LIMITS: Record<string, number> = {
  free: 1, starter: 3, creator: 5, pro: 10, studio: 20,
}

const PER_PAGE = 24

// ─── Voice Card ───────────────────────────────────────────────────────────────
interface VoiceCardProps {
  voice: any
  isSaved: boolean
  isPlaying: boolean
  isSaving: boolean
  saveDisabled: boolean
  isAtLimit: boolean
  voiceLimit: number
  onPlay: () => void
  onSave: () => void
  onUse: () => void
  compact?: boolean
}

function VoiceCard({
  voice, isSaved, isPlaying, saveDisabled, isAtLimit, voiceLimit,
  onPlay, onSave, onUse, compact = false,
}: VoiceCardProps) {
  const [hovered, setHovered] = useState(false)
  const langData = LANGUAGES.find(l => l.code === voice.language)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: T.card,
        border: `1px solid ${isPlaying ? T.accentRing : hovered ? 'rgba(45,212,191,0.3)' : T.border}`,
        borderRadius: '12px',
        padding: compact ? '14px' : '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        position: 'relative',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
        boxShadow: hovered || isPlaying ? '0 0 20px rgba(45,212,191,0.08)' : 'none',
        minWidth: compact ? '180px' : undefined,
      }}
    >
      {/* Save star — top-right */}
      <button
        onClick={e => { e.stopPropagation(); onSave() }}
        disabled={saveDisabled}
        title={isSaved ? 'Remove from saved' : isAtLimit ? `Limit reached (${voiceLimit})` : 'Save voice'}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'none',
          border: 'none',
          cursor: saveDisabled && !isSaved ? 'not-allowed' : 'pointer',
          padding: '2px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: saveDisabled && !isSaved ? 0.3 : 1,
          transition: 'opacity 0.15s',
          zIndex: 1,
        }}
      >
        <Star
          size={16}
          color={isSaved ? T.accent : T.faint}
          fill={isSaved ? T.accent : 'none'}
          strokeWidth={2}
        />
      </button>

      {/* Avatar + name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingRight: '24px' }}>
        <VoiceAvatar
          name={voice.name}
          gender={voice.gender}
          language={voice.language}
          size={44}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            margin: '0 0 5px',
            fontSize: '15px',
            fontWeight: 600,
            color: T.text,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontFamily: 'Inter, sans-serif',
          }}>
            {voice.name}
          </p>
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
            {langData && (
              <span style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '2px 7px',
                borderRadius: '4px',
                background: `${getLangColor(voice.language)}18`,
                color: getLangColor(voice.language),
                fontFamily: 'Inter, sans-serif',
              }}>
                {langData.flag} {langData.label}
              </span>
            )}
            {voice.gender && (
              <span style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '2px 7px',
                borderRadius: '4px',
                background: 'rgba(255,255,255,0.06)',
                color: T.muted,
                textTransform: 'capitalize',
                fontFamily: 'Inter, sans-serif',
              }}>
                {voice.gender}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {voice.description && !compact && (
        <p style={{
          margin: 0,
          fontSize: '12px',
          color: T.muted,
          lineHeight: 1.45,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontFamily: 'Inter, sans-serif',
        }}>
          {voice.description}
        </p>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '7px', marginTop: 'auto' }}>
        {/* Preview */}
        <button
          onClick={onPlay}
          className="lib-preview-btn"
          style={{
            flex: 1,
            padding: '8px 0',
            borderRadius: '8px',
            border: `1px solid ${isPlaying ? T.accentRing : 'rgba(255,255,255,0.10)'}`,
            background: isPlaying ? T.accentDim : 'transparent',
            color: isPlaying ? T.accent : T.muted,
            fontSize: '12.5px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            transition: 'all 0.15s ease',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {isPlaying
            ? <><Pause size={12} fill="currentColor" strokeWidth={0} /> Stop</>
            : <><Play  size={12} fill="currentColor" strokeWidth={0} /> Preview</>
          }
        </button>

        {/* Use in TTS */}
        <button
          onClick={onUse}
          style={{
            flex: 1,
            padding: '8px 0',
            borderRadius: '8px',
            border: 'none',
            background: T.accent,
            color: '#0A0A0F',
            fontSize: '12.5px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            transition: 'filter 0.15s ease',
            fontFamily: 'Inter, sans-serif',
          }}
          className="lib-use-btn"
        >
          Use <ArrowRight size={12} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
export default function VoiceLibraryPage() {
  const supabase    = useMemo(() => createClient(), [])
  const router      = useRouter()
  const audioRef    = useRef<HTMLAudioElement | null>(null)
  const langRef     = useRef<HTMLDivElement>(null)
  const loaderRef   = useRef<HTMLDivElement>(null)

  const [user,        setUser]        = useState<any>(null)
  const [userPlan,    setUserPlan]    = useState<string>('free')
  const [voices,      setVoices]      = useState<any[]>([])
  const [loading,     setLoading]     = useState(true)
  const [savedIds,    setSavedIds]    = useState<Set<string>>(new Set())
  const [savedCount,  setSavedCount]  = useState(0)
  const [savingId,    setSavingId]    = useState<string | null>(null)
  const [saveError,   setSaveError]   = useState<string | null>(null)
  const [playingId,   setPlayingId]   = useState<string | null>(null)

  // Filters
  const [search,          setSearch]          = useState('')
  const [selectedLang,    setSelectedLang]    = useState('all')
  const [selectedGender,  setSelectedGender]  = useState('all')
  const [page,            setPage]            = useState(1)
  const [isLangOpen,      setIsLangOpen]      = useState(false)
  const [langSearch,      setLangSearch]      = useState('')

  // ── Close dropdown on outside click ─────────────────────────────────────────
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node))
        setIsLangOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  const selectedLangData = LANGUAGES.find(l => l.code === selectedLang) || LANGUAGES[0]
  const filteredLangs    = LANGUAGES.filter(l =>
    l.label.toLowerCase().includes(langSearch.toLowerCase()) ||
    l.code.toLowerCase().includes(langSearch.toLowerCase())
  )

  // ── Load ─────────────────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      const { data: voicesData } = await supabase
        .from('voices')
        .select('id, name, language, gender, description, sample_url, is_featured')
        .eq('is_active', true)
        .order('name')
      setVoices(voicesData || [])

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('plan')
          .eq('id', user.id)
          .single()
        if (profile?.plan) setUserPlan(profile.plan)

        const { data: saved } = await supabase
          .from('saved_voices')
          .select('voice_id')
          .eq('user_id', user.id)
        const ids = saved?.map((s: any) => s.voice_id) || []
        setSavedIds(new Set(ids))
        setSavedCount(ids.length)
      }

      setLoading(false)
    }
    load()
  }, [supabase])

  // ── Featured English voices ──────────────────────────────────────────────────
  const featuredVoices = useMemo(() => {
    if (voices.length === 0) return []
    const featured = voices.filter(v => v.language === 'en' && v.is_featured)
    if (featured.length >= 4) return featured.slice(0, 8)
    return voices.filter(v => v.language === 'en').slice(0, 8)
  }, [voices])

  // ── Filter ───────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => voices.filter(v => {
    if (selectedLang !== 'all' && v.language !== selectedLang) return false
    if (selectedGender !== 'all' && v.gender?.toLowerCase() !== selectedGender) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      if (!v.name?.toLowerCase().includes(q) && !v.description?.toLowerCase().includes(q)) return false
    }
    return true
  }), [voices, selectedLang, selectedGender, search])

  const paginated = filtered.slice(0, page * PER_PAGE)
  const hasMore   = paginated.length < filtered.length

  useEffect(() => { setPage(1) }, [selectedLang, selectedGender, search])

  // ── Infinite scroll ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!hasMore || loading) return
    const observer = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) setPage(p => p + 1) },
      { threshold: 0.1 }
    )
    if (loaderRef.current) observer.observe(loaderRef.current)
    return () => observer.disconnect()
  }, [hasMore, loading, filtered.length])

  // ── Play ─────────────────────────────────────────────────────────────────────
  function playVoice(voice: any) {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
    if (playingId === voice.id) { setPlayingId(null); return }
    if (!voice.sample_url) return
    const audio = new Audio(voice.sample_url)
    audio.play().catch(() => {})
    audio.onended = () => setPlayingId(null)
    audioRef.current = audio
    setPlayingId(voice.id)
  }

  // ── Save ─────────────────────────────────────────────────────────────────────
  async function toggleSave(voice: any) {
    if (!user) { router.push('/login'); return }
    setSavingId(voice.id)
    setSaveError(null)

    const isSaved    = savedIds.has(voice.id)
    const voiceLimit = PLAN_VOICE_LIMITS[userPlan] ?? 1

    if (isSaved) {
      const { error } = await supabase
        .from('saved_voices')
        .delete()
        .eq('user_id', user.id)
        .eq('voice_id', voice.id)
      if (!error) {
        setSavedIds(prev => { const n = new Set(prev); n.delete(voice.id); return n })
        setSavedCount(c => c - 1)
        toast.success('Voice removed')
      }
    } else {
      if (savedCount >= voiceLimit) {
        setSaveError(`Limit reached. Your ${userPlan} plan allows ${voiceLimit} saved voice${voiceLimit > 1 ? 's' : ''}. Upgrade to save more.`)
        setSavingId(null)
        return
      }
      const { error } = await supabase.from('saved_voices').upsert({
        user_id:    user.id,
        voice_id:   voice.id,
        name:       voice.name,
        voice_name: voice.name,
        language:   voice.language || null,
        gender:     voice.gender   || null,
        source:     'library',
        r2_url:     null,
      }, { onConflict: 'user_id,voice_id' })

      if (error) {
        setSaveError('Failed to save voice. Please try again.')
      } else {
        setSavedIds(prev => new Set([...prev, voice.id]))
        setSavedCount(c => c + 1)
        toast.success('Voice saved!')
      }
    }
    setSavingId(null)
  }

  // ── Use in TTS ───────────────────────────────────────────────────────────────
  function useInTTS(voice: any) {
    localStorage.setItem('flashtts_selected_voice', JSON.stringify({
      id: voice.id, name: voice.name,
      language: voice.language, gender: voice.gender,
      sample_url: voice.sample_url,
    }))
    router.push('/dashboard/tts')
  }

  // ── Derived ──────────────────────────────────────────────────────────────────
  const voiceLimit = PLAN_VOICE_LIMITS[userPlan] ?? 1
  const isAtLimit  = savedCount >= voiceLimit

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ width: '100%', fontFamily: 'Inter, sans-serif' }}>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: T.card,
            border: `1px solid ${T.border}`,
            color: T.text,
            fontSize: '13px',
          },
        }}
      />

      {/* ── Top bar: saved count + nav ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: '20px', gap: '8px' }}>
          <div style={{
            padding: '7px 14px',
            background: isAtLimit ? 'rgba(239,68,68,0.08)' : T.accentDim,
            border: `1px solid ${isAtLimit ? 'rgba(239,68,68,0.25)' : T.accentRing}`,
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 700,
            color: isAtLimit ? '#f87171' : T.accent,
          }}>
            {savedCount} / {voiceLimit} saved
          </div>
          {savedCount > 0 && (
            <button
              onClick={() => router.push('/dashboard/saved')}
              style={{
                padding: '7px 14px',
                background: 'transparent',
                border: `1px solid ${T.border}`,
                borderRadius: '8px',
                color: T.muted,
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              className="lib-saved-btn"
            >
              View Saved →
            </button>
          )}
      </div>

      {/* ── Limit warning ── */}
      {isAtLimit && (
        <div style={{
          marginBottom: '20px',
          padding: '12px 18px',
          background: 'rgba(239,68,68,0.06)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: '13px', color: '#f87171', fontWeight: 500 }}>
            Voice limit reached ({voiceLimit}/{voiceLimit}) — remove a saved voice or upgrade your plan
          </span>
          <button
            onClick={() => router.push('/dashboard/billing')}
            style={{ fontSize: '12px', fontWeight: 700, color: T.accent, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            Upgrade →
          </button>
        </div>
      )}

      {/* ── Save error ── */}
      {saveError && (
        <div style={{
          marginBottom: '16px',
          padding: '12px 16px',
          background: 'rgba(239,68,68,0.06)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}>
          <span style={{ fontSize: '13px', color: '#f87171', fontWeight: 500 }}>{saveError}</span>
          <button onClick={() => setSaveError(null)} style={{ background: 'none', border: 'none', color: T.faint, cursor: 'pointer', fontSize: '18px', lineHeight: 1 }}>×</button>
        </div>
      )}

      {/* ── Search bar ── */}
      <div style={{ position: 'relative', marginBottom: '12px' }}>
        <Search size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: T.faint, pointerEvents: 'none' }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search voices by name or description…"
          className="lib-search"
          style={{
            width: '100%',
            padding: '11px 14px 11px 40px',
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: '8px',
            color: T.text,
            fontSize: '13.5px',
            outline: 'none',
            boxSizing: 'border-box',
            fontFamily: 'Inter, sans-serif',
            transition: 'border-color 0.15s',
          }}
        />
      </div>

      {/* ── Filter row ── */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '28px', alignItems: 'center', flexWrap: 'wrap' }}>

        {/* Gender pills */}
        <div style={{
          display: 'flex',
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: '8px',
          padding: '3px',
          gap: '2px',
        }}>
          {[
            { value: 'all',    label: 'All'    },
            { value: 'female', label: 'Female' },
            { value: 'male',   label: 'Male'   },
          ].map(g => (
            <button
              key={g.value}
              onClick={() => setSelectedGender(g.value)}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                background: selectedGender === g.value ? T.accent : 'transparent',
                color: selectedGender === g.value ? '#0A0A0F' : T.muted,
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                transition: 'all 0.15s',
              }}
            >
              {g.label}
            </button>
          ))}
        </div>

        {/* Result count */}
        {(search || selectedLang !== 'all' || selectedGender !== 'all') && (
          <span style={{ fontSize: '12.5px', color: T.faint, marginLeft: 'auto' }}>
            {filtered.length.toLocaleString()} result{filtered.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '80px 0', gap: '12px' }}>
          <div style={{
            width: '28px', height: '28px',
            border: `3px solid ${T.accentDim}`,
            borderTop: `3px solid ${T.accent}`,
            borderRadius: '50%',
            animation: 'spin 0.7s linear infinite',
          }} />
          <span style={{ fontSize: '13px', color: T.muted }}>Loading voices…</span>
        </div>
      )}

      {/* ── Featured English voices (only when no active filter) ── */}
      {!loading && featuredVoices.length > 0 && !search && selectedLang === 'all' && selectedGender === 'all' && (
        <section style={{ marginBottom: '36px' }}>
          <p style={{
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: T.faint,
            margin: '0 0 14px',
          }}>
            Featured English Voices
          </p>

          <div
            style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}
            className="no-scrollbar"
          >
            {featuredVoices.map(voice => (
              <div key={`feat-${voice.id}`} style={{ flexShrink: 0, width: '190px' }}>
                <VoiceCard
                  voice={voice}
                  isSaved={savedIds.has(voice.id)}
                  isPlaying={playingId === voice.id}
                  isSaving={savingId === voice.id}
                  saveDisabled={savingId === voice.id || (isAtLimit && !savedIds.has(voice.id))}
                  isAtLimit={isAtLimit}
                  voiceLimit={voiceLimit}
                  onPlay={() => playVoice(voice)}
                  onSave={() => toggleSave(voice)}
                  onUse={() => useInTTS(voice)}
                  compact
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Empty state ── */}
      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ fontSize: '36px', marginBottom: '14px' }}>🔍</div>
          <p style={{ fontSize: '16px', fontWeight: 600, color: T.text, margin: '0 0 6px' }}>No voices found</p>
          <p style={{ fontSize: '13px', color: T.muted, margin: 0 }}>Try a different search term or filter</p>
        </div>
      )}

      {/* ── Voice grid ── */}
      {!loading && paginated.length > 0 && (
        <>
          {(!search && selectedLang === 'all' && selectedGender === 'all') && (
            <p style={{
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: T.faint,
              margin: '0 0 14px',
            }}>
              All Voices
            </p>
          )}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '12px',
            marginBottom: '32px',
          }}>
            {paginated.map(voice => (
              <VoiceCard
                key={voice.id}
                voice={voice}
                isSaved={savedIds.has(voice.id)}
                isPlaying={playingId === voice.id}
                isSaving={savingId === voice.id}
                saveDisabled={savingId === voice.id || (isAtLimit && !savedIds.has(voice.id))}
                isAtLimit={isAtLimit}
                voiceLimit={voiceLimit}
                onPlay={() => playVoice(voice)}
                onSave={() => toggleSave(voice)}
                onUse={() => useInTTS(voice)}
              />
            ))}
          </div>

          {/* Infinite scroll sentinel */}
          {hasMore && (
            <div
              ref={loaderRef}
              style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 0', gap: '10px' }}
            >
              <div style={{
                width: '22px', height: '22px',
                border: `2px solid ${T.accentDim}`,
                borderTop: `2px solid ${T.accent}`,
                borderRadius: '50%',
                animation: 'spin 0.7s linear infinite',
              }} />
              <span style={{ fontSize: '12.5px', color: T.muted }}>
                Loading more… ({filtered.length - paginated.length} remaining)
              </span>
            </div>
          )}
        </>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        .lib-search:focus { border-color: ${T.accent} !important; }
        .lib-search::placeholder { color: ${T.faint}; }

        .lib-preview-btn:hover {
          border-color: ${T.accentRing} !important;
          background: ${T.accentDim} !important;
          color: ${T.accent} !important;
        }
        .lib-use-btn:hover { filter: brightness(1.1); }
        .lib-saved-btn:hover {
          border-color: ${T.accentRing} !important;
          color: ${T.accent} !important;
        }
      `}</style>
    </div>
  )
}
