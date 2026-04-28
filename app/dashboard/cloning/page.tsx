'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import toast, { Toaster } from 'react-hot-toast';
import { Mic, Play, Pause, Check, Shuffle, RefreshCw, X } from 'lucide-react';

const ACCENT = '#E8522A';

function fmtTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const PLAN_LIMITS: Record<string, number> = {
  free: 1, starter: 3, creator: 5, pro: 10, studio: 20,
};

const SAMPLE_TEXTS = [
  "He smiled, remembering the comfort of his grandmother's words, a simple truth that stayed with him through every long, quiet journey.",
  "The city never sleeps. Lights flicker, voices echo, and somewhere beneath it all, a story is waiting to be told.",
  "She took a deep breath, closed her eyes, and stepped forward — into the unknown — and it was exactly where she needed to be.",
];

const LABEL_OPTS = ['Joyful', 'Calm', 'Energetic', 'Serious', 'Podcast', 'Gaming & Fiction', 'Narration', 'Corporate', 'Warm'];
const GENDER_OPTS = ['Male', 'Female', 'Neutral'];
const AGE_OPTS = ['Young Adult', 'Middle Aged', 'Senior'];
const LANG_OPTS = ['English', 'Arabic', 'Hindi', 'Spanish', 'French', 'German', 'Japanese', 'Korean', 'Portuguese', 'Turkish'];

