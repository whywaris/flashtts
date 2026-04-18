'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import {
  Mic,
  Square,
  Play,
  Pause,
  RotateCcw,
  Upload,
  Check,
  Zap,
  Volume2,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function WaveformBars({ active, color = '#f5c518' }: { active: boolean; color?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '32px' }}>
      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
        <div
          key={i}
          style={{
            width: '3px',
            borderRadius: '2px',
            background: color,
            height: active ? '20px' : '6px',
            transition: 'height 0.15s ease',
            animation: active ? `wave-bar ${0.4 + i * 0.07}s ease-in-out infinite alternate` : 'none',
            opacity: active ? 1 : 0.3,
          }}
        />
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function VoiceCloningPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

  // Form state
  const [voiceName, setVoiceName] = useState('');
  const [nameError, setNameError] = useState('');

  // Recording state
  const [recording, setRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [recSeconds, setRecSeconds] = useState(0);
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const [uploadedName, setUploadedName] = useState<string | null>(null);

  // Clone state
  const [cloning, setCloning] = useState(false);
  const [cloneSuccess, setCloneSuccess] = useState(false);
  const [cloneError, setCloneError] = useState('');

  // Plan limit state
  const [userPlan, setUserPlan] = useState<string>('free');
  const [savedCount, setSavedCount] = useState<number>(0);
  const PLAN_VOICE_LIMITS: Record<string, number> = {
    free: 1, starter: 3, creator: 5, pro: 10, studio: 20,
  };

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function init() {
      const supabase = createClient();
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) { router.push('/login'); return; }
      setUserId(user.id);

      // Fetch plan + saved count for limit check
      const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single();
      if (profile?.plan) setUserPlan(profile.plan);

      const { data: saved } = await supabase.from('saved_voices').select('id').eq('user_id', user.id);
      setSavedCount((saved || []).length);
    }
    init();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      previewAudioRef.current?.pause();
    };
  }, [router]);

  // ── Recording ──────────────────────────────────────────────────────────────
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;

      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedBlob(blob);
        setRecordedUrl(url);
        // ✅ BUG FIX: Create audio element immediately after recording stops
        previewAudioRef.current = new Audio(url);
        previewAudioRef.current.onended = () => setPreviewPlaying(false);
        stream.getTracks().forEach((t) => t.stop());
      };

      mr.start();
      setRecording(true);
      setRecSeconds(0);
      timerRef.current = setInterval(() => setRecSeconds((s) => s + 1), 1000);
    } catch {
      alert('Could not access microphone. Please check permissions.');
    }
  }, []);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  const reRecord = useCallback(() => {
    previewAudioRef.current?.pause();
    previewAudioRef.current = null;
    setPreviewPlaying(false);
    setRecordedBlob(null);
    setRecordedUrl(null);
    setUploadedName(null);
    setRecSeconds(0);
  }, []);

  // ✅ BUG FIX: togglePreview properly creates + plays audio
  const togglePreview = useCallback(() => {
    if (!recordedUrl) return;

    if (!previewAudioRef.current) {
      previewAudioRef.current = new Audio(recordedUrl);
      previewAudioRef.current.onended = () => setPreviewPlaying(false);
    }

    if (previewPlaying) {
      previewAudioRef.current.pause();
      setPreviewPlaying(false);
    } else {
      previewAudioRef.current.play().catch(() => {
        // If audio element is stale, recreate it
        previewAudioRef.current = new Audio(recordedUrl);
        previewAudioRef.current.onended = () => setPreviewPlaying(false);
        previewAudioRef.current.play();
      });
      setPreviewPlaying(true);
    }
  }, [recordedUrl, previewPlaying]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setRecordedBlob(file);
    setRecordedUrl(url);
    setUploadedName(file.name);
    // ✅ BUG FIX: Always create fresh audio element on file upload
    previewAudioRef.current = new Audio(url);
    previewAudioRef.current.onended = () => setPreviewPlaying(false);
  };

  const handleClone = async () => {
    if (!voiceName.trim()) { setNameError('Please enter a name for your voice.'); return; }
    if (!recordedBlob) { setCloneError('Please record or upload audio first.'); return; }
    // ✅ Plan limit check
    const voiceLimit = PLAN_VOICE_LIMITS[userPlan] ?? 1;
    if (savedCount >= voiceLimit) {
      setCloneError(`Voice limit reached! Your ${userPlan} plan allows ${voiceLimit} saved voice${voiceLimit > 1 ? "s" : ""}. Delete a voice or upgrade to clone more.`);
      return;
    }
    if (!userId) return;

    setCloning(true);
    setCloneError('');

    try {
      // Upload audio to R2 first
      const formData = new FormData();
      formData.append('audio', recordedBlob);
      const uploadRes = await fetch('/api/upload-voice', { method: 'POST', body: formData });
      if (!uploadRes.ok) {
        const err = await uploadRes.json().catch(() => ({}));
        throw new Error(err.error || 'Audio upload failed');
      }
      const { url: r2Url } = await uploadRes.json();

      const supabase = createClient();

      const { data: clonedData, error: cloneErr } = await supabase
        .from('cloned_voices')
        .insert({ user_id: userId, name: voiceName, sample_url: r2Url, status: 'ready' })
        .select('id')
        .single();

      if (cloneErr) throw cloneErr;

      await supabase.from('saved_voices').upsert({
        user_id: userId,
        voice_id: clonedData?.id || crypto.randomUUID(),
        name: voiceName,
        voice_name: voiceName,
        language: null,
        gender: null,
        source: 'cloned',
        r2_url: r2Url,
      }, { onConflict: 'user_id,voice_id' });

      setCloneSuccess(true);
    } catch (err: any) {
      setCloneError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setCloning(false);
    }
  };

  // ── Quality scoring ────────────────────────────────────────────────────────
  const quality = recSeconds >= 30 ? 'Excellent' : recSeconds >= 10 ? 'Good' : recSeconds > 0 ? 'Too Short' : '—';
  const qualityColor = quality === 'Excellent' ? '#22d3a5' : quality === 'Good' ? '#f5c518' : quality === 'Too Short' ? '#ef4444' : 'var(--muted)';
  const qualityPct = Math.min(100, (recSeconds / 60) * 100);

  const voiceLimit = PLAN_VOICE_LIMITS[userPlan] ?? 1;
  const isAtLimit = savedCount >= voiceLimit;
  const canClone = !!recordedBlob && !!voiceName.trim() && !isAtLimit;

  // ── Success screen ─────────────────────────────────────────────────────────
  if (cloneSuccess) {
    return (
      <div style={{ fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', width: '100%' }}>
        <div style={{ textAlign: 'center', width: '100%', maxWidth: '420px', padding: '0 20px' }}>
          {/* Animated checkmark */}
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'rgba(34,211,165,0.1)', border: '2px solid rgba(34,211,165,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px', animation: 'pop-in 0.4s cubic-bezier(0.175,0.885,0.32,1.275)',
          }}>
            <Check size={36} color="#22d3a5" strokeWidth={2.5} />
          </div>

          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '26px', fontWeight: 800, color: 'var(--text)', margin: '0 0 10px', letterSpacing: '-0.02em' }}>
            Voice Saved! 🎉
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', margin: '0 0 8px', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--text)' }}>"{voiceName}"</strong> has been added to your Saved Voices.
          </p>
          <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '0 0 32px', opacity: 0.7 }}>
            You can now use it in the TTS studio anytime.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <a
              href="/dashboard/saved"
              style={{
                padding: '12px 24px', borderRadius: '12px',
                background: '#f5c518', color: '#000',
                fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '14px',
                textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px',
                boxShadow: '0 8px 24px rgba(245,197,24,0.25)',
              }}
            >
              View Saved Voices →
            </a>
            <button
              onClick={() => { setCloneSuccess(false); setVoiceName(''); setRecordedBlob(null); setRecordedUrl(null); setRecSeconds(0); setUploadedName(null); }}
              style={{
                padding: '12px 24px', borderRadius: '12px',
                background: 'var(--glass)', border: '1px solid var(--border)',
                color: 'var(--text)', fontFamily: 'DM Sans, sans-serif',
                fontWeight: 600, fontSize: '14px', cursor: 'pointer',
              }}
            >
              Clone Another
            </button>
          </div>
        </div>
        <style>{`@keyframes pop-in { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
      </div>
    );
  }

  // ── Main UI ────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif', width: '100%' }}>

      {/* ── Page Header ── */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <div style={{
            width: '30px', height: '30px', borderRadius: '8px',
            background: 'rgba(245,197,24,0.12)', border: '1px solid rgba(245,197,24,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Mic size={15} color="#f5c518" />
          </div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '22px', fontWeight: 800, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>
            Voice Cloning
          </h1>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--muted)', margin: 0, paddingLeft: '38px' }}>
          Record or upload your voice — save it forever to your library
        </p>
      </div>

      {/* ── Two Column Layout ── */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">

        {/* ── LEFT — Main Panel ── */}
        <div className="w-full lg:flex-1 min-w-0 flex flex-col gap-3">


          {/* ── Plan Limit Banner ── */}
          {isAtLimit && (
            <div style={{ padding: "12px 16px", background: "rgba(240,91,91,0.06)", border: "1px solid rgba(240,91,91,0.2)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "13px", color: "#f05b5b" }}>⚠️ Voice limit reached ({savedCount}/{voiceLimit}) — delete a voice or upgrade</span>
              <a href="/dashboard/billing" style={{ fontSize: "12px", fontWeight: 700, color: "#f5c518", textDecoration: "none" }}>Upgrade →</a>
            </div>
          )}

          {/* ── Section 1: Voice Name ── */}
          <div style={{
            background: 'var(--card-bg)', border: '1px solid var(--border)',
            borderRadius: '16px', padding: '16px',
          }}>
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '10px' }}>
              01 — Voice Name
            </div>
            <input
              value={voiceName}
              onChange={(e) => { setVoiceName(e.target.value); setNameError(''); }}
              placeholder="e.g. My Podcast Voice"
              style={{
                width: '100%', boxSizing: 'border-box',
                background: 'var(--glass)',
                border: `1.5px solid ${nameError ? 'rgba(239,68,68,0.5)' : voiceName ? 'rgba(245,197,24,0.3)' : 'var(--border)'}`,
                borderRadius: '10px', padding: '10px 14px',
                color: 'var(--text)', fontSize: '14px',
                fontFamily: 'DM Sans, sans-serif', outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'rgba(245,197,24,0.5)')}
              onBlur={(e) => (e.target.style.borderColor = nameError ? 'rgba(239,68,68,0.5)' : voiceName ? 'rgba(245,197,24,0.3)' : 'var(--border)')}
            />
            {nameError && <p style={{ fontSize: '12px', color: '#ef4444', margin: '6px 0 0' }}>{nameError}</p>}
          </div>

          {/* ── Section 2: Record ── */}
          <div style={{
            background: 'var(--card-bg)', border: '1px solid var(--border)',
            borderRadius: '16px', padding: '16px',
          }}>
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '14px' }}>
              02 — Record Your Voice
            </div>

            {!recordedBlob ? (
              /* ── Record UI ── */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

                {/* Big record button */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '20px 0' }}>

                  {/* Timer */}
                  <div style={{
                    fontFamily: 'monospace', fontSize: '38px', fontWeight: 700,
                    color: recording ? '#ef4444' : 'var(--text)',
                    letterSpacing: '0.04em', transition: 'color 0.3s',
                    lineHeight: 1,
                  }}>
                    {fmtTime(recSeconds)}
                  </div>

                  {/* Waveform animation */}
                  <WaveformBars active={recording} color={recording ? '#ef4444' : '#f5c518'} />

                  {/* Record / Stop Button */}
                  <button
                    onClick={recording ? stopRecording : startRecording}
                    style={{
                      width: '64px', height: '64px', borderRadius: '50%',
                      background: recording ? '#ef4444' : 'rgba(239,68,68,0.1)',
                      border: `2px solid ${recording ? '#ef4444' : 'rgba(239,68,68,0.35)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', transition: 'all 0.2s',
                      animation: recording ? 'pulse-rec 1.4s ease-in-out infinite' : 'none',
                      boxShadow: recording ? '0 0 24px rgba(239,68,68,0.35)' : 'none',
                    }}
                  >
                    {recording
                      ? <Square size={22} color="#fff" fill="#fff" />
                      : <Mic size={24} color="#ef4444" strokeWidth={1.8} />}
                  </button>

                  <p style={{ fontSize: '12px', color: 'var(--muted)', margin: 0 }}>
                    {recording ? 'Recording… tap to stop' : 'Tap to start recording'}
                  </p>
                </div>

                {/* OR upload */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                  <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600, opacity: 0.5 }}>OR</span>
                  <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                </div>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    width: '100%', padding: '13px',
                    borderRadius: '12px', background: 'var(--glass)',
                    border: '1px dashed var(--border)', color: 'var(--muted)',
                    fontFamily: 'DM Sans, sans-serif', fontSize: '14px',
                    fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.borderColor = 'rgba(245,197,24,0.4)'; (e.target as HTMLButtonElement).style.color = '#f5c518'; }}
                  onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.borderColor = 'var(--border)'; (e.target as HTMLButtonElement).style.color = 'var(--muted)'; }}
                >
                  <Upload size={15} />
                  Upload Audio File
                </button>
                <input ref={fileInputRef} type="file" accept=".mp3,.wav,.m4a,.ogg,audio/*" style={{ display: 'none' }} onChange={handleFileUpload} />
              </div>
            ) : (
              /* ── Recorded / Uploaded Preview ── */
              <div style={{
                background: 'rgba(34,211,165,0.05)', border: '1px solid rgba(34,211,165,0.2)',
                borderRadius: '12px', padding: '14px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div>
                    <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '13px', color: '#22d3a5', margin: '0 0 2px' }}>
                      {uploadedName ? `📁 ${uploadedName.length > 25 ? uploadedName.slice(0, 25) + '…' : uploadedName}` : '🎙 Recording Ready'}
                    </p>
                    {!uploadedName && (
                      <p style={{ fontSize: '11px', color: 'var(--muted)', margin: 0 }}>
                        Duration: {fmtTime(recSeconds)} · Quality: <span style={{ color: qualityColor, fontWeight: 700 }}>{quality}</span>
                      </p>
                    )}
                  </div>
                  <button
                    onClick={reRecord}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      padding: '5px 10px', borderRadius: '8px',
                      background: 'var(--glass)', border: '1px solid var(--border)',
                      color: 'var(--muted)', fontSize: '11px', fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                    }}
                  >
                    <RotateCcw size={11} /> Re-record
                  </button>
                </div>

                {/* Play button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    onClick={togglePreview}
                    style={{
                      width: '40px', height: '40px', borderRadius: '50%',
                      background: previewPlaying ? 'rgba(245,197,24,0.15)' : '#f5c518',
                      border: previewPlaying ? '2px solid rgba(245,197,24,0.4)' : 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', flexShrink: 0,
                      boxShadow: previewPlaying ? 'none' : '0 4px 12px rgba(245,197,24,0.25)',
                      transition: 'all 0.2s',
                    }}
                  >
                    {previewPlaying
                      ? <Pause size={15} color="#f5c518" fill="#f5c518" />
                      : <Play size={15} color="#000" fill="#000" style={{ marginLeft: '2px' }} />}
                  </button>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <WaveformBars active={previewPlaying} color="#22d3a5" />
                    <span style={{ fontSize: '11px', color: 'var(--muted)', marginLeft: '4px' }}>
                      {previewPlaying ? 'Playing…' : 'Tap to listen'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Error ── */}
          {cloneError && (
            <div style={{
              padding: '12px 16px', borderRadius: '12px',
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
              color: '#ef4444', fontSize: '13px',
            }}>
              ⚠️ {cloneError}
            </div>
          )}

          {/* ── Clone Button ── */}
          <button
            onClick={handleClone}
            disabled={cloning || !canClone}
            style={{
              width: '100%', padding: '13px',
              borderRadius: '12px',
              background: cloning || !canClone ? 'var(--glass)' : '#f5c518',
              border: cloning || !canClone ? '1px solid var(--border)' : 'none',
              color: cloning || !canClone ? 'var(--muted)' : '#000',
              fontFamily: 'Syne, sans-serif', fontSize: '14px', fontWeight: 800,
              cursor: cloning || !canClone ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              boxShadow: cloning || !canClone ? 'none' : '0 8px 24px rgba(245,197,24,0.2)',
              transition: 'all 0.2s', letterSpacing: '-0.01em',
            }}
          >
            {cloning ? (
              <>
                <div style={{
                  width: '18px', height: '18px',
                  border: '2.5px solid rgba(0,0,0,0.15)', borderTop: '2.5px solid #000',
                  borderRadius: '50%', animation: 'spin 0.7s linear infinite',
                }} />
                Saving Voice…
              </>
            ) : (
              <>
                <Zap size={18} fill="currentColor" />
                Save Voice to Library
              </>
            )}
          </button>

          {!canClone && (
            <p style={{ fontSize: '12px', color: 'var(--muted)', textAlign: 'center', margin: '-8px 0 0', opacity: 0.6 }}>
              {!voiceName.trim() && !recordedBlob ? 'Enter a name and record audio to continue' :
                !voiceName.trim() ? 'Enter a voice name to continue' :
                  'Record or upload audio to continue'}
            </p>
          )}
        </div>

        {/* ── RIGHT — Stats & Tips ── */}
        <div className="w-full lg:w-[240px] shrink-0 flex flex-col gap-3">

          {/* Recording Stats */}
          <div style={{
            background: 'var(--card-bg)', border: '1px solid var(--border)',
            borderRadius: '16px', padding: '16px',
          }}>
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '12px' }}>
              Recording Stats
            </div>

            {[
              {
                label: 'Status',
                value: recording ? 'Recording' : recordedBlob ? 'Ready ✓' : 'Idle',
                color: recording ? '#ef4444' : recordedBlob ? '#22d3a5' : 'var(--muted)',
              },
              { label: 'Duration', value: fmtTime(recSeconds), color: recSeconds > 0 ? '#f5c518' : 'var(--muted)' },
              { label: 'Quality', value: quality, color: qualityColor },
            ].map((row) => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{row.label}</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: row.color, fontFamily: 'Syne, sans-serif' }}>{row.value}</span>
              </div>
            ))}

            {/* Quality bar */}
            {recSeconds > 0 && (
              <div style={{ marginTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--muted)' }}>Quality Score</span>
                  <span style={{ fontSize: '10px', color: qualityColor, fontWeight: 700 }}>{Math.round(qualityPct)}%</span>
                </div>
                <div style={{ height: '3px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: '4px',
                    background: qualityColor,
                    width: `${qualityPct}%`,
                    transition: 'width 0.5s ease, background 0.3s ease',
                  }} />
                </div>
                <p style={{ fontSize: '10px', color: 'var(--muted)', margin: '5px 0 0', opacity: 0.6 }}>
                  {recSeconds < 10 ? 'Record at least 10s' : recSeconds < 30 ? '30s for best results' : 'Great quality!'}
                </p>
              </div>
            )}
          </div>

          {/* Tips */}
          <div style={{
            background: 'rgba(245,197,24,0.04)', border: '1px solid rgba(245,197,24,0.12)',
            borderRadius: '16px', padding: '16px',
          }}>
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '13px', color: '#f5c518', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Volume2 size={13} /> Recording Tips
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                ['🎙', 'Quiet room, no echo'],
                ['⏱', 'Speak for 30–60 seconds'],
                ['📖', 'Read naturally'],
                ['🔇', 'Avoid background noise'],
                ['📏', 'Mic 6–8 inches away'],
              ].map(([icon, tip]) => (
                <div key={tip} style={{ display: 'flex', gap: '7px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '12px', flexShrink: 0 }}>{icon}</span>
                  <span style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.4 }}>{tip}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Supported formats */}
          <div style={{
            background: 'var(--glass)', border: '1px solid var(--border)',
            borderRadius: '14px', padding: '14px',
          }}>
            <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)', margin: '0 0 8px' }}>
              Supported Formats
            </p>
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
              {['MP3', 'WAV', 'M4A', 'OGG'].map((fmt) => (
                <span key={fmt} style={{
                  padding: '2px 8px', borderRadius: '5px',
                  background: 'var(--card-bg)', border: '1px solid var(--border)',
                  fontSize: '10px', fontWeight: 700, color: 'var(--muted)',
                  fontFamily: 'monospace',
                }}>
                  {fmt}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse-rec {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
          50% { box-shadow: 0 0 0 16px rgba(239,68,68,0); }
        }
        @keyframes wave-bar {
          from { transform: scaleY(0.4); }
          to { transform: scaleY(1); }
        }
        input::placeholder { color: var(--muted); opacity: 0.5; }
      `}</style>
    </div>
  );
}