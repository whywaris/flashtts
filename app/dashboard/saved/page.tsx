'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { Play, Square, Trash2, ArrowRight, Bookmark, Mic2 } from 'lucide-react';
import { getAvatarPath, getAvatarBackdrop } from '@/utils/avatar';

const T = {
  bg:      'var(--bg)',
  card:    'var(--card-bg)',
  surface: 'var(--surface)',
  accent:  '#2DD4BF',
  border:  'var(--border)',
  muted:   'var(--muted)',
  text:    'var(--text)',
};

interface SavedVoice {
  id: string;
  voice_id: string;
  voice_name: string;
  language?: string | null;
  gender?: string | null;
  r2_url?: string | null;
  sample_url?: string | null;
  source?: string | null;
  created_at?: string | null;
}

const PLAN_VOICE_LIMITS: Record<string, number> = {
  free: 1, starter: 3, creator: 5, pro: 10, studio: 20,
};

const AVATAR_COLORS = [
  'rgba(45,212,191,0.25)', 'rgba(99,102,241,0.25)', 'rgba(244,114,182,0.25)',
  'rgba(234,179,8,0.25)',  'rgba(249,115,22,0.25)',  'rgba(20,184,166,0.25)',
  'rgba(168,85,247,0.25)',
];

function VoiceAvatar({ name, size = 44 }: { name: string; size?: number }) {
  const avatarPath = getAvatarPath(name);
  const backdrop = getAvatarBackdrop(name);
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: backdrop,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, border: `1px solid ${T.border}`, overflow: 'hidden',
    }}>
      <img 
        src={avatarPath} 
        alt={name} 
        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
      />
    </div>
  );
}

