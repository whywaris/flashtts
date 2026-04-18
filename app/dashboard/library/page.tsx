'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import toast, { Toaster } from 'react-hot-toast'
import { getAvatarPath, getAvatarBackdrop } from '@/utils/avatar'

const LANGUAGES = [
  { code: 'all', label: 'All', flag: '🌍' },
  { code: 'ar', label: 'Arabic', flag: '🇸🇦' },
  { code: 'da', label: 'Danish', flag: '🇩🇰' },
  { code: 'de', label: 'German', flag: '🇩🇪' },
  { code: 'el', label: 'Greek', flag: '🇬🇷' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Spanish', flag: '🇪🇸' },
  { code: 'fi', label: 'Finnish', flag: '🇫🇮' },
  { code: 'fr', label: 'French', flag: '🇫🇷' },
  { code: 'he', label: 'Hebrew', flag: '🇮🇱' },
  { code: 'hi', label: 'Hindi', flag: '🇮🇳' },
  { code: 'it', label: 'Italian', flag: '🇮🇹' },
  { code: 'ja', label: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', label: 'Korean', flag: '🇰🇷' },
  { code: 'ms', label: 'Malay', flag: '🇲🇾' },
  { code: 'nl', label: 'Dutch', flag: '🇳🇱' },
  { code: 'no', label: 'Norwegian', flag: '🇳🇴' },
  { code: 'pl', label: 'Polish', flag: '🇵🇱' },
  { code: 'pt', label: 'Portuguese', flag: '🇵🇹' },
  { code: 'ru', label: 'Russian', flag: '🇷🇺' },
  { code: 'sv', label: 'Swedish', flag: '🇸🇪' },
  { code: 'sw', label: 'Swahili', flag: '🇰🇪' },
  { code: 'tr', label: 'Turkish', flag: '🇹🇷' },
]

// ── Plan limits (must match saved/page.tsx) ──────────────────────────────────
const PLAN_VOICE_LIMITS: Record<string, number> = {
  free: 1,
  starter: 3,
  creator: 5,
  pro: 10,
  studio: 20,
}



export default function VoiceLibraryPage() {
  const supabase = createClient()
  const router = useRouter()
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [user, setUser] = useState<any>(null)
  const [userPlan, setUserPlan] = useState<string>('free')
  const [voices, setVoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [savedCount, setSavedCount] = useState(0)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [playingId, setPlayingId] = useState<string | null>(null)

  // Filters
  const [search, setSearch] = useState('')
  const [selectedLang, setSelectedLang] = useState('all')
  const [selectedGender, setSelectedGender] = useState('all')
  const [page, setPage] = useState(1)
  const [isLangOpen, setIsLangOpen] = useState(false)
  const [langSearch, setLangSearch] = useState('')
  const langRef = useRef<HTMLDivElement>(null)
  const loaderRef = useRef<HTMLDivElement>(null)
  const PER_PAGE = 24

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node))
        setIsLangOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const selectedLangData = LANGUAGES.find(l => l.code === selectedLang) || LANGUAGES[0]
  const filteredLangs = LANGUAGES.filter(l =>
    l.label.toLowerCase().includes(langSearch.toLowerCase()) ||
    l.code.toLowerCase().includes(langSearch.toLowerCase())
  )

  // ── Load ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      const { data: voices } = await supabase
        .from('voices')
        .select('id, name, language, gender, description, sample_url, is_featured')
        .eq('is_active', true)
        .order('name')
      setVoices(voices || [])

      if (user) {
        // Fetch user plan
        const { data: profile } = await supabase
          .from('profiles')
          .select('plan')
          .eq('id', user.id)
          .single()
        if (profile?.plan) setUserPlan(profile.plan)

        // Fetch saved voices
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
  }, [])

  // ── Filter ──────────────────────────────────────────────────────────────────
  const filtered = voices.filter(v => {
    if (selectedLang !== 'all' && v.language !== selectedLang) return false
    if (selectedGender !== 'all' && v.gender?.toLowerCase() !== selectedGender) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      if (!v.name?.toLowerCase().includes(q) && !v.description?.toLowerCase().includes(q)) return false
    }
    return true
  })
  const paginated = filtered.slice(0, page * PER_PAGE)
  const hasMore = paginated.length < filtered.length
  
  useEffect(() => { setPage(1) }, [selectedLang, selectedGender, search])

  // ── Infinite Scroll ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!hasMore || loading) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage((prev) => prev + 1)
        }
      },
      { threshold: 0.1 }
    )

    if (loaderRef.current) {
      observer.observe(loaderRef.current)
    }

    return () => observer.disconnect()
  }, [hasMore, loading, filtered.length])

  // ── Play ────────────────────────────────────────────────────────────────────
  function playVoice(voice: any) {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
    if (playingId === voice.id) { setPlayingId(null); return }
    if (!voice.sample_url) return
    const audio = new Audio(voice.sample_url)
    audio.play().catch(() => { })
    audio.onended = () => setPlayingId(null)
    audioRef.current = audio
    setPlayingId(voice.id)
  }

  // ── Save ────────────────────────────────────────────────────────────────────
  async function toggleSave(voice: any) {
    if (!user) { router.push('/login'); return }
    setSavingId(voice.id)
    setSaveError(null)

    const isSaved = savedIds.has(voice.id)
    const voiceLimit = PLAN_VOICE_LIMITS[userPlan] ?? 1

    if (isSaved) {
      // ── Unsave ──
      const { error } = await supabase
        .from('saved_voices')
        .delete()
        .eq('user_id', user.id)
        .eq('voice_id', voice.id)

      if (!error) {
        setSavedIds(prev => { const n = new Set(prev); n.delete(voice.id); return n })
        setSavedCount(c => c - 1)
      } else {
        console.error('Unsave error:', error.message)
      }

    } else {
      // ── Save — check limit first ──
      if (savedCount >= voiceLimit) {
        setSaveError(`Limit reached! Your ${userPlan} plan allows ${voiceLimit} saved voice${voiceLimit > 1 ? 's' : ''}. Upgrade to save more.`)
        setSavingId(null)
        return
      }

      // ✅ FIX: Only columns that exist in saved_voices table
      // Removed: sample_url (does NOT exist)
      // Using: name, voice_name, voice_id, language, gender, source, r2_url
      const { error } = await supabase.from('saved_voices').upsert({
        user_id: user.id,
        voice_id: voice.id,
        name: voice.name,
        voice_name: voice.name,
        language: voice.language || null,
        gender: voice.gender || null,
        source: 'library',
        r2_url: null,
      }, { onConflict: 'user_id,voice_id' })

      if (error) {
        console.error('Save error:', error.message)
        setSaveError('Failed to save voice. Please try again.')
      } else {
        setSavedIds(prev => new Set([...prev, voice.id]))
        setSavedCount(c => c + 1)
      }
    }

    setSavingId(null)
  }

  // ── Use in TTS ──────────────────────────────────────────────────────────────
  function useInTTS(voice: any) {
    localStorage.setItem('tts_selected_voice', JSON.stringify({
      id: voice.id, name: voice.name,
      language: voice.language, gender: voice.gender,
      sample_url: voice.sample_url,
    }))
    router.push('/dashboard/tts')
  }

  // ── Derived ─────────────────────────────────────────────────────────────────
  const voiceLimit = PLAN_VOICE_LIMITS[userPlan] ?? 1
  const isAtLimit = savedCount >= voiceLimit

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ width: '100%' }}>
      <Toaster position="top-right" />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '26px', fontWeight: 800, color: 'var(--foreground)', marginBottom: '4px' }}>
            Voice Library
          </h1>

        </div>

        {/* Saved count + limit indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Slots indicator */}
          <div style={{ padding: '7px 14px', background: isAtLimit ? 'rgba(240,91,91,0.08)' : 'rgba(245,197,24,0.08)', border: `1px solid ${isAtLimit ? 'rgba(240,91,91,0.25)' : 'rgba(245,197,24,0.2)'}`, borderRadius: '10px', fontSize: '12px', fontWeight: 700, color: isAtLimit ? '#f05b5b' : '#f5c518' }}>
            🔖 {savedCount} / {voiceLimit} saved
          </div>
          {savedCount > 0 && (
            <button
              onClick={() => router.push('/dashboard/saved')}
              style={{ padding: '7px 14px', background: 'rgba(245,197,24,0.08)', border: '1px solid rgba(245,197,24,0.2)', borderRadius: '10px', color: '#f5c518', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
            >
              View Saved →
            </button>
          )}
        </div>
      </div>

      {/* Limit warning */}
      {isAtLimit && (
        <div style={{ marginBottom: '16px', padding: '12px 16px', background: 'rgba(240,91,91,0.06)', border: '1px solid rgba(240,91,91,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '13px', color: '#f05b5b' }}>
            ⚠️ Voice limit reached ({voiceLimit}/{voiceLimit}) — delete a saved voice or upgrade your plan
          </span>
          <button
            onClick={() => router.push('/dashboard/billing')}
            style={{ fontSize: '12px', fontWeight: 700, color: '#f5c518', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            Upgrade →
          </button>
        </div>
      )}

      {/* Save error toast */}
      {saveError && (
        <div style={{ marginBottom: '16px', padding: '12px 16px', background: 'rgba(240,91,91,0.06)', border: '1px solid rgba(240,91,91,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <span style={{ fontSize: '13px', color: '#f05b5b' }}>⚠️ {saveError}</span>
          <button onClick={() => setSaveError(null)} style={{ background: 'none', border: 'none', color: 'var(--muted-foreground)', cursor: 'pointer', fontSize: '16px' }}>×</button>
        </div>
      )}

      {/* Filter Row */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap' }}>

        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '13px', color: '#7a7a9a' }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name..."
            style={{ width: '100%', padding: '10px 12px 10px 34px', background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--foreground)', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: 'DM Sans, sans-serif' }}
          />
        </div>

        {/* Language Dropdown */}
        <div ref={langRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setIsLangOpen(!isLangOpen)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--foreground)', fontSize: '13px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', minWidth: '150px' }}
          >
            <span>{selectedLangData.flag}</span>
            <span style={{ flex: 1, textAlign: 'left' }}>{selectedLangData.label}</span>
            <span style={{ fontSize: '10px', transform: isLangOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
          </button>

          {isLangOpen && (
            <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '8px', width: '240px', background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', zIndex: 100, overflow: 'hidden', padding: '8px' }}>
              <div style={{ position: 'relative', marginBottom: '8px' }}>
                <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: '#7a7a9a' }}>🔍</span>
                <input autoFocus value={langSearch} onChange={e => setLangSearch(e.target.value)} placeholder="Search language..." style={{ width: '100%', padding: '8px 10px 8px 30px', background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--foreground)', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ maxHeight: '280px', overflowY: 'auto', scrollbarWidth: 'none' }}>
                {filteredLangs.map(lang => (
                  <button key={lang.code} onClick={() => { setSelectedLang(lang.code); setIsLangOpen(false); setLangSearch('') }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', borderRadius: '8px', border: 'none', background: selectedLang === lang.code ? 'rgba(245,197,24,0.12)' : 'transparent', color: selectedLang === lang.code ? '#f5c518' : '#7a7a9a', fontSize: '13px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s' }}>
                    <span style={{ fontSize: '16px' }}>{lang.flag}</span>
                    <span style={{ flex: 1 }}>{lang.label}</span>
                    {selectedLang === lang.code && <span>✓</span>}
                  </button>
                ))}
                {filteredLangs.length === 0 && <div style={{ padding: '20px', textAlign: 'center', fontSize: '12px', color: '#383858' }}>No languages found</div>}
              </div>
            </div>
          )}
        </div>

        {/* Gender */}
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '3px' }}>
          {[{ value: 'all', label: 'All' }, { value: 'female', label: '♀ Female' }, { value: 'male', label: '♂ Male' }].map(g => (
            <button key={g.value} onClick={() => setSelectedGender(g.value)} style={{ padding: '7px 14px', borderRadius: '8px', border: 'none', background: selectedGender === g.value ? '#f5c518' : 'transparent', color: selectedGender === g.value ? '#000' : '#7a7a9a', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
              {g.label}
            </button>
          ))}
        </div>


      </div>

      {/* Loading */}
      {loading && <div style={{ display: 'flex', justifyContent: 'center', padding: '80px', color: '#7a7a9a', fontSize: '14px' }}>Loading voices...</div>}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
          <div style={{ fontSize: '16px', fontWeight: 600, color: '#f0f0f8', marginBottom: '6px' }}>No voices found</div>
          <div style={{ fontSize: '13px', color: '#7a7a9a' }}>Try changing the filters or search term</div>
        </div>
      )}

      {/* Voice Grid */}
      {!loading && paginated.length > 0 && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '10px', marginBottom: '24px' }}>
            {paginated.map(voice => {
              const isSaved = savedIds.has(voice.id)
              const isPlaying = playingId === voice.id
              const isSaving = savingId === voice.id
              const vColor = getAvatarBackdrop(voice.name || 'V')
              const vPath = getAvatarPath(voice.name || 'V', voice.gender)
              const langData = LANGUAGES.find(l => l.code === voice.language)
              // Disable save button if at limit and not already saved
              const saveDisabled = isSaving || (isAtLimit && !isSaved)

              return (
                <div key={voice.id} style={{ background: 'var(--card)', border: `1px solid ${isPlaying ? 'rgba(245,197,24,0.3)' : 'var(--border)'}`, borderRadius: '14px', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px', transition: 'border-color 0.15s' }}>

                  {/* Avatar + Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ position: 'relative', width: '42px', height: '42px', borderRadius: '50%', background: vColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.05)' }}>
                      <Image src={vPath} alt={voice.name || 'Avatar'} fill style={{ objectFit: 'cover' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--foreground)', fontFamily: 'Syne, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {voice.name}
                      </div>
                      <div style={{ display: 'flex', gap: '4px', marginTop: '3px', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', color: 'var(--muted-foreground)' }}>
                          {langData?.flag} {langData?.label || voice.language?.toUpperCase()}
                        </span>
                        <span style={{ fontSize: '10px', color: '#383858' }}>·</span>
                        <span style={{ fontSize: '11px', color: 'var(--muted-foreground)', textTransform: 'capitalize' }}>{voice.gender}</span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {voice.description && (
                    <div style={{ fontSize: '12px', color: 'var(--muted-foreground)', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {voice.description}
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '6px', marginTop: 'auto' }}>
                    {/* Preview */}
                    <button
                      onClick={() => playVoice(voice)}
                      style={{ flex: 1, padding: '8px 0', background: isPlaying ? 'rgba(245,197,24,0.12)' : 'rgba(255,255,255,0.05)', border: `1px solid ${isPlaying ? 'rgba(245,197,24,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', color: isPlaying ? '#f5c518' : 'var(--foreground)', fontFamily: 'DM Sans, sans-serif' }}
                    >
                      {isPlaying ? '⏸ Stop' : '▶ Preview'}
                    </button>

                    {/* Use in TTS */}
                    <button
                      onClick={() => useInTTS(voice)}
                      style={{ flex: 1, padding: '8px 0', background: 'rgba(245,197,24,0.08)', border: '1px solid rgba(245,197,24,0.2)', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', color: '#f5c518', fontFamily: 'DM Sans, sans-serif' }}
                    >
                      Use →
                    </button>

                    {/* Save */}
                    <button
                      onClick={() => toggleSave(voice)}
                      disabled={saveDisabled}
                      title={isSaved ? 'Remove from saved' : isAtLimit ? `Limit reached (${voiceLimit})` : 'Save voice'}
                      style={{ width: '36px', flexShrink: 0, background: isSaved ? 'rgba(245,197,24,0.12)' : 'rgba(255,255,255,0.05)', border: `1px solid ${isSaved ? 'rgba(245,197,24,0.35)' : saveDisabled ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '8px', cursor: saveDisabled ? 'not-allowed' : 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: saveDisabled && !isSaved ? 0.4 : 1, transition: 'all 0.15s' }}
                    >
                      {isSaving ? '·' : isSaved ? '★' : '☆'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Sentinel for Infinite Scroll */}
          {hasMore && (
            <div ref={loaderRef} style={{ textAlign: 'center', padding: '40px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '24px', height: '24px', border: '2px solid rgba(245,197,24,0.1)', borderTop: '2px solid #f5c518', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0 }}>
                Loading more voices... ({filtered.length - paginated.length} left)
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}