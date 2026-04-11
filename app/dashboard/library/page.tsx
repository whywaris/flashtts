'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'


const LANGUAGES = [
  { code: 'all',        label: 'All',           flag: '🌍' },
  { code: 'ar',         label: 'Arabic',        flag: '🇸🇦' },
  { code: 'da',         label: 'Danish',        flag: '🇩🇰' },
  { code: 'de',         label: 'German',        flag: '🇩🇪' },
  { code: 'el',         label: 'Greek',         flag: '🇬🇷' },
  { code: 'en',         label: 'English',       flag: '🇺🇸' },
  { code: 'es',         label: 'Spanish',       flag: '🇪🇸' },
  { code: 'fi',         label: 'Finnish',       flag: '🇫🇮' },
  { code: 'fr',         label: 'French',        flag: '🇫🇷' },
  { code: 'he',         label: 'Hebrew',        flag: '🇮🇱' },
  { code: 'hi',         label: 'Hindi',         flag: '🇮🇳' },
  { code: 'it',         label: 'Italian',       flag: '🇮🇹' },
  { code: 'ja',         label: 'Japanese',      flag: '🇯🇵' },
  { code: 'ko',         label: 'Korean',        flag: '🇰🇷' },
  { code: 'ms',         label: 'Malay',         flag: '🇲🇾' },
  { code: 'nl',         label: 'Dutch',         flag: '🇳🇱' },
  { code: 'no',         label: 'Norwegian',     flag: '🇳🇴' },
  { code: 'pl',         label: 'Polish',        flag: '🇵🇱' },
  { code: 'pt',         label: 'Portuguese',    flag: '🇵🇹' },
  { code: 'ru',         label: 'Russian',       flag: '🇷🇺' },
  { code: 'sv',         label: 'Swedish',       flag: '🇸🇪' },
  { code: 'sw',         label: 'Swahili',       flag: '🇰🇪' },
  { code: 'tr',         label: 'Turkish',       flag: '🇹🇷' },
]

const AVATAR_COLORS = [
  '#f5c518','#5b8ef0','#22d3a5','#a78bfa',
  '#f05b5b','#f59e0b','#10b981','#8b5cf6',
]

function getAvatarColor(name: string) {
  return AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length]
}