export default function SavedVoicesPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [voices, setVoices] = useState<SavedVoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [userPlan, setUserPlan] = useState<string>('free');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    async function init() {
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (authErr || !user) { router.push('/login'); return; }

      const { data: profile } = await supabase
        .from('profiles').select('plan').eq('id', user.id).single();
      if (profile?.plan) setUserPlan(profile.plan);

      const { data: savedRaw, error: fetchErr } = await supabase
        .from('saved_voices')
        .select('id, voice_id, name, voice_name, language, gender, r2_url, source, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchErr) console.error('Fetch error:', fetchErr.message);

      let savedVoices: SavedVoice[] = (savedRaw || []).map((v: any) => ({
        ...v,
        voice_name: v.voice_name || v.name || 'Unnamed Voice',
        sample_url: null,
      }));

      const idsNeedingAudio = savedVoices
        .filter(v => !v.r2_url && v.source !== 'cloned')
        .map(v => v.voice_id).filter(Boolean);

      if (idsNeedingAudio.length > 0) {
        const { data: voiceDetails } = await supabase
          .from('voices').select('id, name, language, gender, sample_url')
          .in('id', idsNeedingAudio);

        const voiceMap: Record<string, any> = Object.fromEntries(
          (voiceDetails || []).map(v => [v.id, v])
        );

        savedVoices = savedVoices.map(sv => {
          const detail = voiceMap[sv.voice_id];
          if (!detail) return sv;
          return {
            ...sv,
            voice_name: sv.voice_name || detail.name || 'Unnamed Voice',
            language: sv.language || detail.language || null,
            gender: sv.gender || detail.gender || null,
            sample_url: detail.sample_url || null,
          };
        });
      }

      setVoices(savedVoices);
      setLoading(false);
    }
    init();
  }, [router, supabase]);

  const voiceLimit = PLAN_VOICE_LIMITS[userPlan] ?? 1;
  const isAtLimit = voices.length >= voiceLimit;
  const usagePct = Math.min(100, Math.round((voices.length / voiceLimit) * 100));

  const getPlayUrl = (v: SavedVoice): string | null => v.r2_url || v.sample_url || null;

  const handlePlay = useCallback((id: string, url: string | null) => {
    if (!url) return;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (playingId === id) { setPlayingId(null); return; }
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.play().catch(err => console.error('Play error:', err));
    audio.onended = () => { setPlayingId(null); audioRef.current = null; };
    setPlayingId(id);
  }, [playingId]);

  const handleRemove = async (voice: SavedVoice) => {
    if (removingId) return;
    setRemovingId(voice.id);
    if (playingId === voice.id) {
      audioRef.current?.pause();
      audioRef.current = null;
      setPlayingId(null);
    }
    const { error } = await supabase.from('saved_voices').delete().eq('id', voice.id);
    if (error) { console.error('Delete error:', error.message); setRemovingId(null); return; }
    setVoices(prev => prev.filter(x => x.id !== voice.id));
    setRemovingId(null);
  };

  const handleUseInTTS = (voice: SavedVoice) => {
    const isCloned = voice.source === 'cloned';
    localStorage.setItem('flashtts_selected_voice', JSON.stringify({
      id: voice.voice_id || voice.id,
      name: voice.voice_name || 'Unnamed Voice',
      language: voice.language,
      gender: voice.gender,
      sample_url: voice.r2_url || voice.sample_url,
      type: isCloned ? 'cloned' : 'library',
    }));
    
    // Support URL params for reliable loading
    const params = new URLSearchParams();
    params.set('voiceId', voice.id);
    if (isCloned) params.set('voiceType', 'cloned');
    else params.set('voiceType', 'saved');
    
    router.push(`/dashboard/tts?${params.toString()}`);
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ width: 32, height: 32, border: `3px solid rgba(45,212,191,0.2)`, borderTop: `3px solid ${T.accent}`, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', width: '100%' }}>


      {/* Usage bar */}
      <div style={{ marginBottom: 20, padding: '14px 16px', background: isAtLimit ? 'rgba(239,68,68,0.06)' : T.card, border: `1px solid ${isAtLimit ? 'rgba(239,68,68,0.2)' : T.border}`, borderRadius: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: T.muted, fontWeight: 600 }}>
            Voice Slots — <span style={{ textTransform: 'capitalize', color: T.accent }}>{userPlan}</span> Plan
          </span>
          <span style={{ fontSize: 12, fontWeight: 700, color: isAtLimit ? '#ef4444' : T.text }}>{voices.length} / {voiceLimit}</span>
        </div>
        <div style={{ height: 4, background: T.border, borderRadius: 99, overflow: 'hidden', marginBottom: 8 }}>
          <div style={{ height: '100%', width: `${usagePct}%`, background: isAtLimit ? '#ef4444' : usagePct >= 80 ? '#f59e0b' : T.accent, borderRadius: 99, transition: 'width 0.4s' }} />
        </div>
        {isAtLimit && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#ef4444' }}>Limit reached — delete a voice or upgrade</span>
            <a href="/dashboard/billing" style={{ fontSize: 12, fontWeight: 700, color: T.accent, textDecoration: 'none' }}>Upgrade →</a>
          </div>
        )}
      </div>

      {/* Empty state */}
      {voices.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', gap: 16, textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: `rgba(45,212,191,0.08)`, border: `1px solid rgba(45,212,191,0.15)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bookmark size={28} color={T.accent} strokeWidth={1.5} />
          </div>
          <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: T.text, margin: 0 }}>
            No saved voices yet
          </p>
          <p style={{ fontSize: 13, color: T.muted, margin: 0, maxWidth: 280, lineHeight: 1.6 }}>
            Browse the voice library or clone a voice to get started
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/dashboard/library" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10, background: T.accent, color: '#0A0A0F', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
              Browse Library <ArrowRight size={13} strokeWidth={2.5} />
            </Link>
            <Link href="/dashboard/cloning" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10, background: T.surface, border: `1px solid ${T.border}`, color: T.text, fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
              Clone a Voice <Mic2 size={13} strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {voices.map(v => {
            const playUrl = getPlayUrl(v);
            const isCloned = v.source === 'cloned';
            const isPlaying = playingId === v.id;
            const hasAudio = !!playUrl;
            const isRemoving = removingId === v.id;
            const displayName = v.voice_name || 'Unnamed Voice';

            return (
              <div
                key={v.id}
                className="sv-card"
                style={{
                  background: T.card, border: `1px solid ${T.border}`, borderRadius: 12,
                  padding: 20, display: 'flex', flexDirection: 'column', gap: 14,
                  position: 'relative', opacity: isRemoving ? 0.5 : 1, transition: 'all 0.2s',
                }}
              >
                {/* Delete button — top-right */}
                <button
                  onClick={() => handleRemove(v)}
                  disabled={isRemoving}
                  className="sv-delete"
                  title="Remove voice"
                  style={{
                    position: 'absolute', top: 12, right: 12, width: 28, height: 28,
                    borderRadius: 8, background: 'transparent', border: `1px solid ${T.border}`,
                    color: T.muted, cursor: isRemoving ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s',
                  }}
                >
                  <Trash2 size={12} />
                </button>

                {/* Avatar + info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <VoiceAvatar name={displayName} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, color: T.text, margin: '0 0 5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 28 }}>
                      {displayName}
                    </p>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      {isCloned && (
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 5, background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)', color: '#a855f7', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                          Cloned
                        </span>
                      )}
                      {v.language && (
                        <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 5, background: 'rgba(45,212,191,0.1)', border: '1px solid rgba(45,212,191,0.2)', color: T.accent }}>
                          {v.language.toUpperCase()}
                        </span>
                      )}
                      {v.gender && (
                        <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 5, background: v.gender.toLowerCase() === 'female' ? 'rgba(244,114,182,0.12)' : 'rgba(99,102,241,0.12)', border: v.gender.toLowerCase() === 'female' ? '1px solid rgba(244,114,182,0.22)' : '1px solid rgba(99,102,241,0.22)', color: v.gender.toLowerCase() === 'female' ? '#f472b6' : '#818cf8' }}>
                          {v.gender}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Play + Use in TTS */}
                <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                  <button
                    onClick={() => handlePlay(v.id, playUrl)}
                    disabled={!hasAudio || isRemoving}
                    title={hasAudio ? (isPlaying ? 'Stop' : 'Play') : 'No preview'}
                    style={{
                      width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                      background: isPlaying ? `rgba(45,212,191,0.15)` : T.surface,
                      border: `1px solid ${isPlaying ? 'rgba(45,212,191,0.4)' : T.border}`,
                      color: isPlaying ? T.accent : hasAudio ? T.text : T.muted,
                      opacity: hasAudio ? 1 : 0.35,
                      cursor: hasAudio && !isRemoving ? 'pointer' : 'not-allowed',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}
                  >
                    {isPlaying
                      ? <Square size={12} fill="currentColor" />
                      : <Play size={12} fill="currentColor" style={{ marginLeft: 1 }} />}
                  </button>
                  <button
                    onClick={() => handleUseInTTS(v)}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      gap: 5, padding: '9px', borderRadius: 9,
                      background: 'transparent', border: `1px solid rgba(45,212,191,0.35)`,
                      color: T.accent, fontSize: 12, fontWeight: 700,
                      cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.15s',
                    }}
                    className="sv-use-btn"
                  >
                    Use in TTS <ArrowRight size={11} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .sv-card:hover {
          border-color: rgba(45,212,191,0.25) !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(0,0,0,0.15);
        }
        .sv-delete:hover {
          background: rgba(239,68,68,0.1) !important;
          border-color: rgba(239,68,68,0.3) !important;
          color: #ef4444 !important;
        }
        .sv-use-btn:hover {
          background: rgba(45,212,191,0.08) !important;
          border-color: rgba(45,212,191,0.5) !important;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
