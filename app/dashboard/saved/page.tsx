'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { Play, Square, Trash2, ArrowRight, Bookmark, Mic2 } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface SavedVoice {
  id: string;
  voice_id: string;
  voice_name: string;
  language?: string | null;
  gender?: string | null;
  r2_url?: string | null;
  audio_url?: string | null;
  source?: string | null;
  created_at?: string | null;
  // Joined from voices table for library voices
  sample_url?: string | null;
}

const GRADIENTS = [
  'linear-gradient(135deg, #f5c518 0%, #ff6b35 100%)',
  'linear-gradient(135deg, #5b8ef0 0%, #a855f7 100%)',
  'linear-gradient(135deg, #22d3a5 0%, #5b8ef0 100%)',
  'linear-gradient(135deg, #f472b6 0%, #f5c518 100%)',
  'linear-gradient(135deg, #a855f7 0%, #22d3a5 100%)',
];
const grad = (name: string) => GRADIENTS[name.charCodeAt(0) % GRADIENTS.length];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SavedVoicesPage() {
  const router = useRouter();
  const [voices, setVoices] = useState<SavedVoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const supabase = createClient();
    async function init() {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) { router.push('/login'); return; }

      // Fetch saved voices with specific fields
      const { data: savedRaw } = await supabase
        .from('saved_voices')
        .select(`
          id,
          user_id,
          voice_id,
          voice_name,
          language,
          gender,
          sample_url,
          source,
          created_at
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      let savedVoices = savedRaw || []

      // If voice_name is null or empty, do a fallback join:
      const idsWithNoName = savedVoices.filter(v => !v.voice_name).map(v => v.voice_id)
      if (idsWithNoName.length > 0) {
        const { data: voiceDetails } = await supabase
          .from('voices')
          .select('id, name, language, gender, sample_url')
          .in('id', idsWithNoName)
        
        const voiceMap = Object.fromEntries((voiceDetails || []).map(v => [v.id, v]))
        
        savedVoices.forEach(sv => {
          if (!sv.voice_name && voiceMap[sv.voice_id]) {
            sv.voice_name = voiceMap[sv.voice_id].name
            sv.language = sv.language || voiceMap[sv.voice_id].language
            sv.gender = sv.gender || voiceMap[sv.voice_id].gender
            sv.sample_url = sv.sample_url || voiceMap[sv.voice_id].sample_url
          }
        })
      }

      setVoices(savedVoices as any);
      setLoading(false);
    }
    init();
  }, [router]);

  // ── Play / Stop ────────────────────────────────────────────────────────────
  const handlePlay = useCallback((id: string, url?: string | null) => {
    if (!url) return;

    // Stop current audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // Toggle off same voice
    if (playingId === id) {
      setPlayingId(null);
      audioRef.current = null;
      return;
    }

    const audio = new Audio(url);
    audioRef.current = audio;
    audio.play().catch(console.error);
    audio.onended = () => {
      setPlayingId(null);
      audioRef.current = null;
    };
    setPlayingId(id);
  }, [playingId]);

  // ── Remove ─────────────────────────────────────────────────────────────────
  const handleRemove = async (voice: SavedVoice) => {
    const supabase = createClient();
    if (voice.source === 'cloned') {
      await supabase.from('cloned_voices').delete().eq('id', voice.id);
    } else {
      await supabase.from('saved_voices').delete().eq('id', voice.id);
    }
    setVoices(v => v.filter(x => x.id !== voice.id));
  };

  // ── Get playable URL ───────────────────────────────────────────────────────
  const getPlayUrl = (v: SavedVoice) =>
    v.sample_url || v.r2_url || v.audio_url || null;

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ width: '36px', height: '36px', border: '3px solid rgba(245,197,24,0.2)', borderTop: '3px solid #f5c518', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif' }}>

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '24px', fontWeight: 700, color: 'var(--text)', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
          Saved Voices
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0 }}>
          Your personal voice collection — {voices.length} {voices.length === 1 ? 'voice' : 'voices'}
        </p>
      </div>

      {/* Empty state */}
      {voices.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', gap: '12px', textAlign: 'center' }}>
          <Bookmark size={40} color="var(--muted)" style={{ opacity: 0.4 }} />
          <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '16px', color: 'var(--muted)', margin: 0 }}>
            No saved voices yet
          </p>
          <p style={{ fontSize: '13px', color: 'var(--muted)', opacity: 0.7, margin: 0 }}>
            Browse the voice library or clone a voice to get started
          </p>
          <div style={{ display: 'flex', gap: '10px', marginTop: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/dashboard/library" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 20px', borderRadius: '10px', background: '#f5c518', color: '#080810', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '13px', textDecoration: 'none' }}>
              Browse Library <ArrowRight size={13} strokeWidth={2.5} />
            </Link>
            <Link href="/dashboard/cloning" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 20px', borderRadius: '10px', background: 'var(--glass)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '13px', textDecoration: 'none' }}>
              Clone a Voice <Mic2 size={13} strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {voices.map(v => {
            const playUrl = getPlayUrl(v);
            const isCloned = v.source === 'cloned';
            const isPlaying = playingId === v.id;
            const hasAudio = !!playUrl;

            return (
              <div
                key={v.id}
                className="voice-card"
                style={{
                  background: 'var(--card-bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '18px',
                  padding: '20px',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '50%',
                    background: grad(v.voice_name),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '17px',
                    color: '#080810', flexShrink: 0,
                  }}>
                    {v.voice_name[0]?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '14px',
                      color: 'var(--text)', margin: '0 0 5px',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {v.voice_name}
                    </p>
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                      {isCloned && (
                        <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '5px', background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)', color: '#a855f7', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                          Cloned
                        </span>
                      )}
                      {v.language && (
                        <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 6px', borderRadius: '5px', background: 'rgba(91,142,240,0.12)', border: '1px solid rgba(91,142,240,0.2)', color: '#5b8ef0' }}>
                          {v.language}
                        </span>
                      )}
                      {v.gender && (
                        <span style={{
                          fontSize: '10px', fontWeight: 600, padding: '2px 6px', borderRadius: '5px',
                          background: v.gender.toLowerCase() === 'female' ? 'rgba(244,114,182,0.12)' : 'rgba(34,211,165,0.12)',
                          border: v.gender.toLowerCase() === 'female' ? '1px solid rgba(244,114,182,0.22)' : '1px solid rgba(34,211,165,0.22)',
                          color: v.gender.toLowerCase() === 'female' ? '#f472b6' : '#22d3a5',
                        }}>
                          {v.gender}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handlePlay(v.id, playUrl)}
                    disabled={!hasAudio}
                    title={hasAudio ? (isPlaying ? 'Stop preview' : 'Play preview') : 'No preview available'}
                    style={{
                      width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                      background: isPlaying ? 'rgba(245,197,24,0.20)' : 'rgba(255,255,255,0.06)',
                      border: isPlaying ? '1.5px solid rgba(245,197,24,0.4)' : '1px solid var(--border)',
                      cursor: hasAudio ? 'pointer' : 'not-allowed',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '13px', color: isPlaying ? '#f5c518' : hasAudio ? 'var(--text)' : 'var(--muted)',
                      opacity: hasAudio ? 1 : 0.35,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {isPlaying ? <Square size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" style={{ marginLeft: '1px' }} />}
                  </button>
                </div>

                {/* No preview note for cloned voices without audio */}
                {isCloned && !hasAudio && (
                  <p style={{ fontSize: '11px', color: 'var(--muted)', opacity: 0.6, margin: 0 }}>
                    No preview available
                  </p>
                )}

                {/* Action buttons row */}
                <div style={{ display: 'flex', gap: '7px', marginTop: 'auto' }}>
                  <Link
                    href={`/dashboard/tts?voice=${v.voice_id}`}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      gap: '5px', padding: '9px', borderRadius: '9px',
                      background: 'rgba(245,197,24,0.08)', border: '1px solid rgba(245,197,24,0.2)',
                      color: '#f5c518', fontSize: '12px', fontWeight: 700,
                      textDecoration: 'none', fontFamily: 'DM Sans, sans-serif',
                    }}
                  >
                    Use in TTS <ArrowRight size={11} strokeWidth={2.5} />
                  </Link>
                  <button
                    onClick={() => handleRemove(v)}
                    style={{
                      padding: '9px 11px', borderRadius: '9px',
                      background: 'rgba(255,80,80,0.06)',
                      border: '1px solid rgba(255,80,80,0.15)',
                      color: 'rgba(255,100,100,0.6)', cursor: 'pointer',
                      display: 'flex', alignItems: 'center',
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .voice-card:hover {
          background: var(--glass) !important;
          border-color: var(--accent) !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
}