export default function VoiceLibraryPage() {
  const supabase = createClient()
  const router = useRouter()
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [user, setUser] = useState<any>(null)
  const [voices, setVoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [savingId, setSavingId] = useState<string | null>(null)
  const [playingId, setPlayingId] = useState<string | null>(null)

  // Filters
  const [search, setSearch] = useState('')
  const [selectedLang, setSelectedLang] = useState('all')
  const [selectedGender, setSelectedGender] = useState('all')
  const [page, setPage] = useState(1)
  const [isLangOpen, setIsLangOpen] = useState(false)
  const [langSearch, setLangSearch] = useState('')
  const langRef = useRef<HTMLDivElement>(null)
  const PER_PAGE = 24

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setIsLangOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedLangData = LANGUAGES.find(l => l.code === selectedLang) || LANGUAGES[0]
  const filteredLangs = LANGUAGES.filter(l => 
    l.label.toLowerCase().includes(langSearch.toLowerCase()) ||
    l.code.toLowerCase().includes(langSearch.toLowerCase())
  )

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      // Fetch all unique voices (duplicates already removed in DB)
      const { data } = await supabase
        .from('voices')
        .select('id, name, language, gender, description, style, sample_url, use_cases, is_featured')
        .eq('is_active', true)
        .order('name')

      setVoices(data || [])

      if (user) {
        const { data: saved } = await supabase
          .from('saved_voices')
          .select('voice_id')
          .eq('user_id', user.id)
        setSavedIds(new Set(saved?.map((s: any) => s.voice_id) || []))
      }

      setLoading(false)
    }
    load()
  }, [])

  // Filtered voices — computed inline
  const filtered = voices.filter(v => {
    // Exact match vs code from LANGUAGES array
    if (selectedLang !== 'all' && v.language !== selectedLang) return false
    
    if (selectedGender !== 'all' && v.gender?.toLowerCase() !== selectedGender.toLowerCase()) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      if (!v.name?.toLowerCase().includes(q) &&
          !v.description?.toLowerCase().includes(q)) return false
    }
    return true
  })

  const paginated = filtered.slice(0, page * PER_PAGE)
  const hasMore = paginated.length < filtered.length

  // Reset page on filter change
  useEffect(() => { setPage(1) }, [selectedLang, selectedGender, search])

  function playVoice(voice: any) {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    if (playingId === voice.id) {
      setPlayingId(null)
      return
    }
    const audio = new Audio(voice.sample_url)
    audio.play().catch(() => {})
    audio.onended = () => setPlayingId(null)
    audioRef.current = audio
    setPlayingId(voice.id)
  }

  async function toggleSave(voice: any) {
    if (!user) { alert('Please login first'); return }
    setSavingId(voice.id)
    const isSaved = savedIds.has(voice.id)

    if (isSaved) {
      await supabase.from('saved_voices')
        .delete().eq('user_id', user.id).eq('voice_id', voice.id)
      setSavedIds(prev => { const n = new Set(prev); n.delete(voice.id); return n })
    } else {
      await supabase.from('saved_voices').upsert({
        user_id: user.id,
        voice_id: voice.id,
        voice_name: voice.name,
        language: voice.language,
        gender: voice.gender,
        sample_url: voice.sample_url,
        source: 'library',
      }, { onConflict: 'user_id,voice_id' })
      setSavedIds(prev => new Set([...prev, voice.id]))
    }
    setSavingId(null)
  }

  function useInTTS(voice: any) {
    localStorage.setItem('tts_selected_voice', JSON.stringify({
      id: voice.id,
      name: voice.name,
      language: voice.language,
      gender: voice.gender,
      sample_url: voice.sample_url,
    }))
    router.push('/dashboard/tts')
  }

  // ─── STYLES ─────────────────────────────────────────────
  const chip = (active: boolean) => ({
    padding: '6px 14px',
    borderRadius: '99px',
    border: '1px solid',
    borderColor: active ? 'rgba(245,197,24,0.5)' : 'rgba(255,255,255,0.08)',
    background: active ? 'rgba(245,197,24,0.12)' : 'transparent',
    color: active ? '#f5c518' : '#7a7a9a',
    fontSize: '12px',
    fontWeight: active ? 700 : 500,
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
    fontFamily: 'DM Sans, sans-serif',
    transition: 'all 0.15s',
  })


  return (
    <div style={{ maxWidth: '1100px' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '26px', fontWeight: 800, color: 'var(--foreground)', marginBottom: '4px' }}>
            Voice Library
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>
            {loading ? 'Loading...' : `${filtered.length.toLocaleString()} voices · 22 languages`}
          </p>
        </div>
        {savedIds.size > 0 && (
          <button
            onClick={() => router.push('/dashboard/saved')}
            style={{ padding: '8px 18px', background: 'rgba(245,197,24,0.1)', border: '1px solid rgba(245,197,24,0.25)', borderRadius: '10px', color: '#f5c518', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
          >
            🔖 {savedIds.size} Saved →
          </button>
        )}
      </div>


      {/* ── Filter Row ── */}
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
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px',
              background: 'var(--secondary)', border: '1px solid var(--border)',
              borderRadius: '10px', color: 'var(--foreground)', fontSize: '13px', cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif', minWidth: '150px'
            }}
          >
            <span>{selectedLangData.flag}</span>
            <span style={{ flex: 1, textAlign: 'left' }}>{selectedLangData.label}</span>
            <span style={{ fontSize: '10px', transform: isLangOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
          </button>

          {isLangOpen && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, marginTop: '8px',
              width: '240px', background: 'var(--popover)', border: '1px solid var(--border)',
              borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
              zIndex: 100, overflow: 'hidden', padding: '8px'
            }}>
              <div style={{ position: 'relative', marginBottom: '8px' }}>
                <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: '#7a7a9a' }}>🔍</span>
                <input
                  autoFocus
                  value={langSearch}
                  onChange={e => setLangSearch(e.target.value)}
                  placeholder="Search language..."
                  style={{
                    width: '100%', padding: '8px 10px 8px 30px', background: 'var(--secondary)',
                    border: '1px solid var(--border)', borderRadius: '8px',
                    color: 'var(--foreground)', fontSize: '12px', outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div style={{ maxHeight: '280px', overflowY: 'auto', scrollbarWidth: 'none' }}>
                {filteredLangs.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => { setSelectedLang(lang.code); setIsLangOpen(false); setLangSearch('') }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '8px 10px', borderRadius: '8px', border: 'none',
                      background: selectedLang === lang.code ? 'rgba(245,197,24,0.12)' : 'transparent',
                      color: selectedLang === lang.code ? '#f5c518' : '#7a7a9a',
                      fontSize: '13px', textAlign: 'left', cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    <span style={{ fontSize: '16px' }}>{lang.flag}</span>
                    <span style={{ flex: 1 }}>{lang.label}</span>
                    {selectedLang === lang.code && <span>✓</span>}
                  </button>
                ))}
                {filteredLangs.length === 0 && (
                  <div style={{ padding: '20px', textAlign: 'center', fontSize: '12px', color: '#383858' }}>
                    No languages found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Gender */}
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '3px' }}>
          {[
            { value: 'all',    label: 'All' },
            { value: 'female', label: '♀ Female' },
            { value: 'male',   label: '♂ Male' },
          ].map(g => (
            <button key={g.value} onClick={() => setSelectedGender(g.value)} style={{ padding: '7px 14px', borderRadius: '8px', border: 'none', background: selectedGender === g.value ? '#f5c518' : 'transparent', color: selectedGender === g.value ? '#000' : '#7a7a9a', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
              {g.label}
            </button>
          ))}
        </div>

        {/* Count */}
        <span style={{ fontSize: '12px', color: 'var(--muted-foreground)', whiteSpace: 'nowrap', marginLeft: 'auto' }}>
          {filtered.length} results
        </span>
      </div>


      {/* ── Loading ── */}
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px', color: '#7a7a9a', fontSize: '14px' }}>
          Loading voices...
        </div>
      )}

      {/* ── Empty ── */}
      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
          <div style={{ fontSize: '16px', fontWeight: 600, color: '#f0f0f8', marginBottom: '6px' }}>No voices found</div>
          <div style={{ fontSize: '13px', color: '#7a7a9a' }}>Try changing the filters or search term</div>
        </div>
      )}

      {/* ── Voice Grid ── */}
      {!loading && paginated.length > 0 && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '10px', marginBottom: '24px' }}>
            {paginated.map(voice => {
              const isSaved = savedIds.has(voice.id)
              const isPlaying = playingId === voice.id
              const ac = getAvatarColor(voice.name || 'V')
              const langData = LANGUAGES.find(l => l.code === voice.language)

              return (
                <div key={voice.id} style={{
                  background: 'var(--card)',
                  border: `1px solid ${isPlaying ? 'rgba(245,197,24,0.3)' : 'var(--border)'}`,
                  borderRadius: '14px',
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  transition: 'border-color 0.15s',
                }}>

                  {/* Top: Avatar + Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '38px', height: '38px', borderRadius: '50%',
                      background: `${ac}22`, border: `1.5px solid ${ac}44`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '15px', fontWeight: 800, color: ac,
                      flexShrink: 0, fontFamily: 'Syne, sans-serif',
                    }}>
                      {(voice.name || 'V')[0].toUpperCase()}
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
                        <span style={{ fontSize: '11px', color: 'var(--muted-foreground)', textTransform: 'capitalize' }}>
                          {voice.gender}
                        </span>
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
                      style={{
                        flex: 1, padding: '8px 0',
                        background: isPlaying ? 'rgba(245,197,24,0.12)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${isPlaying ? 'rgba(245,197,24,0.3)' : 'rgba(255,255,255,0.08)'}`,
                        borderRadius: '8px', fontSize: '12px',
                        fontWeight: 600, cursor: 'pointer',
                        color: isPlaying ? '#f5c518' : 'var(--foreground)',
                        fontFamily: 'DM Sans, sans-serif',
                      }}
                    >
                      {isPlaying ? '⏸ Stop' : '▶ Preview'}
                    </button>

                    {/* Use in TTS */}
                    <button
                      onClick={() => useInTTS(voice)}
                      style={{
                        flex: 1, padding: '8px 0',
                        background: 'rgba(245,197,24,0.08)',
                        border: '1px solid rgba(245,197,24,0.2)',
                        borderRadius: '8px', fontSize: '12px',
                        fontWeight: 600, cursor: 'pointer',
                        color: '#f5c518', fontFamily: 'DM Sans, sans-serif',
                      }}
                    >
                      Use →
                    </button>

                    {/* Save */}
                    <button
                      onClick={() => toggleSave(voice)}
                      disabled={savingId === voice.id}
                      title={isSaved ? 'Remove from saved' : 'Save voice'}
                      style={{
                        width: '36px', flexShrink: 0,
                        background: isSaved ? 'rgba(245,197,24,0.12)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${isSaved ? 'rgba(245,197,24,0.35)' : 'rgba(255,255,255,0.08)'}`,
                        borderRadius: '8px', cursor: 'pointer',
                        fontSize: '14px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      {savingId === voice.id ? '·' : isSaved ? '★' : '☆'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Load More */}
          {hasMore && (
            <div style={{ textAlign: 'center', paddingBottom: '32px' }}>
              <button
                onClick={() => setPage(p => p + 1)}
                style={{ padding: '11px 32px', background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--foreground)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}
              >
                Load More ({filtered.length - paginated.length} remaining)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}