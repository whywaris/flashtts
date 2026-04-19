'use client';

import { useEffect, useRef, useState, useCallback, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';
import { getAvatarPath, getAvatarBackdrop } from '@/utils/avatar';
import { 
  Zap, 
  Search, 
  X, 
  Play, 
  Pause, 
  ChevronRight, 
  Clock, 
  Mic2,
  Trash2,
  Filter
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

// ─── Plan limits ────────────────────────────────────────────────────────────
const PLAN_LIMITS: Record<string, { perRequest: number; label: string }> = {
  free: { perRequest: 500, label: 'Free' },
  starter: { perRequest: 3000, label: 'Starter' },
  creator: { perRequest: 5000, label: 'Creator' },
  pro: { perRequest: 10000, label: 'Pro' },
  studio: { perRequest: 20000, label: 'Studio' },
};

// ─── Constants ─────────────────────────────────────────────────────────────
const TEMPLATES = [
  { id: 'youtube', label: '📺 YouTube Script', text: "Welcome back to the channel! Today we're diving into something that's going to completely change the way you think about [TOPIC]. Stay with me because this is important..." },
  { id: 'podcast', label: '🎙️ Podcast Intro', text: "Hey everyone, welcome back to another episode. I'm your host and today we have an incredible topic lined up for you. Let's jump right in..." },
  { id: 'story', label: '📖 Story Narrator', text: "In a world where nothing was quite as it seemed, one person dared to look beyond the ordinary and discover something extraordinary..." },
  { id: 'ad', label: '📢 Advertisement', text: "Tired of [PROBLEM]? Introducing the solution you've been waiting for. Fast, simple, and incredibly effective. Try it today — you won't look back." },
  { id: 'edu', label: '🎓 E-Learning', text: "Welcome to today's lesson. By the end of this session, you'll understand exactly how [TOPIC] works and how to apply it in real-world situations." },
  { id: 'custom', label: '✍️ Custom', text: "" },
];

const EMOTIONS = [
  { id: 'neutral', label: '😐 Neutral', emoji: '😐' },
  { id: 'happy', label: '😊 Happy', emoji: '😊' },
  { id: 'sad', label: '😢 Sad', emoji: '😢' },
  { id: 'angry', label: '😤 Angry', emoji: '😤' },
  { id: 'calm', label: '😌 Calm', emoji: '😌' },
  { id: 'excited', label: '😮 Excited', emoji: '😮' },
  { id: 'friendly', label: '🤗 Friendly', emoji: '🤗' },
  { id: 'authoritative', label: '📢 Authoritative', emoji: '📢' },
];

const LANGUAGES = [
  { code: 'all', label: 'All' },
  { code: 'en', label: 'EN' },
  { code: 'ar', label: 'AR' },
  { code: 'hi', label: 'HI' },
  { code: 'es', label: 'ES' },
  { code: 'fr', label: 'FR' },
];

interface SavedVoice {
  id: string;
  voice_id: string;
  name: string;
  language?: string | null;
  gender?: string | null;
  sample_url?: string | null;
}

interface SelectedVoice {
  id: string;
  name: string;
  language?: string | null;
  gender?: string | null;
  sample_url?: string | null;
  style?: string | null;
  tags?: string[] | null;
}

function TTSPageInner() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const searchParams = useSearchParams();

  // ─── Data State ───
  const [userId, setUserId] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [generating, setGenerating] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [language, setLanguage] = useState('en');
  const [selectedVoice, setSelectedVoice] = useState<SelectedVoice | null>(null);
  const [emotion, setEmotion] = useState('neutral');
  const [format, setFormat] = useState<'mp3' | 'wav'>('mp3');
  const [recentVoices, setRecentVoices] = useState<SelectedVoice[]>([]);

  // ─── Audio State ───
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [previewPlayingId, setPreviewPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ─── UI / Modal State ───
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [modalVoices, setModalVoices] = useState<any[]>([]);
  const [modalLoaded, setModalLoaded] = useState(false);
  const [modalSearch, setModalSearch] = useState('');
  const [modalLangFilter, setModalLangFilter] = useState('all');
  const [modalGenderFilter, setModalGenderFilter] = useState('all');

  const [userPlan, setUserPlan] = useState<string>('free');
  const [creditsUsed, setCreditsUsed] = useState<number>(0);
  const [creditsLimit, setCreditsLimit] = useState<number>(10000);
  const [error, setError] = useState('');

  const perRequest = (PLAN_LIMITS[userPlan] || PLAN_LIMITS.free).perRequest;

  // ─── Initialization ───
  useEffect(() => {
    const stored = localStorage.getItem('flashtts_selected_voice')
    if (stored) {
      try {
        const voice = JSON.parse(stored)
        setSelectedVoice(voice);
        if (voice.language) setLanguage(voice.language);
        toast.success(`Voice loaded: ${voice.name}`, {
          style: {
            background: 'var(--card-bg)',
            border: '1px solid #f5c518',
            color: 'var(--text)'
          },
          icon: '🎙️'
        });
        localStorage.removeItem('flashtts_selected_voice')
      } catch (e) {
        localStorage.removeItem('flashtts_selected_voice')
      }
    }

    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUserId(user.id);

      const { data: profile } = await supabase
        .from('profiles')
        .select('plan, credits_used, credits_limit')
        .eq('id', user.id)
        .single();

      if (profile) {
        setUserPlan(profile.plan || 'free');
        setCreditsUsed(profile.credits_used ?? 0);
        setCreditsLimit(profile.credits_limit ?? 10000);
      }

      // Load recent voices from localStorage
      const storedRecent = localStorage.getItem('recent_voices');
      if (storedRecent) {
        try { setRecentVoices(JSON.parse(storedRecent)); } catch { }
      }

      // Handle ?voice= URL param
      const voiceParam = searchParams.get('voice');
      if (voiceParam && !selectedVoice) {
        const { data: libVoice } = await supabase
          .from('voices')
          .select('id, name, language, gender, sample_url, style, tags')
          .eq('id', voiceParam)
          .single();

        if (libVoice) {
          setSelectedVoice({
            id: libVoice.id,
            name: libVoice.name,
            language: libVoice.language,
            gender: libVoice.gender,
            sample_url: libVoice.sample_url,
            style: libVoice.style,
            tags: libVoice.tags,
          });
          if (libVoice.language) setLanguage(libVoice.language);
        }
      }
    }
    init();
  }, [router, searchParams, supabase]);

  // ─── Modal Data Loading ───
  useEffect(() => {
    if (voiceModalOpen && !modalLoaded) {
      supabase
        .from('voices')
        .select('id, name, language, gender, style, tags, sample_url')
        .eq('is_active', true)
        .order('name')
        .then(({ data }) => {
          setModalVoices(data || []);
          setModalLoaded(true);
        });
    }
  }, [voiceModalOpen, modalLoaded, supabase]);

  // ─── Logic ───
  const resolveVoiceSampleUrl = async (voiceId: string) => {
    const { data } = await supabase
      .from('voices')
      .select('sample_url')
      .eq('id', voiceId)
      .single();
    return data?.sample_url || null;
  };

  const handlePreview = useCallback((voiceId: string, sampleUrl: string | null) => {
    if (!sampleUrl) return;

    // Stop any currently playing audio first
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = '';
    }

    if (previewPlayingId === voiceId) {
      setPreviewPlayingId(null);
      return;
    }

    // Play new audio
    const audio = new Audio(sampleUrl);
    audioRef.current = audio;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(e => console.log('Audio abruptly paused', e));
    }
    
    setPreviewPlayingId(voiceId);
    audio.onended = () => setPreviewPlayingId(null);
  }, [previewPlayingId]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, []);

  const handleCloseModal = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = '';
      audioRef.current = null;
    }
    setPreviewPlayingId(null);
    setVoiceModalOpen(false);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && voiceModalOpen) {
        handleCloseModal();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [voiceModalOpen, handleCloseModal]);

  const handleUseVoice = useCallback((voice: SelectedVoice) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = '';
      audioRef.current = null;
    }
    setPreviewPlayingId(null);
    setSelectedVoice(voice);
    setVoiceModalOpen(false);
  }, []);

  const updateRecentVoices = (voice: SelectedVoice) => {
    const updated = [
      voice,
      ...recentVoices.filter(v => v.id !== voice.id)
    ].slice(0, 3);
    setRecentVoices(updated);
    localStorage.setItem('recent_voices', JSON.stringify(updated));
  };

  const handleGenerate = useCallback(async () => {
    if (!text.trim()) { toast.error('Please enter some text first'); return; }
    if (!selectedVoice) { toast.error('Please select a voice first'); return; }

    setGenerating(true);
    setAudioUrl(prev => { if (prev) URL.revokeObjectURL(prev); return null; });
    setAudioBlob(null);
    setError('');

    let voiceUrl = selectedVoice.sample_url;
    if (!voiceUrl) voiceUrl = await resolveVoiceSampleUrl(selectedVoice.id);
    if (!voiceUrl) {
      toast.error('Voice sample not found');
      setGenerating(false);
      return;
    }

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim(),
          voice_id: selectedVoice.id,
          voice_name: selectedVoice.name,
          voice_url: voiceUrl,
          language: language,
          speed: speed,
          emotion: emotion,
          audio_format: format,
        }),
      });

      if (response.status === 402) { setError('Credit limit reached!'); return; }
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Generation failed');
      }

      const rawBlob = await response.blob();
      const mp3Blob = new Blob([rawBlob], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(mp3Blob);
      setAudioBlob(mp3Blob);
      setAudioUrl(url);
      setCreditsUsed(prev => prev + text.trim().length);
      updateRecentVoices(selectedVoice);
      toast.success('Audio generated!');

    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setGenerating(false);
    }
  }, [text, selectedVoice, generating, speed, language, emotion, format, audioUrl, supabase]);

  // ─── Keyboard Shortcut (after handleGenerate is declared) ───
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!generating && text.trim() && selectedVoice) {
          handleGenerate();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [generating, text, selectedVoice, handleGenerate]);

  const charPercent = (text.length / perRequest) * 100;
  const progressColor = charPercent > 90 ? '#ef4444' : charPercent > 70 ? '#f5c518' : '#22c55e';

  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <Toaster position="top-right" />
      
      <div className="flex flex-col lg:flex-row gap-8 items-start">

        {/* --- LEFT COLUMN --- */}
        <div className="w-full lg:flex-1 min-w-0">

          {/* Page Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '24px', fontWeight: 800, color: 'var(--text)', margin: '0 0 4px' }}>
                Text to Speech
              </h1>
              <p style={{ fontSize: '12px', color: 'var(--muted)' }}>
                AI-powered · 20+ languages · 19 emotions
              </p>
            </div>
            <div style={{ 
              background: 'rgba(245,197,24,0.08)', border: '1px solid rgba(245,197,24,0.15)', 
              borderRadius: '20px', padding: '6px 14px', color: '#f5c518', fontSize: '12px', fontWeight: 700 
            }}>
              ⚡ {(creditsLimit - creditsUsed).toLocaleString()} chars remaining
            </div>
          </div>

          {/* Script Templates */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '12px' }} className="no-scrollbar">
            {TEMPLATES.map(t => (
              <button
                key={t.id}
                onClick={() => {
                  setText(t.text);
                  if (t.id === 'custom') {
                    const el = document.getElementById('tts-textarea');
                    el?.focus();
                  }
                }}
                style={{
                  padding: '7px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                  background: 'var(--card-bg)', border: '1px solid var(--border)', color: 'var(--muted)',
                  whiteSpace: 'nowrap', transition: 'all 0.2s'
                }}
                className="hover-accent-border"
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Textarea Card */}
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '24px', padding: '24px', marginBottom: '20px' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '16px' }}>
              YOUR SCRIPT
            </div>

            <textarea
              id="tts-textarea"
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, perRequest))}
              placeholder="What do you want the voice to say?"
              style={{
                width: '100%', minHeight: '280px', background: 'transparent', border: 'none', outline: 'none',
                resize: 'vertical', color: 'var(--text)', fontSize: '15px', lineHeight: '1.7',
                fontFamily: 'inherit', textAlign: 'left', direction: 'ltr', padding: '4px 0',
              }}
            />

            {/* Progress Bar Redesign */}
            <div style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, marginBottom: '6px' }}>
                <span style={{ color: 'var(--muted)' }}>{text.length.toLocaleString()} characters</span>
                <span style={{ color: progressColor }}>
                  {Math.max(0, perRequest - text.length).toLocaleString()} remaining
                </span>
              </div>
              <div style={{ height: '3px', background: 'var(--border)', borderRadius: '4px' }}>
                <div style={{ height: '100%', width: `${charPercent}%`, background: progressColor, borderRadius: '4px', transition: 'width 0.3s ease' }} />
              </div>
              <p style={{ fontSize: '11px', color: 'var(--muted)', opacity: 0.5, marginTop: '8px' }}>
                Press Ctrl+Enter to generate
              </p>
            </div>
          </div>

          {/* Emotion Selector */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '12px' }}>
              EMOTION
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {EMOTIONS.map(e => {
                const active = emotion === e.id;
                return (
                  <button
                    key={e.id}
                    onClick={() => setEmotion(e.id)}
                    style={{
                      padding: '8px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: 600,
                      background: active ? 'rgba(245,197,24,0.1)' : 'var(--card-bg)',
                      border: active ? '1px solid rgba(245,197,24,0.3)' : '1px solid var(--border)',
                      color: active ? '#f5c518' : 'var(--text)',
                      transition: 'all 0.2s'
                    }}
                  >
                    {e.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Error & Audio Result */}
          {error && <div style={{ padding: '12px 16px', background: 'rgba(240,91,91,0.1)', border: '1px solid rgba(240,91,91,0.2)', borderRadius: '12px', color: '#f05b5b', fontSize: '13px', marginBottom: '20px' }}>⚠️ {error}</div>}
          
          {audioUrl && (
            <div style={{ background: 'rgba(245,197,24,0.04)', border: '1px solid rgba(245,197,24,0.1)', borderRadius: '24px', padding: '24px' }}>
              <audio controls src={audioUrl} style={{ width: '100%', marginBottom: '20px' }} />
              <div style={{ display: 'flex', gap: '12px' }}>
                {format === 'mp3' ? (
                  <button
                    onClick={() => {
                      if (!audioBlob) return;
                      const url = URL.createObjectURL(new Blob([audioBlob], { type: 'audio/mpeg' }));
                      const a = document.createElement('a'); a.href = url; a.download = `flashtts-${Date.now()}.mp3`;
                      document.body.appendChild(a); a.click(); document.body.removeChild(a);
                      setTimeout(() => URL.revokeObjectURL(url), 2000);
                    }}
                    style={{ flex: 1, padding: '12px', background: '#f5c518', color: '#000', border: 'none', borderRadius: '12px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Download MP3
                  </button>
                ) : (
                  <button
                    onClick={async () => {
                      if (!audioBlob) return;
                      const ab = await audioBlob.arrayBuffer();
                      const ctx = new AudioContext(); const buf = await ctx.decodeAudioData(ab);
                      const numCh = buf.numberOfChannels; const sr = buf.sampleRate; const len = buf.length * numCh * 2;
                      const wavBuf = new ArrayBuffer(44 + len); const view = new DataView(wavBuf);
                      const ws = (off: number, s: string) => { for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i)); };
                      ws(0, 'RIFF'); view.setUint32(4, 36 + len, true); ws(8, 'WAVE'); ws(12, 'fmt '); view.setUint32(16, 16, true);
                      view.setUint16(20, 1, true); view.setUint16(22, numCh, true); view.setUint32(24, sr, true);
                      view.setUint32(28, sr * numCh * 2, true); view.setUint16(32, numCh * 2, true); view.setUint16(34, 16, true);
                      ws(36, 'data'); view.setUint32(40, len, true);
                      let off = 44;
                      for (let i = 0; i < buf.length; i++) {
                        for (let ch = 0; ch < numCh; ch++) {
                          const s = Math.max(-1, Math.min(1, buf.getChannelData(ch)[i]));
                          view.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true); off += 2;
                        }
                      }
                      const wavBlob = new Blob([wavBuf], { type: 'audio/wav' }); const url = URL.createObjectURL(wavBlob);
                      const a = document.createElement('a'); a.href = url; a.download = `flashtts-${Date.now()}.wav`;
                      document.body.appendChild(a); a.click(); document.body.removeChild(a);
                      setTimeout(() => URL.revokeObjectURL(url), 2000);
                    }}
                    style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#f0f0f8', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Download WAV
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* --- RIGHT COLUMN --- */}
        <div className="w-full lg:w-[300px] shrink-0" style={{ position: 'sticky', top: '24px' }}>
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

            {/* Recent Voices */}
            {recentVoices.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '12px' }}>
                  RECENT
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {recentVoices.map(v => {
                    const active = selectedVoice?.id === v.id;
                    return (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVoice(v)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', border: 'none', background: 'none', cursor: 'pointer', width: '100%', textAlign: 'left'
                        }}
                      >
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: getAvatarBackdrop(v.name), position: 'relative', overflow: 'hidden', border: active ? '1px solid #f5c518' : 'none' }}>
                          <Image src={getAvatarPath(v.name, v.gender)} alt={v.name} fill />
                        </div>
                        <span style={{ fontSize: '13px', color: active ? '#f5c518' : 'var(--text)', fontWeight: 500 }}>{v.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Selected Voice */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '12px' }}>
                SELECTED VOICE
              </div>
              {selectedVoice ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '4px 0' }}>
                  <div style={{ position: 'relative', width: '42px', height: '42px', borderRadius: '50%', background: getAvatarBackdrop(selectedVoice.name), flexShrink: 0, overflow: 'hidden' }}>
                    <Image src={getAvatarPath(selectedVoice.name, selectedVoice.gender)} alt={selectedVoice.name} fill style={{ objectFit: 'cover' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {selectedVoice.name}
                    </div>
                    <button onClick={() => setVoiceModalOpen(true)} style={{ fontSize: '11px', color: '#f5c518', textDecoration: 'none', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      Change Voice →
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setVoiceModalOpen(true)}
                  style={{ width: '100%', padding: '16px', border: '1px dashed var(--border)', borderRadius: '14px', background: 'transparent', textAlign: 'center', cursor: 'pointer' }}
                >
                  <span style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 600 }}>🎙 Choose a Voice</span>
                </button>
              )}
            </div>

            {/* Language */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '8px' }}>
                LANGUAGE
              </div>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text)', fontSize: '13px', outline: 'none' }}
              >
                 <option value="en">🇺🇸 English</option>
                 <option value="ar">🇸🇦 Arabic</option>
                 <option value="hi">🇮🇳 Hindi</option>
                 <option value="es">🇪🇸 Spanish</option>
                 <option value="fr">🇫🇷 French</option>
                 <option value="de">🇩🇪 German</option>
                 <option value="ja">🇯🇵 Japanese</option>
                 <option value="ko">🇰🇷 Korean</option>
                 <option value="tr">🇹🇷 Turkish</option>
                 <option value="ru">🇷🇺 Russian</option>
                 <option value="pt">🇵🇹 Portuguese</option>
                 <option value="it">🇮🇹 Italian</option>
                 <option value="nl">🇳🇱 Dutch</option>
                 <option value="pl">🇵🇱 Polish</option>
                 <option value="ms">🇲🇾 Malay</option>
                 <option value="da">🇩🇰 Danish</option>
                 <option value="no">🇳🇴 Norwegian</option>
                 <option value="fi">🇫🇮 Finnish</option>
                 <option value="sv">🇸🇪 Swedish</option>
                 <option value="el">🇬🇷 Greek</option>
              </select>
            </div>

            {/* Speed */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)' }}>SPEED</div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#f5c518' }}>{speed.toFixed(1)}x</div>
              </div>
              <input
                type="range" min="0.5" max="2.0" step="0.1" value={speed}
                onChange={e => setSpeed(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#f5c518', cursor: 'pointer' }}
              />
            </div>

            {/* Format Selector */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ 
                fontSize: '10px', fontWeight: 700,
                letterSpacing: '1.5px', 
                textTransform: 'uppercase',
                color: 'var(--muted)', 
                marginBottom: '8px' 
              }}>
                FORMAT
              </div>
              <div style={{ 
                display: 'flex', gap: '6px' 
              }}>
                {['mp3', 'wav'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFormat(f as 'mp3' | 'wav')}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '10px',
                      border: format === f 
                        ? '1px solid rgba(245,197,24,0.4)' 
                        : '1px solid var(--border)',
                      background: format === f 
                        ? 'rgba(245,197,24,0.1)' 
                        : 'transparent',
                      color: format === f 
                        ? '#f5c518' 
                        : 'var(--muted)',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                      fontFamily: 'monospace',
                    }}
                  >
                    {f === 'mp3' ? '🎵 MP3' : '🎚 WAV'}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={handleGenerate}
                disabled={generating || !text.trim()}
                style={{
                  width: '100%', padding: '13px 16px', borderRadius: '16px',
                  background: generating || !text.trim() ? 'var(--secondary)' : '#f5c518',
                  color: generating || !text.trim() ? 'rgba(0,0,0,0.3)' : '#000',
                  boxShadow: generating || !text.trim() ? 'none' : '0 10px 20px rgba(245,197,24,0.15)',
                  transition: 'all 0.2s',
                  fontFamily: 'Syne, sans-serif',
                  fontSize: '14px', fontWeight: 700, border: 'none', cursor: generating || !text.trim() ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}
              >
                {generating ? (
                  <>
                    <div style={{ width: '15px', height: '15px', border: '2px solid rgba(0,0,0,0.2)', borderTop: '2px solid rgba(0,0,0,0.6)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
                    Generating...
                  </>
                ) : (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                    </svg>
                    Generate Audio
                  </>
                )}
              </button>
              <p style={{ textAlign: 'center', fontSize: '12px', color: '#aaaaaa', margin: '8px 0 0', fontFamily: 'inherit' }}>
                Press Ctrl+Enter to generate
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── VOICE MODAL ─── */}
      {voiceModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={handleCloseModal}>
          <div 
            style={{ 
              background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '24px', 
              width: 'min(620px, 92vw)', maxHeight: '82vh', display: 'flex', flexDirection: 'column', 
              overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)' 
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: '#1a1a2e' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                <div>
                  <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 800, color: '#ffffff', margin: '0 0 4px' }}>Choose a Voice</h2>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>{modalVoices.length} premium voices available</p>
                </div>
                <button 
                  onClick={handleCloseModal} 
                  style={{ 
                    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', 
                    color: '#ffffff', borderRadius: '50%', width: '32px', height: '32px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' 
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Search */}
              <div style={{ position: 'relative', marginBottom: '20px' }}>
                <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
                <input 
                  type="text" 
                  className="voice-search"
                  placeholder="Search voices by name, style, or language..." 
                  value={modalSearch}
                  onChange={e => setModalSearch(e.target.value)}
                  style={{ 
                    width: '100%', padding: '12px 16px 12px 42px', background: 'rgba(255,255,255,0.07)', 
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#ffffff', 
                    fontSize: '14px', outline: 'none' 
                  }}
                />
              </div>

              {/* Filters */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {LANGUAGES.map(l => (
                    <button 
                      key={l.code}
                      onClick={() => setModalLangFilter(l.code)}
                      style={{ 
                        padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, border: 'none', cursor: 'pointer',
                        background: modalLangFilter === l.code ? '#f5c518' : 'transparent',
                        color: modalLangFilter === l.code ? '#000000' : 'rgba(255,255,255,0.5)',
                        transition: 'all 0.2s'
                      }}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {['all', 'female', 'male'].map(g => (
                    <button 
                      key={g}
                      onClick={() => setModalGenderFilter(g)}
                      style={{ 
                        padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, border: 'none', cursor: 'pointer',
                        background: modalGenderFilter === g ? '#f5c518' : 'transparent',
                        color: modalGenderFilter === g ? '#000000' : 'rgba(255,255,255,0.5)',
                        textTransform: 'capitalize',
                        transition: 'all 0.2s'
                      }}
                    >
                      {g === 'all' ? 'Both' : g}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Voice List */}
            <div style={{ flex: 1, overflowY: 'auto', background: '#1a1a2e' }} className="voice-list-scrollbar">
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {modalVoices
                  .filter(v => {
                    const matchSearch = v.name.toLowerCase().includes(modalSearch.toLowerCase()) || 
                                     (v.style || '').toLowerCase().includes(modalSearch.toLowerCase()) ||
                                     v.language.toLowerCase().includes(modalSearch.toLowerCase());
                    const matchLang = modalLangFilter === 'all' || v.language === modalLangFilter;
                    const matchGender = modalGenderFilter === 'all' || v.gender === modalGenderFilter;
                    return matchSearch && matchLang && matchGender;
                  })
                  .map(v => {
                    const isSelected = selectedVoice?.id === v.id;
                    return (
                      <div 
                        key={v.id}
                        onClick={() => handleUseVoice(v)}
                        className={`voice-modal-item ${isSelected ? 'selected' : ''}`}
                        style={{ 
                          display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 24px', 
                          cursor: 'pointer', transition: 'all 0.15s', 
                          borderBottom: '1px solid rgba(255,255,255,0.05)',
                          background: isSelected ? 'rgba(245,197,24,0.1)' : 'transparent',
                          borderLeft: isSelected ? '3px solid #f5c518' : 'none',
                          paddingLeft: isSelected ? '21px' : '24px'
                        }}
                      >
                        <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: getAvatarBackdrop(v.name), position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
                          <Image src={getAvatarPath(v.name, v.gender)} alt={v.name} fill />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff', fontFamily: 'Syne, sans-serif' }}>{v.name}</div>
                          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', display: 'flex', gap: '8px', alignItems: 'center', marginTop: '2px' }}>
                            <span>{v.style || v.tags?.[0] || 'Professional'}</span>
                            <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
                            <span style={{ 
                              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', 
                              color: 'rgba(255,255,255,0.5)', fontSize: '10px', fontWeight: 700, 
                              padding: '2px 6px', borderRadius: '4px' 
                            }}>
                              {v.language.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handlePreview(v.id, v.sample_url); }}
                            style={{ 
                              width: '36px', height: '36px', borderRadius: '50%', 
                              background: previewPlayingId === v.id ? 'rgba(245,197,24,0.2)' : 'rgba(245,197,24,0.1)', 
                              border: previewPlayingId === v.id ? '1px solid rgba(245,197,24,0.5)' : '1px solid rgba(245,197,24,0.25)', 
                              color: '#f5c518', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                          >
                            {previewPlayingId === v.id ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                          </button>
                          <div className="select-badge" style={{ fontSize: '12px', fontWeight: 700, background: '#f5c518', color: '#000', padding: '6px 12px', borderRadius: '8px', opacity: 0 }}>
                            Select →
                          </div>
                        </div>
                      </div>
                    )
                  })
                }
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'center', background: '#1a1a2e' }}>
               <Link href="/dashboard/library" style={{ fontSize: '13px', fontWeight: 700, color: '#f5c518', textDecoration: 'none' }}>
                 Browse Full Voice library →
               </Link>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .hover-accent-border:hover { border-color: #f5c518 !important; color: #f5c518 !important; }
        .voice-list-scrollbar::-webkit-scrollbar { width: 4px; }
        .voice-list-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .voice-list-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        .voice-modal-item:hover { background: rgba(255,255,255,0.05) !important; }
        .voice-modal-item.selected { background: rgba(245,197,24,0.1) !important; border-left: 3px solid #f5c518 !important; }
        .voice-search::placeholder { color: rgba(255,255,255,0.35); }
        .voice-search:focus { border: 1px solid rgba(245,197,24,0.4) !important; }
        .voice-modal-item:hover .select-badge { opacity: 1 !important; transform: translateX(0); }
        .select-badge { transition: all 0.2s; transform: translateX(5px); }
        select option { background: #1a1a1a; color: #fff; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default function TTSPage() {
  return (
    <Suspense fallback={<div />}>
      <TTSPageInner />
    </Suspense>
  );
}