'use client';

import { useEffect, useRef, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import {
  Play,
  Pause,
  ArrowRight,
  Square,
  Music,
  Zap
} from 'lucide-react';

// --- Plan limits (per request) ---
const PLAN_LIMITS: Record<string, { perRequest: number; label: string }> = {
  free:    { perRequest: 500,    label: 'Free' },
  starter: { perRequest: 3000,   label: 'Starter' },
  creator: { perRequest: 5000,   label: 'Creator' },
  pro:     { perRequest: 10000,  label: 'Pro' },
  studio:  { perRequest: 20000,  label: 'Studio' },
};

interface SavedVoice {
  id: string;
  voice_id: string;
  name: string;
  language?: string | null;
  gender?: string | null;
  sample_url?: string | null;
}

const VOICE_DOT_COLORS = [
  '#f5c518', '#5b8ef0', '#22d3a5', '#f472b6', '#a855f7',
  '#ff6b35', '#34d399', '#60a5fa',
];

function dotColor(name: string) {
  return VOICE_DOT_COLORS[String(name).charCodeAt(0) % VOICE_DOT_COLORS.length] || '#f5c518';
}

function TTSPageInner() {
  const router = useRouter();
  const supabase = createClient();
  const searchParams = useSearchParams();

  // --- States ---
  const [userId, setUserId] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [generating, setGenerating] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [language, setLanguage] = useState('en');
  const [selectedVoice, setSelectedVoice] = useState<any>(null);
  
  // FIX 1 States
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const [savedVoices, setSavedVoices] = useState<SavedVoice[]>([]);
  const [loadingVoices, setLoadingVoices] = useState(true);
  const [userPlan, setUserPlan] = useState<string>('free');
  const [creditsUsed, setCreditsUsed] = useState<number>(0);
  const [creditsLimit, setCreditsLimit] = useState<number>(10000);
  const [error, setError] = useState('');
  const [previewPlayingId, setPreviewPlayingId] = useState<string | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  const perRequest = (PLAN_LIMITS[userPlan] || PLAN_LIMITS.free).perRequest;

  // --- FIX 3 Voice Select ---
  function handleSelectSavedVoice(v: any) {
    setSelectedVoice({
      id: v.voice_id || v.id,
      name: v.voice_name || v.name,
      language: v.language || language,
      sample_url: v.sample_url,
    });
    if (v.language) setLanguage(v.language); // auto-match language
  }

  // --- FIX 3 Mount Effect ---
  useEffect(() => {
    const stored = localStorage.getItem('tts_selected_voice');
    if (stored) {
      try {
        const v = JSON.parse(stored);
        setSelectedVoice(v);
        if (v.language) setLanguage(v.language);
        localStorage.removeItem('tts_selected_voice');
      } catch {}
    }
  }, []);

  useEffect(() => {
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
        setCreditsUsed(profile.credits_used || 0);
        setCreditsLimit(profile.credits_limit || 10000);
      }

      const { data } = await supabase
        .from('saved_voices')
        .select('id, voice_id, name, language, gender, sample_url')
        .eq('user_id', user.id);

      setSavedVoices(data ?? []);
      setLoadingVoices(false);

      // URL query param ?voice=
      const voiceParam = searchParams.get('voice');
      if (voiceParam && !selectedVoice) {
        const savedMatch = (data ?? []).find((sv: SavedVoice) => sv.voice_id === voiceParam);
        if (savedMatch) {
          handleSelectSavedVoice(savedMatch);
        } else {
          const { data: libVoice } = await supabase
            .from('voices')
            .select('id, name, language, gender, sample_url')
            .eq('id', voiceParam)
            .single();
          if (libVoice) {
            handleSelectSavedVoice({
              voice_id: libVoice.id,
              voice_name: libVoice.name,
              language: libVoice.language,
              sample_url: libVoice.sample_url
            });
          }
        }
      }
    }
    init();
  }, [router, searchParams, supabase]);

  const playVoicePreview = useCallback((voiceId: string, url: string | null) => {
    if (!url) return;
    if (previewPlayingId === voiceId) {
      previewAudioRef.current?.pause();
      setPreviewPlayingId(null);
      return;
    }
    if (previewAudioRef.current) previewAudioRef.current.pause();
    previewAudioRef.current = new Audio(url);
    previewAudioRef.current.play();
    setPreviewPlayingId(voiceId);
    previewAudioRef.current.onended = () => setPreviewPlayingId(null);
  }, [previewPlayingId]);

  const handleGenerate = async () => {
    if (!text.trim()) { alert('Please enter some text first'); return; }
    if (!selectedVoice) { alert('Please select a voice first'); return; }

    setGenerating(true);
    setAudioUrl(null);
    setAudioBlob(null);
    setError('');

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim(),
          voice_id: selectedVoice.id,
          voice_name: selectedVoice.name,
          language: language,
          speed: speed,
        }),
      });

      if (response.status === 402) { setError('Credit limit reached! Please upgrade your plan.'); return; }
      if (response.status === 403) { setError('Your account has been suspended.'); return; }
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Generation failed');
      }

      // FIX 1: Blob Handling
      const rawBlob = await response.blob();
      const mp3Blob = new Blob([rawBlob], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(mp3Blob);
      setAudioBlob(mp3Blob);
      setAudioUrl(url);

      // Save to history
      if (userId) {
        await supabase.from('tts_jobs').insert({
          user_id: userId,
          text_input: text.trim(),
          voice_id: selectedVoice.id,
          voice_name: selectedVoice.name,
          language: language,
          char_count: text.trim().length
        });
      }

      setCreditsUsed(prev => prev + text.trim().length);

    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif' }}>
      
      {/* FIX 2: Outer Wrapper */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
        
        {/* --- LEFT COLUMN --- */}
        <div style={{ flex: 1, minWidth: 0 }}>
          
          {/* Page Header */}
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '24px', fontWeight: 700, color: 'var(--text)', margin: '0 0 4px' }}>
              Text to Speech
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
              AI-powered voice generator with 20+ languages
            </p>
          </div>

          {/* Textarea Card */}
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '24px', padding: '20px', marginBottom: '20px' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '16px' }}>
              YOUR SCRIPT
            </div>
            
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, perRequest))}
              placeholder="What do you want the voice to say?"
              style={{
                width: '100%',
                minHeight: '260px',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                resize: 'vertical',
                color: 'var(--text)',
                fontSize: '15px',
                lineHeight: '1.7',
                fontFamily: 'DM Sans, sans-serif',
                textAlign: 'left',     // ← MUST be left
                direction: 'ltr',      // ← MUST be ltr
                padding: '4px 0',
              }}
            />
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: text.length >= perRequest ? '#f5c518' : 'var(--muted)' }}>
                {text.length.toLocaleString()} / {perRequest.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{ padding: '12px 16px', background: 'rgba(240,91,91,0.1)', border: '1px solid rgba(240,91,91,0.2)', borderRadius: '12px', color: '#f05b5b', fontSize: '13px', marginBottom: '20px' }}>
              ⚠️ {error}
            </div>
          )}

          {/* FIX 2: Audio Result Card */}
          {audioUrl && (
            <div style={{ background: 'rgba(245,197,24,0.04)', border: '1px solid rgba(245,197,24,0.1)', borderRadius: '24px', padding: '24px' }}>
              <audio controls src={audioUrl} style={{ width: '100%', marginBottom: '20px' }} />
              
              <div style={{ display: 'flex', gap: '12px' }}>
                {/* FIX 1: MP3 Download */}
                <button
                  onClick={() => {
                    if (!audioBlob) return;
                    const url = URL.createObjectURL(new Blob([audioBlob], { type: 'audio/mpeg' }));
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `flashtts-${Date.now()}.mp3`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    setTimeout(() => URL.revokeObjectURL(url), 2000);
                  }}
                  style={{
                    flex: 1, padding: '10px',
                    background: '#f5c518', color: '#000',
                    border: 'none', borderRadius: '12px',
                    fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: '6px',
                  }}
                >
                  ⬇ Download MP3
                </button>

                {/* FIX 1: WAV Download */}
                <button
                  onClick={async () => {
                    if (!audioBlob) return;
                    try {
                      const ab = await audioBlob.arrayBuffer();
                      const ctx = new AudioContext();
                      const buf = await ctx.decodeAudioData(ab);
                      const numCh = buf.numberOfChannels;
                      const sr = buf.sampleRate;
                      const len = buf.length * numCh * 2;
                      const wavBuf = new ArrayBuffer(44 + len);
                      const view = new DataView(wavBuf);
                      const ws = (off: number, s: string) => {
                        for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i));
                      };
                      ws(0,'RIFF'); view.setUint32(4,36+len,true); ws(8,'WAVE');
                      ws(12,'fmt '); view.setUint32(16,16,true); view.setUint16(20,1,true);
                      view.setUint16(22,numCh,true); view.setUint32(24,sr,true);
                      view.setUint32(28,sr*numCh*2,true); view.setUint16(32,numCh*2,true);
                      view.setUint16(34,16,true); ws(36,'data'); view.setUint32(40,len,true);
                      let off = 44;
                      for (let i = 0; i < buf.length; i++) {
                        for (let ch = 0; ch < numCh; ch++) {
                          const s = Math.max(-1, Math.min(1, buf.getChannelData(ch)[i]));
                          view.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true);
                          off += 2;
                        }
                      }
                      const wavBlob = new Blob([wavBuf], { type: 'audio/wav' });
                      const url = URL.createObjectURL(wavBlob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `flashtts-${Date.now()}.wav`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      setTimeout(() => URL.revokeObjectURL(url), 2000);
                    } catch { alert('WAV conversion failed. Download MP3 instead.'); }
                  }}
                  style={{
                    flex: 1, padding: '10px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px', color: '#f0f0f8',
                    fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  ⬇ Download WAV
                </button>
              </div>
            </div>
          )}
        </div>

        {/* --- RIGHT COLUMN --- */}
        <div style={{ width: '300px', flexShrink: 0 }}>
          
          {/* Voice Picker Card */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '24px' }}>
            
            {/* 1. Selected Voice Section */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '12px' }}>
                SELECTED VOICE
              </div>
              {selectedVoice ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '4px 0' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: dotColor(selectedVoice.name), flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#000', fontSize: '14px' }}>
                    {selectedVoice.name[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {selectedVoice.name}
                    </div>
                    <Link href="/dashboard/library" style={{ fontSize: '11px', color: '#f5c518', textDecoration: 'none', fontWeight: 600 }}>
                      Change Voice →
                    </Link>
                  </div>
                </div>
              ) : (
                <Link href="/dashboard/library" style={{ display: 'block', padding: '12px', border: '1px dashed var(--border)', borderRadius: '12px', textAlign: 'center', textDecoration: 'none' }}>
                  <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Select a voice</span>
                </Link>
              )}
            </div>

            {/* 2. Saved Voices list */}
            {savedVoices.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '12px' }}>
                  SAVED VOICES
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '160px', overflowY: 'auto' }}>
                  {savedVoices.map(v => (
                    <div 
                      key={v.id} 
                      onClick={() => handleSelectSavedVoice(v)}
                      style={{ 
                        display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', 
                        borderRadius: '10px', cursor: 'pointer',
                        background: selectedVoice?.id === v.voice_id ? 'rgba(245,197,24,0.1)' : 'transparent',
                        border: selectedVoice?.id === v.voice_id ? '1px solid rgba(245,197,24,0.2)' : '1px solid transparent'
                      }}
                    >
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: dotColor(v.name) }} />
                      <span style={{ fontSize: '13px', color: selectedVoice?.id === v.voice_id ? '#f5c518' : 'var(--muted)', fontWeight: 500 }}>{v.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FIX 3: Language Section */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '8px' }}>
                LANGUAGE
              </div>
              <select
                value={language}
                onChange={e => {
                  setLanguage(e.target.value)
                  // IMPORTANT: Only update language, do NOT add voices
                  if (selectedVoice && selectedVoice.language !== e.target.value) {
                    setSelectedVoice(null)
                  }
                }}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  background: 'var(--glass)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  color: 'var(--text)',
                  fontSize: '13px',
                  outline: 'none',
                }}
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
                <option value="pl">🇵🇱 Polish</option>
                <option value="it">🇮🇹 Italian</option>
                <option value="pt">🇵🇹 Portuguese</option>
                <option value="nl">🇳🇱 Dutch</option>
                <option value="el">🇬🇷 Greek</option>
                <option value="ms">🇲🇾 Malay</option>
                <option value="no">🇳🇴 Norwegian</option>
                <option value="fi">🇫🇮 Finnish</option>
                <option value="da">🇩🇰 Danish</option>
                <option value="sv">🇸🇪 Swedish</option>
              </select>
            </div>

            {/* Speed slider */}
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

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={generating || !text.trim()}
              style={{
                width: '100%', padding: '14px', borderRadius: '14px',
                background: generating || !text.trim() ? 'var(--secondary)' : '#f5c518',
                color: generating || !text.trim() ? 'var(--muted-foreground)' : '#000',
                border: 'none', fontSize: '15px', fontWeight: 800, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: generating || !text.trim() ? 'none' : '0 10px 20px rgba(245,197,24,0.15)',
                transition: 'all 0.2s',
              }}
            >
              <Zap size={16} fill="currentColor" />
              {generating ? 'Generating...' : 'Generate Audio'}
            </button>

            {/* Credits Info */}
            <div style={{ marginTop: '20px', padding: '12px', background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Credits Usage</div>
              <div style={{ fontSize: '12px', color: 'var(--text)', fontWeight: 600 }}>
                {creditsUsed.toLocaleString()} / {creditsLimit.toLocaleString()} used
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }
        textarea::placeholder { color: var(--muted); }
        select option { background: var(--bg); color: var(--text); }
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
