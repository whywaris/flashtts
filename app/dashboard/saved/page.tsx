'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { getAvatarPath, getAvatarBackdrop } from '@/utils/avatar';
import Image from 'next/image';
import { Play, Square, Trash2, ArrowRight, Bookmark, Mic2 } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface SavedVoice {
  id: string;
  voice_id: string;
  voice_name: string;       // normalized from name or voice_name
  language?: string | null;
  gender?: string | null;
  r2_url?: string | null;
  sample_url?: string | null; // from voices table fallback
  source?: string | null;
  created_at?: string | null;
}



// ─── Plan Limits ──────────────────────────────────────────────────────────────
const PLAN_VOICE_LIMITS: Record<string, number> = {
  free: 1,
  starter: 3,
  creator: 5,
  pro: 10,
  studio: 20,
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SavedVoicesPage() {
  const router = useRouter();
  const [voices, setVoices] = useState<SavedVoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [userPlan, setUserPlan] = useState<string>('free');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const supabase = createClient();

    async function init() {
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (authErr || !user) { router.push('/login'); return; }


      // Fetch user plan
      const { data: profile } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', user.id)
        .single();
      if (profile?.plan) setUserPlan(profile.plan);

      // ✅ FIX: Only fetch columns that actually exist in saved_voices table
      const { data: savedRaw, error: fetchErr } = await supabase
        .from('saved_voices')
        .select('id, voice_id, name, voice_name, language, gender, r2_url, source, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchErr) console.error('Fetch error:', fetchErr.message);

      // ✅ FIX: Normalize — table has both 'name' & 'voice_name' columns
      let savedVoices: SavedVoice[] = (savedRaw || []).map((v: any) => ({
        ...v,
        voice_name: v.voice_name || v.name || 'Unnamed Voice',
        sample_url: null, // will be filled from voices table if needed
      }));

      // ✅ FIX: For library voices without r2_url, fetch sample_url from voices table
      const idsNeedingAudio = savedVoices
        .filter(v => !v.r2_url && v.source !== 'cloned')
        .map(v => v.voice_id)
        .filter(Boolean);

      if (idsNeedingAudio.length > 0) {
        const { data: voiceDetails } = await supabase
          .from('voices')
          .select('id, name, language, gender, sample_url')
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
  }, [router]);

  // ── Plan limit derived values ──────────────────────────────────────────────
  const voiceLimit = PLAN_VOICE_LIMITS[userPlan] ?? 1;
  const isAtLimit = voices.length >= voiceLimit;
  const usagePct = Math.min(100, Math.round((voices.length / voiceLimit) * 100));

  // ── Get playable URL ───────────────────────────────────────────────────────
  // ✅ FIX: r2_url is the primary audio, sample_url is fallback from voices table
  const getPlayUrl = (v: SavedVoice): string | null =>
    v.r2_url || v.sample_url || null;

  // ── Play / Stop ────────────────────────────────────────────────────────────
  const handlePlay = useCallback((id: string, url: string | null) => {
    if (!url) return;

    // Stop any current audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    // Toggle off if same voice
    if (playingId === id) {
      setPlayingId(null);
      return;
    }

    // ✅ FIX: Create fresh Audio element each time
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.play().catch(err => console.error('Play error:', err));
    audio.onended = () => {
      setPlayingId(null);
      audioRef.current = null;
    };
    setPlayingId(id);
  }, [playingId]);

  // ── Remove ─────────────────────────────────────────────────────────────────
  // ✅ FIX: Always delete from saved_voices table (single source of truth)
  const handleRemove = async (voice: SavedVoice) => {
    if (removingId) return; // prevent double-click
    setRemovingId(voice.id);

    const supabase = createClient();

    // Stop audio if this voice is playing
    if (playingId === voice.id) {
      audioRef.current?.pause();
      audioRef.current = null;
      setPlayingId(null);
    }

    const { error } = await supabase
      .from('saved_voices')
      .delete()
      .eq('id', voice.id);

    if (error) {
      console.error('Delete error:', error.message);
      setRemovingId(null);
      return;
    }

    setVoices(prev => prev.filter(x => x.id !== voice.id));
    setRemovingId(null);
  };

  // ── Use in TTS ─────────────────────────────────────────────────────────────
  const handleUseInTTS = (voice: SavedVoice) => {
    localStorage.setItem(
      'flashtts_selected_voice',
      JSON.stringify({
        id: voice.voice_id || voice.id,
        name: voice.voice_name || 'Unnamed Voice',
        language: voice.language,
        gender: voice.gender,
        sample_url: voice.r2_url || voice.sample_url
      })
    );
    router.push('/dashboard/tts');
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ width: '32px', height: '32px', border: '3px solid rgba(245,197,24,0.2)', borderTop: '3px solid #f5c518', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif', width: '100%' }}>

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '24px', fontWeight: 700, color: 'var(--text)', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
          Saved Voices
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0 }}>
          Your personal voice collection — {voices.length} {voices.length === 1 ? 'voice' : 'voices'}
        </p>
      </div>

      {/* Plan Usage Bar */}
      <div style={{ marginBottom: "20px", padding: "14px 16px", background: isAtLimit ? "rgba(240,91,91,0.06)" : "var(--card-bg)", border: `1px solid ${isAtLimit ? "rgba(240,91,91,0.2)" : "var(--border)"}`, borderRadius: "14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <span style={{ fontSize: "12px", color: "var(--muted)", fontWeight: 600 }}>Voice Slots — <span style={{ textTransform: "capitalize", color: "#f5c518" }}>{userPlan}</span> Plan</span>
          <span style={{ fontSize: "12px", fontWeight: 700, color: isAtLimit ? "#f05b5b" : "var(--text)" }}>{voices.length} / {voiceLimit}</span>
        </div>
        <div style={{ height: "4px", background: "var(--border)", borderRadius: "99px", overflow: "hidden", marginBottom: "8px" }}>
          <div style={{ height: "100%", width: `${usagePct}%`, background: isAtLimit ? "#f05b5b" : usagePct >= 80 ? "#f5c518" : "#22d3a5", borderRadius: "99px", transition: "width 0.4s" }} />
        </div>
        {isAtLimit && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: "#f05b5b" }}>⚠️ Limit reached — delete a voice or upgrade</span>
            <a href="/dashboard/billing" style={{ fontSize: "12px", fontWeight: 700, color: "#f5c518", textDecoration: "none" }}>Upgrade →</a>
          </div>
        )}
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
            const isRemoving = removingId === v.id;
            const displayName = v.voice_name || 'Unnamed Voice';

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
                  opacity: isRemoving ? 0.5 : 1,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                  {/* Avatar */}
                  <div style={{
                    position: 'relative',
                    width: '44px', height: '44px', borderRadius: '50%',
                    background: getAvatarBackdrop(displayName),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.05)'
                  }}>
                    <Image src={getAvatarPath(displayName, v.gender)} alt={displayName} fill style={{ objectFit: 'cover' }} />
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '14px',
                      color: 'var(--text)', margin: '0 0 5px',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {displayName}
                    </p>
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                      {isCloned && (
                        <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '5px', background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)', color: '#a855f7', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                          Cloned
                        </span>
                      )}
                      {v.language && (
                        <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 6px', borderRadius: '5px', background: 'rgba(91,142,240,0.12)', border: '1px solid rgba(91,142,240,0.2)', color: '#5b8ef0' }}>
                          {v.language.toUpperCase()}
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

                  {/* Play button */}
                  <button
                    onClick={() => handlePlay(v.id, playUrl)}
                    disabled={!hasAudio || isRemoving}
                    title={hasAudio ? (isPlaying ? 'Stop preview' : 'Play preview') : 'No preview available'}
                    style={{
                      width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                      background: isPlaying ? 'rgba(245,197,24,0.20)' : 'rgba(255,255,255,0.06)',
                      border: isPlaying ? '1.5px solid rgba(245,197,24,0.4)' : '1px solid var(--border)',
                      cursor: hasAudio && !isRemoving ? 'pointer' : 'not-allowed',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: isPlaying ? '#f5c518' : hasAudio ? 'var(--text)' : 'var(--muted)',
                      opacity: hasAudio ? 1 : 0.35,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {isPlaying
                      ? <Square size={12} fill="currentColor" />
                      : <Play size={12} fill="currentColor" style={{ marginLeft: '1px' }} />}
                  </button>
                </div>

                {/* No preview note */}
                {!hasAudio && (
                  <p style={{ fontSize: '11px', color: 'var(--muted)', opacity: 0.6, margin: 0 }}>
                    No preview available
                  </p>
                )}

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '7px', marginTop: 'auto' }}>
                  <button
                    onClick={() => handleUseInTTS(v)}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      gap: '5px', padding: '9px', borderRadius: '9px',
                      background: 'rgba(245,197,24,0.08)', border: '1px solid rgba(245,197,24,0.2)',
                      color: '#f5c518', fontSize: '12px', fontWeight: 700,
                      cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                    }}
                  >
                    Use in TTS <ArrowRight size={11} strokeWidth={2.5} />
                  </button>
                  <button
                    onClick={() => handleRemove(v)}
                    disabled={isRemoving}
                    style={{
                      padding: '9px 11px', borderRadius: '9px',
                      background: 'rgba(255,80,80,0.06)',
                      border: '1px solid rgba(255,80,80,0.15)',
                      color: 'rgba(255,100,100,0.6)',
                      cursor: isRemoving ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center',
                      opacity: isRemoving ? 0.5 : 1,
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
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}