// ── Step Indicator ────────────────────────────────────────────────────────────
function StepBar({ step }: { step: 1 | 2 | 3 }) {
  const items = [
    { n: 1 as const, label: 'Add Voice' },
    { n: 2 as const, label: 'Preview' },
    { n: 3 as const, label: 'Save' },
  ];
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '48px' }}>
      {items.map((item, i) => (
        <div key={item.n} style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
              background: step === item.n ? ACCENT : 'transparent',
              border: `1.5px solid ${step === item.n ? ACCENT : 'var(--border)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', fontWeight: 700,
              color: step === item.n ? '#fff' : 'var(--muted)',
              transition: 'all 0.25s',
            }}>
              {item.n}
            </div>
            <span style={{
              fontSize: '14px',
              fontWeight: step === item.n ? 700 : 400,
              color: step === item.n ? 'var(--text)' : 'var(--muted)',
              transition: 'all 0.25s',
            }}>
              {item.label}
            </span>
          </div>
          {i < 2 && (
            <div style={{ width: '64px', height: '1px', background: 'var(--border)', margin: '0 14px' }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Nav Row ───────────────────────────────────────────────────────────────────
function NavRow({
  onBack, onNext, nextLabel = 'Next', nextDisabled = false, loading = false,
}: {
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  loading?: boolean;
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '48px' }}>
      <button
        onClick={onBack}
        style={{
          padding: '13px 40px', borderRadius: '12px',
          background: 'transparent', border: '1px solid var(--border)',
          color: 'var(--text)', fontSize: '14px', fontWeight: 600,
          cursor: onBack ? 'pointer' : 'default',
          opacity: onBack ? 1 : 0, pointerEvents: onBack ? 'auto' : 'none',
          transition: 'all 0.15s',
        }}
      >
        Back
      </button>
      <button
        onClick={onNext}
        disabled={nextDisabled || loading}
        style={{
          padding: '13px 52px', borderRadius: '12px',
          background: nextDisabled ? 'var(--surface)' : '#111118',
          color: nextDisabled ? 'var(--muted)' : '#fff',
          fontSize: '14px', fontWeight: 700,
          border: `1px solid ${nextDisabled ? 'var(--border)' : 'transparent'}`,
          cursor: nextDisabled ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', gap: '8px',
          transition: 'all 0.2s',
        }}
      >
        {loading && (
          <div style={{
            width: '14px', height: '14px',
            border: '2px solid rgba(255,255,255,0.3)',
            borderTop: '2px solid #fff',
            borderRadius: '50%', animation: 'spin 0.65s linear infinite',
          }} />
        )}
        {nextLabel}
      </button>
    </div>
  );
}

// ── File Icon SVG ─────────────────────────────────────────────────────────────
function FileImageIcon() {
  return (
    <svg width="28" height="32" viewBox="0 0 28 32" fill="none">
      <rect x="0.5" y="0.5" width="27" height="31" rx="5.5" fill="var(--card-bg)" stroke="var(--border)" />
      <path d="M4 22L8 17L11 20L15 15L20 22H4Z" fill="var(--border)" />
      <circle cx="9" cy="12" r="2.5" fill="var(--border)" />
    </svg>
  );
}

function FileAudioIcon() {
  return (
    <svg width="28" height="32" viewBox="0 0 28 32" fill="none">
      <rect x="0.5" y="0.5" width="27" height="31" rx="5.5" fill="var(--card-bg)" stroke="var(--border)" />
      <rect x="5" y="14" width="3" height="8" rx="1.5" fill="var(--border)" />
      <rect x="10" y="11" width="3" height="14" rx="1.5" fill="var(--border)" />
      <rect x="15" y="13" width="3" height="10" rx="1.5" fill="var(--border)" />
      <rect x="20" y="15" width="3" height="6" rx="1.5" fill="var(--border)" />
    </svg>
  );
}

// ── Select dropdown ───────────────────────────────────────────────────────────
function StyledSelect({ value, opts, onChange }: { value: string; opts: string[]; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        padding: '8px 32px 8px 14px',
        background: 'var(--card-bg)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        color: 'var(--text)',
        fontSize: '13px', fontWeight: 600,
        cursor: 'pointer', outline: 'none',
        fontFamily: 'Inter, sans-serif',
        appearance: 'none', WebkitAppearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 10px center',
      }}
    >
      {opts.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function VoiceCloningPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [userId, setUserId] = useState<string | null>(null);
  const [userPlan, setUserPlan] = useState('free');
  const [savedCount, setSavedCount] = useState(0);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Audio
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [uploadedName, setUploadedName] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Recording
  const [recording, setRecording] = useState(false);
  const [recSeconds, setRecSeconds] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Preview
  const [sampleIdx, setSampleIdx] = useState(0);

  // Save fields
  const [voiceName, setVoiceName] = useState('');
  const [language, setLanguage] = useState('English');
  const [gender, setGender] = useState('Male');
  const [age, setAge] = useState('Middle Aged');
  const [labels, setLabels] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [consent, setConsent] = useState(false);

  // Clone state
  const [cloning, setCloning] = useState(false);
  const [cloneSuccess, setCloneSuccess] = useState(false);
  const [cloneError, setCloneError] = useState('');
  const [clonedSavedVoiceId, setClonedSavedVoiceId] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function init() {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) { router.push('/login'); return; }
      setUserId(user.id);
      const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single();
      if (profile?.plan) setUserPlan(profile.plan);
      const { data: saved } = await supabase.from('saved_voices').select('id').eq('user_id', user.id);
      setSavedCount((saved || []).length);
    }
    init();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      audioRef.current?.pause();
    };
  }, [router, supabase]);

  // Re-init audio element when URL changes
  useEffect(() => {
    if (!recordedUrl) return;
    const audio = new Audio(recordedUrl);
    audioRef.current = audio;
    audio.onloadedmetadata = () => setDuration(audio.duration);
    audio.ontimeupdate = () => setCurrentTime(audio.currentTime);
    audio.onended = () => { setIsPlaying(false); setCurrentTime(0); };
    return () => { audio.pause(); };
  }, [recordedUrl]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const seekTo = (pct: number) => {
    if (!audioRef.current || !duration) return;
    audioRef.current.currentTime = pct * duration;
  };

  const handleFileInput = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setRecordedBlob(file);
    setRecordedUrl(url);
    setUploadedName(file.name);
    setCurrentTime(0); setDuration(0); setIsPlaying(false);
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedBlob(blob); setRecordedUrl(url); setUploadedName(null);
        stream.getTracks().forEach(t => t.stop());
      };
      mr.start();
      setRecording(true); setRecSeconds(0);
      timerRef.current = setInterval(() => setRecSeconds(s => s + 1), 1000);
    } catch {
      toast.error('Microphone access denied. Check browser permissions.');
    }
  }, []);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  const resetAudio = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false); setCurrentTime(0); setDuration(0);
    setRecordedBlob(null);
    setRecordedUrl(prev => { if (prev) URL.revokeObjectURL(prev); return null; });
    setUploadedName(null); setRecSeconds(0);
  }, []);

  const handleSave = async () => {
    if (!voiceName.trim()) { toast.error('Enter a voice name.'); return; }
    if (!consent) { toast.error('Please accept the terms to continue.'); return; }
    if (!recordedBlob || !userId) return;

    const limit = PLAN_LIMITS[userPlan] ?? 1;
    if (savedCount >= limit) {
      setCloneError(`Voice limit reached! Your ${userPlan} plan allows ${limit} voice${limit > 1 ? 's' : ''}. Delete one or upgrade.`);
      return;
    }

    setCloning(true); setCloneError('');
    try {
      const formData = new FormData();
      formData.append('audio', recordedBlob);
      const res = await fetch('/api/upload-voice', { method: 'POST', body: formData });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || 'Upload failed'); }
      const { url: r2Url } = await res.json();

      const { data: cloned, error: ce } = await supabase
        .from('cloned_voices')
        .insert({ user_id: userId, name: voiceName, sample_url: r2Url, status: 'ready' })
        .select('id').single();
      if (ce) throw ce;

      const { data: savedVoice } = await supabase.from('saved_voices').upsert({
        user_id: userId,
        voice_id: cloned?.id || crypto.randomUUID(),
        name: voiceName, voice_name: voiceName,
        language: language.toLowerCase().slice(0, 2),
        gender: gender.toLowerCase(),
        source: 'cloned', r2_url: r2Url,
      }, { onConflict: 'user_id,voice_id' }).select('id').single();

      if (savedVoice?.id) setClonedSavedVoiceId(savedVoice.id);
      setCloneSuccess(true);
    } catch (err: any) {
      setCloneError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setCloning(false);
    }
  };

  const voiceLimit = PLAN_LIMITS[userPlan] ?? 1;
  const isAtLimit = savedCount >= voiceLimit;
  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  // ── Success screen ─────────────────────────────────────────────────────────
  if (cloneSuccess) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ textAlign: 'center', maxWidth: '400px', padding: '0 20px' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'rgba(232,82,42,0.1)', border: '2px solid rgba(232,82,42,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 28px', animation: 'pop-in 0.4s cubic-bezier(0.175,0.885,0.32,1.275)',
          }}>
            <Check size={34} color={ACCENT} strokeWidth={2.5} />
          </div>
          <h2 style={{ margin: '0 0 10px', fontSize: '26px', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>
            Voice Saved!
          </h2>
          <p style={{ margin: '0 0 32px', fontSize: '14px', color: 'var(--muted)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--text)' }}>"{voiceName}"</strong> has been added to your Saved Voices.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'stretch', width: '100%' }}>
            {clonedSavedVoiceId && (
              <a
                href={`/dashboard/tts?voiceId=${clonedSavedVoiceId}&voiceType=cloned`}
                style={{
                  padding: '13px 24px', borderRadius: '10px',
                  background: ACCENT, color: '#fff',
                  fontWeight: 700, fontSize: '14px', textDecoration: 'none',
                  textAlign: 'center', display: 'block',
                }}
              >
                Generate Audio with this Voice →
              </a>
            )}
            <div style={{ display: 'flex', gap: '10px' }}>
              <a href="/dashboard/saved" style={{
                flex: 1, padding: '12px 16px', borderRadius: '10px',
                background: 'transparent', border: '1px solid var(--border)',
                color: 'var(--muted)', fontWeight: 600, fontSize: '14px',
                textDecoration: 'none', textAlign: 'center', display: 'block',
              }}>
                Saved Voices
              </a>
              <button
                onClick={() => {
                  setCloneSuccess(false); setVoiceName(''); resetAudio();
                  setLabels([]); setDescription(''); setConsent(false);
                  setClonedSavedVoiceId(null); setStep(1);
                }}
                style={{
                  flex: 1, padding: '12px 16px', borderRadius: '10px',
                  background: 'transparent', border: '1px solid var(--border)',
                  color: 'var(--muted)', fontWeight: 600, fontSize: '14px', cursor: 'pointer',
                }}
              >
                Clone Another
              </button>
            </div>
          </div>
        </div>
        <style>{`
          @keyframes pop-in { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  // ── Main ───────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: 'Inter, sans-serif', width: '100%', maxWidth: '880px', margin: '0 auto', paddingBottom: '40px' }}>
      <Toaster position="top-right" toastOptions={{
        style: { background: 'var(--card-bg)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '13px' },
      }} />

      <StepBar step={step} />

      {/* ══════════════════════════════════════════════════════════════════════
          STEP 1 — Add Voice
      ══════════════════════════════════════════════════════════════════════ */}
      {step === 1 && (
        <div>
          {isAtLimit && (
            <div style={{
              marginBottom: '20px', padding: '12px 18px',
              background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '10px', display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', gap: '10px',
            }}>
              <span style={{ fontSize: '13px', color: '#f87171' }}>
                Voice limit reached ({savedCount}/{voiceLimit}) — upgrade your plan
              </span>
              <a href="/dashboard/billing" style={{ fontSize: '12px', fontWeight: 700, color: ACCENT, textDecoration: 'none' }}>
                Upgrade →
              </a>
            </div>
          )}

          {!recordedBlob ? (
            /* ── Upload / Record panels ── */
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 64px 1fr', alignItems: 'center' }}>

              {/* Upload panel */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={e => {
                  e.preventDefault(); setIsDragging(false);
                  const f = e.dataTransfer.files[0];
                  if (f) handleFileInput(f);
                }}
                className="clone-panel"
                style={{
                  border: `1.5px dashed ${isDragging ? ACCENT : 'var(--border)'}`,
                  borderRadius: '20px', padding: '60px 32px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', gap: '22px', textAlign: 'center',
                  cursor: 'pointer', minHeight: '340px',
                  background: isDragging ? 'rgba(232,82,42,0.02)' : 'transparent',
                  transition: 'all 0.2s',
                }}
              >
                {/* Two overlapping file icons + upload badge */}
                <div style={{ display: 'flex', alignItems: 'flex-end', position: 'relative', height: '68px' }}>
                  <div style={{ transform: 'rotate(-6deg)', marginRight: '-4px', zIndex: 1 }}>
                    <FileImageIcon />
                  </div>
                  <div style={{
                    position: 'absolute', left: '50%', bottom: '-10px',
                    transform: 'translateX(-50%)', zIndex: 3,
                    width: '24px', height: '24px', borderRadius: '50%',
                    background: ACCENT, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', boxShadow: '0 2px 8px rgba(232,82,42,0.45)',
                  }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                      <path d="M12 19V5M5 12l7-7 7 7" />
                    </svg>
                  </div>
                  <div style={{ transform: 'rotate(5deg)', marginLeft: '-4px', zIndex: 2 }}>
                    <FileAudioIcon />
                  </div>
                </div>

                <div style={{ marginTop: '8px' }}>
                  <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', margin: '0 0 7px' }}>
                    Click to Upload or drag to drop
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--muted)', margin: 0 }}>
                    Single speaker only
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
                  {['.MP3', '.MP4', '.WAV', '.MOV'].map(f => (
                    <span key={f} style={{
                      padding: '3px 10px', border: '1px solid var(--border)',
                      borderRadius: '6px', fontSize: '11px', color: 'var(--muted)', fontWeight: 600,
                    }}>
                      {f}
                    </span>
                  ))}
                  <span style={{ fontSize: '11px', color: 'var(--muted)' }}>and more &lt;10MB</span>
                </div>
              </div>

              {/* OR divider */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600, letterSpacing: '0.04em' }}>OR</span>
              </div>

              {/* Record panel */}
              <div
                onClick={recording ? stopRecording : startRecording}
                className="clone-panel"
                style={{
                  border: `1.5px dashed ${recording ? 'rgba(239,68,68,0.45)' : 'var(--border)'}`,
                  borderRadius: '20px', padding: '60px 32px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', gap: '22px', textAlign: 'center',
                  cursor: 'pointer', minHeight: '340px',
                  background: recording ? 'rgba(239,68,68,0.02)' : 'transparent',
                  transition: 'all 0.2s',
                }}
              >
                {/* Mic icon box with green + badge */}
                <div style={{ position: 'relative', display: 'inline-flex' }}>
                  <div style={{
                    width: '84px', height: '84px', borderRadius: '20px',
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    animation: recording ? 'pulse-rec 1.4s ease-in-out infinite' : 'none',
                    transition: 'border-color 0.2s',
                  }}>
                    <Mic size={38} color={recording ? '#EF4444' : 'var(--text)'} strokeWidth={1.4} />
                  </div>
                  <div style={{
                    position: 'absolute', bottom: '-5px', right: '-5px',
                    width: '24px', height: '24px', borderRadius: '50%',
                    background: '#22C55E', border: '2px solid var(--bg)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: '16px', fontWeight: 800, lineHeight: 1,
                  }}>
                    +
                  </div>
                </div>

                <div>
                  <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', margin: '0 0 7px' }}>
                    {recording ? `Recording — ${fmtTime(recSeconds)}` : 'Record Audio'}
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--muted)', margin: 0 }}>
                    Single speaker only
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* ── Audio player (after upload / record) ── */
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: '20px', padding: '36px 40px',
              position: 'relative', maxWidth: '680px', margin: '0 auto',
            }}>
              {/* Remove / re-record */}
              <button
                onClick={resetAudio}
                style={{
                  position: 'absolute', top: '16px', right: '16px',
                  width: '30px', height: '30px', borderRadius: '50%',
                  background: 'transparent', border: '1px solid var(--border)',
                  color: 'var(--muted)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                <X size={14} />
              </button>

              {/* Filename */}
              <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '0 0 48px', paddingRight: '40px' }}>
                {uploadedName
                  ? uploadedName.length > 50 ? uploadedName.slice(0, 50) + '…' : uploadedName
                  : 'Recorded audio'
                }
              </p>

              {/* Play button */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '48px' }}>
                <button
                  onClick={togglePlay}
                  style={{
                    width: '60px', height: '60px', borderRadius: '50%',
                    background: 'var(--text)', border: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'transform 0.15s, opacity 0.15s',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                  }}
                >
                  {isPlaying
                    ? <Pause size={22} color="var(--bg)" fill="var(--bg)" />
                    : <Play size={22} color="var(--bg)" fill="var(--bg)" style={{ marginLeft: '3px' }} />
                  }
                </button>
              </div>

              {/* Progress bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '12px', color: 'var(--muted)', fontVariantNumeric: 'tabular-nums', minWidth: '38px' }}>
                  {fmtTime(currentTime)}
                </span>
                <div
                  style={{
                    flex: 1, height: '3px', background: 'var(--border)',
                    borderRadius: '99px', cursor: 'pointer', position: 'relative',
                  }}
                  onClick={e => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    seekTo((e.clientX - rect.left) / rect.width);
                  }}
                >
                  <div style={{
                    height: '100%', background: 'var(--text)', borderRadius: '99px',
                    width: `${progressPct}%`, transition: 'width 0.1s linear',
                    position: 'relative',
                  }}>
                    <div style={{
                      position: 'absolute', right: '-5px', top: '50%',
                      transform: 'translateY(-50%)',
                      width: '10px', height: '10px', borderRadius: '50%',
                      background: 'var(--text)',
                      opacity: progressPct > 0 ? 1 : 0,
                    }} />
                  </div>
                </div>
                <span style={{ fontSize: '12px', color: 'var(--muted)', fontVariantNumeric: 'tabular-nums', minWidth: '38px', textAlign: 'right' }}>
                  {fmtTime(duration)}
                </span>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".mp3,.mp4,.wav,.mov,.m4a,.ogg,audio/*"
            style={{ display: 'none' }}
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFileInput(f); }}
          />

          <NavRow
            onNext={() => setStep(2)}
            nextDisabled={!recordedBlob}
          />
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          STEP 2 — Preview
      ══════════════════════════════════════════════════════════════════════ */}
      {step === 2 && (
        <div style={{ maxWidth: '660px', margin: '0 auto' }}>
          <h2 style={{
            textAlign: 'center', fontSize: '20px', fontWeight: 700,
            color: 'var(--text)', margin: '0 0 36px', letterSpacing: '-0.01em',
          }}>
            Voice is ready, You can listen to a preview
          </h2>

          <div style={{
            background: 'var(--card-bg)', border: '1px solid var(--border)',
            borderRadius: '20px', padding: '32px 36px',
          }}>
            {/* Sample text */}
            <p style={{
              fontSize: '15px', color: ACCENT, lineHeight: 1.8,
              margin: '0 0 28px', fontWeight: 400,
            }}>
              {SAMPLE_TEXTS[sampleIdx]}
            </p>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={() => {
                  if (isPlaying) { audioRef.current?.pause(); setIsPlaying(false); }
                  setSampleIdx(i => (i + 1) % SAMPLE_TEXTS.length);
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 18px', background: 'var(--surface)',
                  border: '1px solid var(--border)', borderRadius: '10px',
                  fontSize: '13px', fontWeight: 600, color: 'var(--text)',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                <Shuffle size={14} /> Try another text
              </button>

              <button
                onClick={togglePlay}
                style={{
                  padding: '10px 36px', borderRadius: '10px',
                  background: isPlaying
                    ? 'rgba(232,82,42,0.12)'
                    : 'linear-gradient(135deg, rgba(232,82,42,0.85), rgba(232,82,42,0.45))',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(232,82,42,0.3)',
                  color: isPlaying ? ACCENT : '#fff',
                  fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                  boxShadow: isPlaying ? 'none' : '0 4px 16px rgba(232,82,42,0.25)',
                  transition: 'all 0.2s',
                }}
              >
                {isPlaying ? 'Pause' : 'Listen'}
              </button>
            </div>
          </div>

          <NavRow
            onBack={() => { if (isPlaying) { audioRef.current?.pause(); setIsPlaying(false); } setStep(1); }}
            onNext={() => { if (isPlaying) { audioRef.current?.pause(); setIsPlaying(false); } setStep(3); }}
          />
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          STEP 3 — Save
      ══════════════════════════════════════════════════════════════════════ */}
      {step === 3 && (
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>

          {/* Avatar + Name */}
          <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', marginBottom: '28px' }}>
            {/* Gradient avatar */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: '90px', height: '90px', borderRadius: '20px',
                background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                border: '1px solid var(--border)',
              }} />
              <button
                onClick={() => {}}
                title="Refresh avatar"
                style={{
                  position: 'absolute', bottom: '-8px', right: '-8px',
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: 'var(--card-bg)', border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'var(--muted)', transition: 'all 0.15s',
                }}
              >
                <RefreshCw size={13} />
              </button>
            </div>

            {/* Name field */}
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>
                Name <span style={{ color: ACCENT }}>*</span>
              </label>
              <input
                value={voiceName}
                onChange={e => setVoiceName(e.target.value)}
                placeholder="e.g. The Narrator (Johnny)"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '12px 16px',
                  background: 'var(--card-bg)', border: '1px solid var(--border)',
                  borderRadius: '12px', color: 'var(--text)', fontSize: '14px',
                  outline: 'none', fontFamily: 'Inter, sans-serif',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => (e.target.style.borderColor = ACCENT)}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>
          </div>

          {/* Voice Details */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '10px' }}>
              Voice Details
            </label>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <StyledSelect value={language} opts={LANG_OPTS} onChange={setLanguage} />
              <StyledSelect value={gender} opts={GENDER_OPTS} onChange={setGender} />
              <StyledSelect value={age} opts={AGE_OPTS} onChange={setAge} />
            </div>
          </div>

          {/* Labels */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '10px' }}>
              Label{' '}
              <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 400 }}>(Optional)</span>
            </label>
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: '6px',
              padding: '12px 14px', background: 'var(--card-bg)',
              border: '1px solid var(--border)', borderRadius: '12px',
              minHeight: '52px', alignItems: 'center',
            }}>
              {/* Selected labels */}
              {labels.map(l => (
                <span key={l} style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  padding: '5px 12px', background: 'var(--surface)',
                  border: '1px solid var(--border)', borderRadius: '8px',
                  fontSize: '12px', fontWeight: 600, color: 'var(--text)',
                }}>
                  {l}
                  <button
                    onClick={() => setLabels(prev => prev.filter(x => x !== l))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 0, display: 'flex', alignItems: 'center', lineHeight: 1 }}
                  >
                    <X size={11} />
                  </button>
                </span>
              ))}
              {/* Suggested labels to add */}
              {LABEL_OPTS.filter(l => !labels.includes(l)).slice(0, 6).map(l => (
                <button
                  key={l}
                  onClick={() => setLabels(prev => [...prev, l])}
                  style={{
                    padding: '5px 12px', background: 'transparent',
                    border: '1px dashed var(--border)', borderRadius: '8px',
                    fontSize: '12px', color: 'var(--muted)', cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif', transition: 'all 0.15s',
                  }}
                  className="label-add-btn"
                >
                  + {l}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '10px' }}>
              Description{' '}
              <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 400 }}>(Optional)</span>
            </label>
            <div style={{ position: 'relative' }}>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value.slice(0, 1000))}
                placeholder="Describe your voice — tone, use-case, style..."
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '14px 16px 32px',
                  background: 'var(--card-bg)', border: '1px solid var(--border)',
                  borderRadius: '12px', color: 'var(--text)', fontSize: '14px',
                  outline: 'none', resize: 'vertical', minHeight: '110px',
                  lineHeight: 1.6, fontFamily: 'Inter, sans-serif',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => (e.target.style.borderColor = ACCENT)}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
              />
              <span style={{
                position: 'absolute', bottom: '10px', right: '14px',
                fontSize: '11px', color: 'var(--muted)', pointerEvents: 'none',
              }}>
                {description.length} / 1000
              </span>
            </div>
          </div>

          {/* Consent checkbox */}
          <label style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', cursor: 'pointer', marginBottom: '24px' }}>
            <input
              type="checkbox"
              checked={consent}
              onChange={e => setConsent(e.target.checked)}
              style={{
                marginTop: '3px', width: '15px', height: '15px',
                accentColor: ACCENT, cursor: 'pointer', flexShrink: 0,
              }}
            />
            <span style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.65 }}>
              I confirm that I have all necessary rights and permissions to upload and clone these voice samples,
              and I will not use the platform's generated content for any illegal, fraudulent, or harmful purposes.
              I agree to comply with FlashTTS's Prohibited Content and Uses Policy,{' '}
              <a href="/terms" style={{ color: ACCENT, textDecoration: 'none' }}>Terms of Service</a>,{' '}
              <a href="/privacy-policy" style={{ color: ACCENT, textDecoration: 'none' }}>Privacy Policy</a>
            </span>
          </label>

          {/* Error */}
          {cloneError && (
            <div style={{
              padding: '12px 16px', borderRadius: '10px',
              background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)',
              color: '#f87171', fontSize: '13px', marginBottom: '16px',
            }}>
              ⚠ {cloneError}
            </div>
          )}

          <NavRow
            onBack={() => setStep(2)}
            onNext={handleSave}
            nextLabel="Save"
            nextDisabled={!voiceName.trim() || !consent}
            loading={cloning}
          />
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse-rec {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.3); }
          50%       { box-shadow: 0 0 0 14px rgba(239,68,68,0); }
        }
        .clone-panel:hover {
          border-color: var(--muted) !important;
        }
        .label-add-btn:hover {
          border-color: var(--muted) !important;
          color: var(--text) !important;
        }
        input::placeholder, textarea::placeholder { color: var(--muted); opacity: 0.6; }
        select option { background: var(--card-bg); color: var(--text); }
      `}</style>
    </div>
  );
}
