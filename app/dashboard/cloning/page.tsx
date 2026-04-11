'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import {
  Mic,
  Square,
  Play,
  Pause,
  RotateCcw,
  Upload,
  Check,
  ChevronRight,
  Zap,
} from 'lucide-react';

// ─── Types & Helpers ──────────────────────────────────────────────────────────
type Step = 1 | 2 | 3;

function fmtTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// ─── Step Indicator ───────────────────────────────────────────────────────────
function StepIndicator({ current }: { current: Step }) {
  const steps = [
    { n: 1, label: 'Name' },
    { n: 2, label: 'Record' },
    { n: 3, label: 'Clone' },
  ];
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
      {steps.map((s, i) => {
        const done = current > s.n;
        const active = current === s.n;
        return (
          <div key={s.n} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 'unset' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'Syne, sans-serif',
                  fontWeight: 700,
                  fontSize: '13px',
                  flexShrink: 0,
                  transition: 'all 0.25s ease',
                  background: done
                    ? 'rgba(34,211,165,0.15)'
                    : active
                    ? 'var(--accent)'
                    : 'var(--glass)',
                  border: done
                    ? '1.5px solid rgba(34,211,165,0.4)'
                    : active
                    ? 'none'
                    : '1.5px solid var(--border)',
                  color: done ? '#22d3a5' : active ? 'var(--bg)' : 'var(--muted)',
                  boxShadow: active ? '0 0 16px rgba(245,197,24,0.35)' : 'none',
                }}
              >
                {done ? <Check size={14} strokeWidth={3} /> : s.n}
              </div>
              <span
                style={{
                  fontSize: '12.5px',
                  fontWeight: active ? 700 : 500,
                  color: active ? 'var(--accent)' : done ? '#22d3a5' : 'var(--muted)',
                  fontFamily: 'DM Sans, sans-serif',
                  transition: 'color 0.2s ease',
                }}
              >
                {s.label}
              </span>
            </div>
            {i < 2 && (
              <div
                style={{
                  flex: 1,
                  height: '1px',
                  margin: '0 12px',
                  background: done
                    ? 'rgba(34,211,165,0.3)'
                    : 'var(--border)',
                  transition: 'background 0.3s ease',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function VoiceCloningPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

  // Step state
  const [step, setStep] = useState<Step>(1);

  // Step 1
  const [voiceName, setVoiceName] = useState('');
  const [nameError, setNameError] = useState('');

  // Step 2 — recording
  const [recording, setRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [recSeconds, setRecSeconds] = useState(0);
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const [uploadedName, setUploadedName] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 3
  const [cloning, setCloning] = useState(false);
  const [cloneSuccess, setCloneSuccess] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (error || !user) { router.push('/login'); return; }
      setUserId(user.id);
    });
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      previewAudioRef.current?.pause();
    };
  }, [router]);

  // ── Recording ──
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;

      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setRecordedBlob(blob);
        const url = URL.createObjectURL(blob);
        setRecordedUrl(url);
        stream.getTracks().forEach((t) => t.stop());
      };

      mr.start();
      setRecording(true);
      setRecSeconds(0);
      timerRef.current = setInterval(() => setRecSeconds((s) => s + 1), 1000);
    } catch (err) {
      console.error('Mic error:', err);
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
    setPreviewPlaying(false);
    setRecordedBlob(null);
    setRecordedUrl(null);
    setUploadedName(null);
    setRecSeconds(0);
  }, []);

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
      previewAudioRef.current.play().catch(console.error);
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
    previewAudioRef.current = new Audio(url);
    previewAudioRef.current.onended = () => setPreviewPlaying(false);
  };

  const handleClone = async () => {
    if (!userId || !recordedBlob) return;
    setCloning(true);
    try {
      const supabase = createClient();

      // Insert into cloned_voices
      const { data: clonedData } = await supabase
        .from('cloned_voices')
        .insert({
          user_id: userId,
          name: voiceName,
          audio_url: '',
          status: 'ready',
        })
        .select('id')
        .single();

      // Also insert into saved_voices so it shows on /dashboard/saved
      await supabase.from('saved_voices').upsert({
        user_id: userId,
        voice_id: clonedData?.id || crypto.randomUUID(),
        name: voiceName,
        language: null,
        gender: null,
        source: 'cloned',
        r2_url: null,
      });

      setCloneSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setCloning(false);
    }
  };

  // ── Recording stats for right panel ──
  const recStatus = recording ? 'Recording' : recordedBlob ? 'Complete' : 'Ready';
  const recQuality = recSeconds >= 30 ? 'Excellent' : recSeconds >= 10 ? 'Good' : '—';

  const qualityColor =
    recQuality === 'Excellent' ? '#22d3a5' : recQuality === 'Good' ? 'var(--accent)' : 'var(--muted)';

  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif' }}>

      {/* ── Page Header ── */}
      <div style={{ marginBottom: '28px' }}>
        <h1
          style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: '28px',
            fontWeight: 700,
            color: 'var(--text)',
            margin: '0 0 6px',
            letterSpacing: '-0.02em',
          }}
        >
          Voice Cloning
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0 }}>
          Create a perfect digital replica of any voice
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* ── LEFT COLUMN ── */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            background: 'var(--card-bg)',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            padding: '28px',
          }}
        >
          <StepIndicator current={step} />

          {/* ──────── STEP 1 ──────── */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--muted)',
                    marginBottom: '10px',
                  }}
                >
                  Voice Name
                </label>
                <input
                  value={voiceName}
                  onChange={(e) => { setVoiceName(e.target.value); setNameError(''); }}
                  placeholder="e.g. My Podcast Voice"
                  style={{
                    width: '100%',
                    background: 'var(--glass)',
                    border: `1px solid ${nameError ? 'rgba(255,80,80,0.5)' : 'var(--border)'}`,
                    borderRadius: '14px',
                    padding: '13px 16px',
                    color: 'var(--text)',
                    fontSize: '15px',
                    fontFamily: 'DM Sans, sans-serif',
                    outline: 'none',
                    boxSizing: 'border-box',
                    caretColor: '#f5c518',
                    transition: 'border-color 0.2s ease',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                  onBlur={(e) => (e.target.style.borderColor = nameError ? 'rgba(255,80,80,0.5)' : 'var(--border)')}
                />
                {nameError && (
                  <p style={{ fontSize: '12px', color: 'rgba(255,80,80,0.8)', margin: '6px 0 0' }}>{nameError}</p>
                )}
                <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '8px 0 0', opacity: 0.7 }}>
                  This name will appear in your Saved Voices.
                </p>
              </div>

              <button
                onClick={() => {
                  if (!voiceName.trim()) { setNameError('Please enter a name for your voice.'); return; }
                  setStep(2);
                }}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '14px',
                  background: 'var(--accent)',
                  border: 'none',
                  color: '#000',
                  fontFamily: 'Syne, sans-serif',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 0 24px rgba(245,197,24,0.25)',
                  letterSpacing: '-0.01em',
                }}
              >
                Continue
                <ChevronRight size={16} strokeWidth={2.5} />
              </button>
            </div>
          )}

          {/* ──────── STEP 2 ──────── */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Record area */}
              {!recordedBlob ? (
                <div
                  style={{
                  border: `2px dashed ${recording ? 'rgba(239,68,68,0.5)' : 'var(--border)'}`,
                  borderRadius: '20px',
                    padding: '48px 24px',
                    textAlign: 'center',
                    transition: 'border-color 0.3s ease',
                    background: recording ? 'rgba(239,68,68,0.03)' : 'transparent',
                  }}
                >
                  {/* Timer */}
                  <p
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '42px',
                      fontWeight: 700,
                      color: recording ? '#ef4444' : 'var(--accent)',
                      margin: '0 0 24px',
                      letterSpacing: '0.04em',
                      transition: 'color 0.3s ease',
                    }}
                  >
                    {fmtTime(recSeconds)}
                  </p>

                  {/* Record button */}
                  <button
                    onClick={recording ? stopRecording : startRecording}
                    style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: '50%',
                      background: recording ? '#ef4444' : 'rgba(239,68,68,0.15)',
                      border: `2px solid ${recording ? '#ef4444' : 'rgba(239,68,68,0.4)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      margin: '0 auto 16px',
                      transition: 'all 0.2s ease',
                      animation: recording ? 'pulse-red 1.2s ease-in-out infinite' : 'none',
                      boxShadow: recording ? '0 0 28px rgba(239,68,68,0.4)' : 'none',
                    }}
                  >
                    {recording
                      ? <Square size={26} color="#fff" fill="#fff" />
                      : <Mic size={28} color="#ef4444" strokeWidth={2} />}
                  </button>

                  <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0, opacity: 0.8 }}>
                    {recording ? 'Recording… click to stop' : 'Click to start recording'}
                  </p>
                </div>
              ) : (
                /* Audio preview */
                <div
                  style={{
                    background: 'rgba(34,211,165,0.06)',
                    border: '1px solid rgba(34,211,165,0.2)',
                    borderRadius: '18px',
                    padding: '24px',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '16px',
                    }}
                  >
                    <div>
                      <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '14px', color: '#22d3a5', margin: 0 }}>
                        {uploadedName ? '📁 ' + uploadedName : '🎙 Recording complete'}
                      </p>
                      {!uploadedName && (
                        <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '4px 0 0' }}>
                          Duration: {fmtTime(recSeconds)}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={reRecord}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '7px 12px',
                        borderRadius: '9px',
                        background: 'var(--glass)',
                        border: '1px solid var(--border)',
                        color: 'var(--muted)',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: 'DM Sans, sans-serif',
                      }}
                    >
                      <RotateCcw size={12} />
                      Re-record
                    </button>
                  </div>

                  {/* Play/pause */}
                  <button
                    onClick={togglePreview}
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '50%',
                      background: 'var(--accent)',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      margin: '0 auto',
                      boxShadow: '0 0 20px rgba(245,197,24,0.3)',
                    }}
                  >
                    {previewPlaying
                      ? <Pause size={20} color="var(--bg)" fill="var(--bg)" />
                      : <Play size={20} color="var(--bg)" fill="var(--bg)" style={{ marginLeft: '2px' }} />}
                  </button>
                </div>
              )}

              {/* OR divider */}
              {!recordedBlob && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                    <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600, letterSpacing: '0.08em', opacity: 0.5 }}>OR</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                  </div>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      width: '100%',
                      padding: '13px',
                      borderRadius: '14px',
                      background: 'var(--card-bg)',
                      border: '1px solid var(--border)',
                      color: 'var(--text)',
                      fontFamily: 'DM Sans, sans-serif',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    <Upload size={15} />
                    Upload Audio Instead
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".mp3,.wav,.m4a,.ogg,audio/*"
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                  />
                </>
              )}

              {/* Continue */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setStep(1)}
                  style={{
                    padding: '13px 20px',
                    borderRadius: '14px',
                    background: 'var(--glass)',
                    border: '1px solid var(--border)',
                    color: 'var(--muted)',
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Back
                </button>
                <button
                  onClick={() => { if (recordedBlob) setStep(3); }}
                  disabled={!recordedBlob}
                  style={{
                    flex: 1,
                    padding: '13px',
                    borderRadius: '14px',
                    background: recordedBlob ? 'var(--accent)' : 'var(--glass)',
                    border: 'none',
                    color: '#000',
                    fontFamily: 'Syne, sans-serif',
                    fontSize: '15px',
                    fontWeight: 700,
                    cursor: recordedBlob ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    letterSpacing: '-0.01em',
                    boxShadow: recordedBlob ? '0 0 24px rgba(245,197,24,0.25)' : 'none',
                  }}
                >
                  Continue
                  <ChevronRight size={16} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          )}

          {/* ──────── STEP 3 ──────── */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {cloneSuccess ? (
                /* Success state */
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: 'rgba(34,211,165,0.12)',
                      border: '2px solid rgba(34,211,165,0.35)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                    }}
                  >
                    <Check size={28} color="#22d3a5" strokeWidth={2.5} />
                  </div>
                  <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '20px', color: 'var(--text)', margin: '0 0 8px' }}>
                    Voice cloned successfully!
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '0 0 24px' }}>
                    "{voiceName}" has been saved to your library.
                  </p>
                  <Link
                    href="/dashboard/saved"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '7px',
                      padding: '12px 24px',
                      borderRadius: '12px',
                      background: 'var(--accent)',
                      color: '#000',
                      fontFamily: 'Syne, sans-serif',
                      fontWeight: 700,
                      fontSize: '14px',
                      textDecoration: 'none',
                      boxShadow: '0 0 20px rgba(245,197,24,0.3)',
                    }}
                  >
                    Go to Saved Voices
                    <ChevronRight size={15} strokeWidth={2.5} />
                  </Link>
                </div>
              ) : (
                /* Clone form */
                <>
                  {/* Summary */}
                  <div
                    style={{
                      background: 'var(--glass)',
                      border: '1px solid var(--border)',
                      borderRadius: '14px',
                      padding: '16px 18px',
                    }}
                  >
                    <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', margin: '0 0 10px' }}>Summary</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '0 0 3px' }}>Voice Name</p>
                        <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '16px', color: 'var(--text)', margin: 0 }}>{voiceName}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '0 0 3px' }}>Duration</p>
                        <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '16px', color: 'var(--accent)', margin: 0 }}>
                          {uploadedName ? '—' : fmtTime(recSeconds)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Back + Clone */}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => setStep(2)}
                      style={{
                        padding: '13px 20px',
                        borderRadius: '14px',
                        background: 'var(--glass)',
                        border: '1px solid var(--border)',
                        color: 'var(--muted)',
                        fontFamily: 'DM Sans, sans-serif',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Back
                    </button>
                    <button
                      onClick={handleClone}
                      disabled={cloning}
                      style={{
                        flex: 1,
                        padding: '14px',
                        borderRadius: '14px',
                        background: cloning ? 'var(--glass)' : 'var(--accent)',
                        border: 'none',
                        color: '#000',
                        fontFamily: 'Syne, sans-serif',
                        fontSize: '15px',
                        fontWeight: 700,
                        cursor: cloning ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: cloning ? 'none' : '0 0 24px rgba(245,197,24,0.3)',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {cloning ? (
                        <>
                          <div
                            style={{
                              width: '16px',
                              height: '16px',
                              border: '2px solid rgba(8,8,16,0.3)',
                              borderTop: '2px solid var(--bg)',
                              borderRadius: '50%',
                              animation: 'spin 0.7s linear infinite',
                            }}
                          />
                          Cloning your voice…
                        </>
                      ) : (
                        <>
                          🧬 Clone &amp; Save Voice
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="w-full lg:w-[300px] flex-shrink-0 flex flex-col gap-4">

          {/* Recording Stats */}
          <div
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border)',
              borderRadius: '18px',
              padding: '20px',
            }}
          >
            <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', margin: '0 0 16px' }}>
              Recording Stats
            </p>
            {[
              {
                label: 'Status',
                value: recStatus,
                color: recStatus === 'Recording' ? '#ef4444' : recStatus === 'Complete' ? '#22d3a5' : 'var(--muted)',
              },
              { label: 'Duration', value: fmtTime(recSeconds), color: 'var(--accent)' },
              { label: 'Quality', value: recQuality, color: qualityColor },
            ].map((row) => (
              <div
                key={row.label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 0',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <span style={{ fontSize: '12.5px', color: 'var(--muted)' }}>{row.label}</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: row.color, fontFamily: 'Syne, sans-serif' }}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          {/* Tips */}
          <div
            style={{
              background: 'rgba(245,197,24,0.06)',
              border: '1px solid rgba(245,197,24,0.15)',
              borderRadius: '18px',
              padding: '20px',
            }}
          >
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '14px', color: 'var(--accent)', margin: '0 0 14px' }}>
              💡 Recording Tips
            </p>
            <ul style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '9px' }}>
              {[
                'Record in a quiet room',
                'Speak naturally for 30–60 seconds',
                'Any text works — try reading an article',
                'Avoid background noise',
                'Keep mic 6–8 inches from mouth',
              ].map((tip) => (
                <li key={tip} style={{ fontSize: '12.5px', color: 'var(--muted)', lineHeight: 1.4 }}>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse-red {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
          50% { box-shadow: 0 0 0 14px rgba(239,68,68,0); }
        }
        input::placeholder { color: var(--muted); opacity: 0.5; }
      `}</style>
    </div>
  );
}
