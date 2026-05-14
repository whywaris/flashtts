'use client';

import { useEffect, useState, useCallback, useMemo, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';
import { getAvatarPath, getAvatarBackdrop } from '@/utils/avatar';
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

const VOICE_PRESETS = [
  { label: 'Balanced (Recommended)', value: 'balanced', cfg: 0.4, exag: 0.5 },
  { label: 'Strict Clone (Clean audio only)', value: 'strict', cfg: 0.7, exag: 0.5 },
  { label: 'Natural Flow (Fixes robotic voice)', value: 'natural', cfg: 0.25, exag: 0.4 },
  { label: 'Expressive / Dramatic', value: 'expressive', cfg: 0.3, exag: 0.75 },
  { label: 'Cross-Lingual (Different language)', value: 'crosslingual', cfg: 0.0, exag: 0.5 },
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

interface SelectedVoice {
  id: string;
  name: string;
  language?: string | null;
  gender?: string | null;
  sample_url?: string | null;
  style?: string | null;
  tags?: string[] | null;
  referenceAudioUrl?: string | null;
  source?: 'cloned' | null;
  r2_url?: string | null;
}

function TTSPageInner() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  // ─── Data State ───
  const [text, setText] = useState('');
  const [generating, setGenerating] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [language, setLanguage] = useState('en');
  const [selectedVoice, setSelectedVoice] = useState<SelectedVoice | null>(null);
  const [emotion, setEmotion] = useState('neutral');
  const [voicePreset, setVoicePreset] = useState('balanced');
  const [format, setFormat] = useState<'mp3' | 'wav'>('mp3');
  const [recentVoices, setRecentVoices] = useState<SelectedVoice[]>([]);

  // ─── Audio State ───
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // ─── UI State ───
  const [userPlan, setUserPlan] = useState<string>('free');
  const [creditsUsed, setCreditsUsed] = useState<number>(0);
  const [creditsLimit, setCreditsLimit] = useState<number>(10000);
  const [error, setError] = useState('');

  const perRequest = (PLAN_LIMITS[userPlan] || PLAN_LIMITS.free).perRequest;

  useEffect(() => { document.title = 'Text to Speech'; }, []);

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

    }
    init();
  }, [router, supabase]);

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

    console.log('Voice data:', JSON.stringify(selectedVoice, null, 2));

    setGenerating(true);
    setAudioUrl(prev => { if (prev) URL.revokeObjectURL(prev); return null; });
    setAudioBlob(null);
    setError('');

    const referenceAudioUrl = selectedVoice.r2_url || selectedVoice.referenceAudioUrl || null;

    if (!referenceAudioUrl) {
      toast.error('Cloned voice reference audio not found');
      setGenerating(false);
      return;
    }

    try {
      const preset = VOICE_PRESETS.find(p => p.value === voicePreset) ?? VOICE_PRESETS[0];

      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim(),
          referenceAudioUrl,
          language: language,
          voiceLanguage: 'en',
          cfg_weight: preset.cfg,
          exaggeration: preset.exag,
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

      const data = await response.json();
      if (!data.audioUrl) throw new Error('No audio URL returned');

      const audioRes = await fetch(data.audioUrl);
      const audioBuffer = await audioRes.arrayBuffer();
      const wavBlob = new Blob([audioBuffer], { type: 'audio/wav' });
      const url = URL.createObjectURL(wavBlob);
      setAudioBlob(wavBlob);
      setAudioUrl(url);
      setCreditsUsed(prev => prev + text.trim().length);
      updateRecentVoices(selectedVoice);
      toast.success('Audio generated!');

    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setGenerating(false);
    }
  }, [text, selectedVoice, generating, speed, language, voicePreset, emotion, format, audioUrl, supabase]);

  // ─── Auto-switch preset on language change ───
  useEffect(() => {
    setVoicePreset(language !== 'en' ? 'crosslingual' : 'balanced');
  }, [language]);

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
                    <button onClick={() => router.push('/dashboard/saved')} style={{ fontSize: '11px', color: '#f5c518', textDecoration: 'none', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      Change Voice →
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => router.push('/dashboard/saved')}
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

            {/* Voice Style */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '8px' }}>
                VOICE STYLE
              </div>
              <select
                value={voicePreset}
                onChange={e => setVoicePreset(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text)', fontSize: '13px', outline: 'none' }}
              >
                {VOICE_PRESETS.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
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

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .hover-accent-border:hover { border-color: #f5c518 !important; color: #f5c518 !important; }
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