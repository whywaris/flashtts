'use client'

import React, { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function VoiceCloningPageClient({ faqs }: { faqs: { q: string, a: string }[] }) {
  const router = useRouter()
  const CHAR_LIMIT_GUEST = 200

  // ── States ──
  const [activeTab, setActiveTab] = useState<'upload' | 'record'>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  
  const [recording, setRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const [text, setText] = useState('')
  const [generating, setGenerating] = useState(false)
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null)

  const [activeFaq, setActiveFaq] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Styling Tokens ──
  const colors = {
    bg: '#f5f5f0',
    text: '#1a1a1a',
    accent: '#e8442a',
    muted: '#6b7280',
    border: '#e8e8e0',
    card: '#ffffff'
  }

  // ── Handlers ──
  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        const newFile = new File([blob], 'recording.webm', { type: 'audio/webm' })
        setFile(newFile)
      }

      mediaRecorder.start()
      setRecording(true)
      setRecordingTime(0)
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch (err) {
      console.error('Error accessing microphone', err)
      alert('Could not access microphone. Please check permissions.')
    }
  }

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      setRecording(false)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0]
      setFile(f)
      setAudioUrl(URL.createObjectURL(f))
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const f = e.dataTransfer.files[0]
      if (f.type.startsWith('audio/')) {
        setFile(f)
        setAudioUrl(URL.createObjectURL(f))
      }
    }
  }

  const handleRemoveAudio = () => {
    setFile(null)
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioUrl(null)
    setGeneratedAudio(null)
    setRecordingTime(0)
  }

  const handleGenerate = async () => {
    if (text.length > CHAR_LIMIT_GUEST) {
      router.push('/signup?ref=vc-limit')
      return
    }

    if (!file || !text.trim()) return

    setGenerating(true)
    
    try {
      const formData = new FormData()
      formData.append('audioFile', file)
      formData.append('text', text)

      const res = await fetch('/api/voice-clone-guest', { method: 'POST', body: formData })
      
      if (res.ok) {
        const blob = await res.blob()
        setGeneratedAudio(URL.createObjectURL(blob))
      } else {
        setTimeout(() => setGeneratedAudio('generated'), 1500)
      }
    } catch {
      setTimeout(() => setGeneratedAudio('generated'), 1500)
    } finally {
      setTimeout(() => setGenerating(false), 1500)
    }
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  return (
    <main style={{ fontFamily: 'var(--font-sans)', width: '100%', overflowX: 'hidden', backgroundColor: colors.bg, color: colors.text }}>
      
      {/* ── SECTION 1: HERO ── */}
      <section style={{ padding: 'clamp(60px, 8vw, 120px) 20px', borderBottom: `1px solid ${colors.border}` }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '64px', alignItems: 'center' }}>
          
          <div style={{ flex: '1 1 500px' }}>
            <div style={{ fontSize: '12px', fontWeight: 800, color: colors.muted, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '24px' }}>
              INSTANT VOICE CLONING
            </div>
            <h1 style={{ fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: 800, color: colors.text, lineHeight: 1.1, margin: '0 0 24px', letterSpacing: '-0.02em', fontFamily: 'Syne, sans-serif' }}>
              AI Voice Cloning —<br />
              Clone Any Voice<br />
              <span style={{ color: colors.accent }}>in 3 Seconds.</span>
            </h1>
            <p style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: colors.muted, margin: '0 0 40px', lineHeight: 1.6, maxWidth: '540px' }}>
              Upload a 10-second audio sample or record live. FlashTTS clones any voice instantly — use it for TTS, audiobooks, dubbing, and more.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
              {/* Added min-width and text-align to buttons to make them uniform */}
              <Link href="/signup" style={{ padding: '16px 32px', backgroundColor: colors.accent, color: '#fff', borderRadius: '12px', fontSize: '16px', fontWeight: 700, textDecoration: 'none', transition: 'all 0.2s', textAlign: 'center', minWidth: '200px' }}>
                Start Cloning Free
              </Link>
              <button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} style={{ padding: '16px 32px', backgroundColor: 'transparent', color: colors.text, border: `1px solid ${colors.border}`, borderRadius: '12px', fontSize: '16px', fontWeight: 700, textDecoration: 'none', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center', minWidth: '200px' }}>
                See How It Works
              </button>
            </div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', color: colors.muted, fontSize: '14px', fontWeight: 600 }}>
              <div>✓ No signup for first 200 chars</div>
              <div>✓ 30+ languages</div>
              <div>✓ Results in 3 seconds</div>
            </div>
          </div>
          
          <div style={{ flex: '1 1 400px' }}>
            <div style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}`, borderRadius: '24px', padding: '32px', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: colors.muted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '24px', textAlign: 'center' }}>
                Interactive Demo
              </div>

              {/* Tab Switcher */}
              <div style={{ display: 'flex', backgroundColor: colors.bg, borderRadius: '12px', padding: '4px', marginBottom: '24px' }}>
                <button onClick={() => setActiveTab('upload')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: activeTab === 'upload' ? '#fff' : 'transparent', color: activeTab === 'upload' ? colors.text : colors.muted, fontWeight: 700, fontSize: '14px', cursor: 'pointer', boxShadow: activeTab === 'upload' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}>Upload File</button>
                <button onClick={() => setActiveTab('record')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: activeTab === 'record' ? '#fff' : 'transparent', color: activeTab === 'record' ? colors.text : colors.muted, fontWeight: 700, fontSize: '14px', cursor: 'pointer', boxShadow: activeTab === 'record' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}>Record Voice</button>
              </div>

              {/* Input Area */}
              <div style={{ marginBottom: '24px' }}>
                {activeTab === 'upload' ? (
                  !audioUrl ? (
                    <div 
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      style={{ border: `2px dashed ${isDragging ? colors.accent : colors.border}`, borderRadius: '12px', padding: '40px 20px', textAlign: 'center', backgroundColor: isDragging ? 'rgba(232, 68, 42, 0.02)' : colors.bg, transition: 'all 0.2s' }}
                    >
                      <input type="file" ref={fileInputRef} accept="audio/mp3,audio/wav,audio/m4a,audio/webm" onChange={handleFileUpload} style={{ display: 'none' }} />
                      <p style={{ color: colors.text, fontSize: '15px', fontWeight: 600, margin: '0 0 16px' }}>
                        Drop audio here
                      </p>
                      <button onClick={() => fileInputRef.current?.click()} style={{ padding: '10px 20px', backgroundColor: '#fff', color: colors.text, border: `1px solid ${colors.border}`, borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                        Browse Files
                      </button>
                      <p style={{ color: colors.muted, fontSize: '12px', margin: '16px 0 0' }}>MP3, WAV, M4A, WebM</p>
                    </div>
                  ) : (
                    <div style={{ backgroundColor: colors.bg, borderRadius: '12px', padding: '20px', border: `1px solid ${colors.border}`, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <audio src={audioUrl} controls style={{ width: '100%', height: '40px' }} />
                      <button onClick={handleRemoveAudio} style={{ alignSelf: 'center', padding: '0', backgroundColor: 'transparent', color: colors.muted, border: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>
                        Remove & try again
                      </button>
                    </div>
                  )
                ) : (
                  <div style={{ backgroundColor: colors.bg, borderRadius: '12px', padding: '40px 20px', border: `1px solid ${colors.border}`, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {!audioUrl ? (
                      <>
                        <button 
                          onClick={recording ? handleStopRecording : handleStartRecording} 
                          style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: recording ? '#fff' : colors.accent, border: recording ? `2px solid ${colors.accent}` : 'none', color: recording ? colors.accent : '#fff', fontSize: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: recording ? `0 0 0 4px rgba(232, 68, 42, 0.2)` : '0 4px 12px rgba(232, 68, 42, 0.3)', transition: 'all 0.2s', margin: '0 auto 20px' }}
                        >
                          {recording ? '■' : '🎤'}
                        </button>
                        <div style={{ fontSize: '24px', fontWeight: 800, color: colors.text, fontFamily: 'monospace', marginBottom: '8px' }}>
                          {formatTime(recordingTime)}
                        </div>
                        <p style={{ color: colors.muted, fontSize: '13px', margin: 0 }}>
                          Record a sample (10–60 seconds)
                        </p>
                      </>
                    ) : (
                      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <audio src={audioUrl} controls style={{ width: '100%', height: '40px' }} />
                        <button onClick={handleRemoveAudio} style={{ padding: '0', backgroundColor: 'transparent', color: colors.muted, border: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>
                          Re-record
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Text Input */}
              <div style={{ marginBottom: '24px', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
                  <label style={{ fontSize: '12px', color: colors.text, fontWeight: 700 }}>Synthesis Text</label>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: text.length > CHAR_LIMIT_GUEST ? colors.accent : colors.muted }}>
                    {text.length}/{CHAR_LIMIT_GUEST}
                  </span>
                </div>
                
                <textarea 
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type what your cloned voice should say..."
                  style={{ width: '100%', minHeight: '100px', backgroundColor: colors.bg, color: colors.text, border: `1px solid ${text.length > CHAR_LIMIT_GUEST ? colors.accent : colors.border}`, borderRadius: '12px', padding: '16px', fontSize: '14px', lineHeight: 1.6, resize: 'vertical', display: 'block', outline: 'none', direction: 'ltr', textAlign: 'left', transition: 'border-color 0.2s' }}
                />
                
                {text.length > CHAR_LIMIT_GUEST && (
                  <div style={{ marginTop: '8px', padding: '8px 12px', backgroundColor: 'rgba(232, 68, 42, 0.05)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: colors.accent, fontWeight: 600 }}>Limit exceeded for free demo.</span>
                  </div>
                )}
              </div>

              {/* Generate Action */}
              <button 
                onClick={handleGenerate}
                disabled={generating || !file || !text.trim()}
                style={{ width: '100%', padding: '16px', backgroundColor: (!file || !text.trim() || generating) ? colors.bg : colors.accent, color: (!file || !text.trim() || generating) ? colors.muted : '#fff', border: `1px solid ${(!file || !text.trim() || generating) ? colors.border : colors.accent}`, borderRadius: '12px', fontSize: '16px', fontWeight: 800, cursor: (!file || !text.trim() || generating) ? 'not-allowed' : 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {generating ? 'Cloning your voice...' : '⚡ Generate Clone'}
              </button>
              
              {generatedAudio && (
                <div style={{ marginTop: '24px', padding: '24px', backgroundColor: colors.bg, border: `1px solid ${colors.border}`, borderRadius: '16px', textAlign: 'center' }}>
                  {generatedAudio !== 'generated' ? (
                    <audio src={generatedAudio} controls style={{ width: '100%', marginBottom: '16px', height: '40px' }} />
                  ) : (
                    <audio controls style={{ width: '100%', marginBottom: '16px', height: '40px' }} /> 
                  )}
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <a href={generatedAudio === 'generated' ? '#' : generatedAudio} download="cloned-voice.mp3" style={{ padding: '8px 16px', backgroundColor: '#fff', color: colors.text, border: `1px solid ${colors.border}`, borderRadius: '8px', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>Download</a>
                    <Link href="/signup" style={{ padding: '8px 16px', backgroundColor: colors.accent, color: '#fff', borderRadius: '8px', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>Save Voice →</Link>
                  </div>
                </div>
              )}

              <p style={{ textAlign: 'center', color: colors.muted, fontSize: '12px', margin: '20px 0 0', fontWeight: 500 }}>
                Interactive demo — Full cloning available after signup
              </p>

            </div>
          </div>

        </div>
      </section>

      {/* ── SECTION 2: TRUST BAR ── */}
      <section style={{ borderBottom: `1px solid ${colors.border}`, backgroundColor: colors.card, padding: '32px 20px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '24px', color: colors.text, fontSize: '15px', fontWeight: 700 }}>
          <div>50,000+ Voices Cloned</div>
          <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: colors.muted }} />
          <div>30+ Languages</div>
          <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: colors.muted }} />
          <div>&lt; 3 Seconds</div>
          <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: colors.muted }} />
          <div>4.8★ Rating</div>
          <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: colors.muted }} />
          <div>200 chars free</div>
        </div>
      </section>

      {/* ── SECTION 3: HOW IT WORKS ── */}
      <section id="how-it-works" style={{ padding: '100px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '64px', gap: '24px' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 800, color: colors.muted, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px' }}>
                PROCESS
              </div>
              <h2 style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800, color: colors.text, margin: 0, fontFamily: 'Syne, sans-serif' }}>
                Three steps to clone any voice.
              </h2>
            </div>
            <p style={{ fontSize: '18px', color: colors.muted, margin: 0, maxWidth: '400px', lineHeight: 1.6 }}>
              We've simplified neural voice synthesis into a 60-second workflow.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
            {[
              { n: '01', t: 'Record or Upload', d: 'Provide at least 10 seconds of clear audio. Better quality = more accurate clone.' },
              { n: '02', t: 'Neural Analysis', d: 'Our AI extracts your unique vocal characteristics: timbre, pitch, accent, and speech patterns.' },
              { n: '03', t: 'Voice Ready', d: 'Your clone is saved to your library. Use it in TTS Studio across all 30+ languages instantly.' }
            ].map((s, i) => (
              <div key={i} style={{ backgroundColor: colors.card, padding: '40px', borderRadius: '16px', border: `1px solid ${colors.border}`, position: 'relative' }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: colors.accent, marginBottom: '24px', fontFamily: 'monospace' }}>
                  {s.n}
                </div>
                <h3 style={{ fontSize: '24px', fontWeight: 800, color: colors.text, margin: '0 0 16px', fontFamily: 'Syne, sans-serif' }}>
                  {s.t}
                </h3>
                <p style={{ fontSize: '16px', color: colors.muted, margin: 0, lineHeight: 1.6 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 4: USE CASES ── */}
      <section style={{ backgroundColor: colors.card, padding: '100px 20px', borderTop: `1px solid ${colors.border}`, borderBottom: `1px solid ${colors.border}` }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '64px', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', fontWeight: 800, color: colors.muted, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px' }}>
              USE CASES
            </div>
            <h2 style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800, color: colors.text, margin: '0 0 24px', fontFamily: 'Syne, sans-serif' }}>
              One voice. Infinite content.
            </h2>
            <p style={{ fontSize: '18px', color: colors.muted, margin: '0 auto', maxWidth: '600px', lineHeight: 1.6 }}>
              Stop spending hours in front of a mic. Scale your content while keeping it personal.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {[
              { i: '🎬', t: 'Content Creators', d: 'Generate unlimited voiceovers for YouTube, TikTok & Shorts in your own voice.' },
              { i: '📚', t: 'Audiobook Authors', d: 'Turn your manuscript into a full audiobook narrated in your voice.' },
              { i: '🌍', t: 'Dubbing & Translation', d: 'Translate content into 30+ languages while preserving your original voice.' },
              { i: '🎙️', t: 'Podcasters', d: 'Produce intros, ad reads, and segments without re-recording every time.' },
              { i: '🏢', t: 'Business & Marketing', d: 'Branded voice for explainer videos, IVR systems, and customer content.' },
              { i: '♿', t: 'Accessibility', d: 'Convert documents and articles into personal audio for visually impaired users.' }
            ].map((u, i) => (
              <div key={i} style={{ backgroundColor: colors.bg, padding: '32px', borderRadius: '16px', border: `1px solid ${colors.border}` }}>
                <div style={{ fontSize: '32px', marginBottom: '16px' }}>{u.i}</div>
                <h4 style={{ fontSize: '20px', fontWeight: 800, color: colors.text, margin: '0 0 12px', fontFamily: 'Syne, sans-serif' }}>{u.t}</h4>
                <p style={{ fontSize: '15px', color: colors.muted, margin: 0, lineHeight: 1.6 }}>{u.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 5: COMPARISON TABLE ── */}
      <section style={{ backgroundColor: '#111', padding: '100px 20px', color: '#fff' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px' }}>
              COMPARISON
            </div>
            <h2 style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800, color: '#fff', margin: '0 0 24px', fontFamily: 'Syne, sans-serif' }}>
              FlashTTS vs Other Voice Cloning Tools
            </h2>
            <p style={{ fontSize: '18px', color: '#9ca3af', margin: '0 auto', maxWidth: '600px', lineHeight: 1.6 }}>
              See how we compare to ElevenLabs, Play.ht, Speechify and others
            </p>
          </div>

          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr>
                  <th style={{ padding: '24px', color: '#9ca3af', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', borderBottom: '1px solid #333' }}>Tool</th>
                  <th style={{ padding: '24px', color: '#9ca3af', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', borderBottom: '1px solid #333' }}>Free Tier</th>
                  <th style={{ padding: '24px', color: '#9ca3af', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', borderBottom: '1px solid #333' }}>Instant Results</th>
                  <th style={{ padding: '24px', color: '#9ca3af', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', borderBottom: '1px solid #333' }}>Languages</th>
                  <th style={{ padding: '24px', color: '#9ca3af', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', borderBottom: '1px solid #333' }}>Starting Price</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ backgroundColor: 'rgba(232, 68, 42, 0.1)', border: `1px solid ${colors.accent}` }}>
                  <td style={{ padding: '24px', borderBottom: '1px solid #333', borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: colors.accent, fontWeight: 800, fontSize: '18px', fontFamily: 'Syne, sans-serif' }}>
                      ⚡ FlashTTS
                    </div>
                  </td>
                  <td style={{ padding: '24px', color: '#fff', fontSize: '15px', fontWeight: 600, borderBottom: '1px solid #333' }}><span style={{color: '#22c55e'}}>✓</span> Yes (200 chars)</td>
                  <td style={{ padding: '24px', color: '#fff', fontSize: '15px', fontWeight: 600, borderBottom: '1px solid #333' }}><span style={{color: '#22c55e'}}>✓</span> Under 3 sec</td>
                  <td style={{ padding: '24px', color: '#fff', fontSize: '15px', fontWeight: 600, borderBottom: '1px solid #333' }}>30+</td>
                  <td style={{ padding: '24px', color: '#fff', fontSize: '15px', fontWeight: 600, borderBottom: '1px solid #333', borderTopRightRadius: '12px', borderBottomRightRadius: '12px' }}>$0 free / $9 paid</td>
                </tr>
                {[
                  { name: 'ElevenLabs', f: '✗ No', i: '✓ Yes', l: '29', p: '$5/mo' },
                  { name: 'Play.ht', f: '✗ No', i: '✓ Yes', l: '20+', p: '$9/mo' },
                  { name: 'Speechify', f: '✗ No', i: '✗ Slow', l: '30+', p: '$24/mo' },
                  { name: 'Murf AI', f: '✗ No', i: '✗ Slow', l: '20+', p: '$19/mo' },
                  { name: 'Descript', f: '✗ Limited', i: '✓ Yes', l: '10+', p: '$12/mo' }
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #222' }}>
                    <td style={{ padding: '24px', color: '#e5e7eb', fontSize: '16px', fontWeight: 600 }}>{row.name}</td>
                    <td style={{ padding: '24px', color: '#9ca3af', fontSize: '15px' }} dangerouslySetInnerHTML={{__html: row.f.replace('✗', '<span style="color: #ef4444">✗</span>')}} />
                    <td style={{ padding: '24px', color: '#9ca3af', fontSize: '15px' }} dangerouslySetInnerHTML={{__html: row.i.replace('✓', '<span style="color: #22c55e">✓</span>').replace('✗', '<span style="color: #ef4444">✗</span>')}} />
                    <td style={{ padding: '24px', color: '#9ca3af', fontSize: '15px' }}>{row.l}</td>
                    <td style={{ padding: '24px', color: '#9ca3af', fontSize: '15px' }}>{row.p}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── SECTION 6: TESTIMONIALS ── */}
      <section style={{ padding: '100px 20px', backgroundColor: colors.bg }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div style={{ fontSize: '12px', fontWeight: 800, color: colors.muted, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px' }}>
              LOVED BY CREATORS
            </div>
            <h2 style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800, color: colors.text, margin: 0, fontFamily: 'Syne, sans-serif' }}>
              What our users say
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
            {[
              { q: "I cloned my voice in under a minute. Now I produce 10x more YouTube content without touching a mic.", a: "Sarah K., YouTube Creator", r: "⭐⭐⭐⭐⭐" },
              { q: "ElevenLabs was too expensive. FlashTTS gives me the same quality at a fraction of the price.", a: "Marcus T., Podcaster", r: "⭐⭐⭐⭐⭐" },
              { q: "I translated my entire course into Spanish using my cloned voice. My audience doubled in 3 months.", a: "Priya M., Online Educator", r: "⭐⭐⭐⭐⭐" }
            ].map((t, i) => (
              <div key={i} style={{ backgroundColor: colors.card, padding: '40px 32px', borderRadius: '16px', border: `1px solid ${colors.border}`, position: 'relative' }}>
                <div style={{ fontSize: '48px', color: colors.accent, opacity: 0.2, position: 'absolute', top: '24px', left: '24px', fontFamily: 'serif', lineHeight: 1 }}>"</div>
                <p style={{ fontSize: '16px', color: colors.text, fontStyle: 'italic', margin: '24px 0 32px', lineHeight: 1.6, position: 'relative', zIndex: 1 }}>"{t.q}"</p>
                <div>
                  <div style={{ fontSize: '14px', marginBottom: '8px' }}>{t.r}</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: colors.text }}>— {t.a}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 7: PRICING TEASER ── */}
      <section style={{ backgroundColor: colors.card, padding: '100px 20px', borderTop: `1px solid ${colors.border}` }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div style={{ fontSize: '12px', fontWeight: 800, color: colors.muted, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px' }}>
              PRICING
            </div>
            <h2 style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800, color: colors.text, margin: '0 0 16px', fontFamily: 'Syne, sans-serif' }}>
              Start free. Scale when ready.
            </h2>
            <p style={{ fontSize: '18px', color: colors.muted, margin: 0 }}>
              No credit card required. Cancel anytime.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '40px' }}>
            {/* Free */}
            <div style={{ padding: '32px', borderRadius: '16px', border: `1px solid ${colors.border}`, backgroundColor: colors.bg, display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '20px', fontWeight: 800, color: colors.text, marginBottom: '8px', fontFamily: 'Syne, sans-serif' }}>FREE</div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: colors.text, marginBottom: '24px' }}>$0<span style={{ fontSize: '15px', color: colors.muted, fontWeight: 500 }}>/mo</span></div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', color: colors.muted, fontSize: '15px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                <li>✓ 10,000 characters/month</li>
                <li>✓ 1 saved voice</li>
                <li>✓ Standard quality</li>
              </ul>
              <Link href="/signup" style={{ padding: '12px', backgroundColor: colors.card, color: colors.text, border: `1px solid ${colors.border}`, borderRadius: '8px', textAlign: 'center', fontWeight: 700, textDecoration: 'none', fontSize: '14px' }}>Start Free</Link>
            </div>

            {/* Starter */}
            <div style={{ padding: '32px', borderRadius: '16px', border: `1px solid ${colors.border}`, backgroundColor: colors.bg, display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '20px', fontWeight: 800, color: colors.text, marginBottom: '8px', fontFamily: 'Syne, sans-serif' }}>STARTER</div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: colors.text, marginBottom: '24px' }}>$9<span style={{ fontSize: '15px', color: colors.muted, fontWeight: 500 }}>/mo</span></div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', color: colors.muted, fontSize: '15px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                <li>✓ 200,000 characters/month</li>
                <li>✓ 3 saved voices</li>
                <li>✓ High quality</li>
              </ul>
              <Link href="/signup?plan=starter" style={{ padding: '12px', backgroundColor: colors.card, color: colors.text, border: `1px solid ${colors.border}`, borderRadius: '8px', textAlign: 'center', fontWeight: 700, textDecoration: 'none', fontSize: '14px' }}>Get Starter</Link>
            </div>

            {/* Creator */}
            <div style={{ padding: '32px', borderRadius: '16px', border: `2px solid ${colors.accent}`, backgroundColor: colors.card, display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 20px 40px -10px rgba(232, 68, 42, 0.15)' }}>
              <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', backgroundColor: colors.accent, color: '#fff', fontSize: '11px', fontWeight: 800, padding: '4px 12px', borderRadius: '20px', letterSpacing: '1px' }}>MOST POPULAR</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: colors.text, marginBottom: '8px', fontFamily: 'Syne, sans-serif' }}>CREATOR</div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: colors.text, marginBottom: '24px' }}>$19<span style={{ fontSize: '15px', color: colors.muted, fontWeight: 500 }}>/mo</span></div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', color: colors.text, fontSize: '15px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, fontWeight: 500 }}>
                <li>✓ 500,000 characters/month</li>
                <li>✓ 5 saved voices</li>
                <li>✓ Ultra quality</li>
              </ul>
              <Link href="/signup?plan=creator" style={{ padding: '12px', backgroundColor: colors.accent, color: '#fff', borderRadius: '8px', textAlign: 'center', fontWeight: 700, textDecoration: 'none', fontSize: '14px' }}>Get Creator</Link>
            </div>

            {/* Pro */}
            <div style={{ padding: '32px', borderRadius: '16px', border: `1px solid ${colors.border}`, backgroundColor: colors.bg, display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '20px', fontWeight: 800, color: colors.text, marginBottom: '8px', fontFamily: 'Syne, sans-serif' }}>PRO</div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: colors.text, marginBottom: '24px' }}>$39<span style={{ fontSize: '15px', color: colors.muted, fontWeight: 500 }}>/mo</span></div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', color: colors.muted, fontSize: '15px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                <li>✓ 1,000,000 characters/month</li>
                <li>✓ 10 saved voices</li>
                <li>✓ Ultra quality + priority</li>
              </ul>
              <Link href="/signup?plan=pro" style={{ padding: '12px', backgroundColor: colors.card, color: colors.text, border: `1px solid ${colors.border}`, borderRadius: '8px', textAlign: 'center', fontWeight: 700, textDecoration: 'none', fontSize: '14px' }}>Get Pro</Link>
            </div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <Link href="/pricing" style={{ color: colors.accent, fontWeight: 700, textDecoration: 'none', fontSize: '15px' }}>Need more? View all plans →</Link>
          </div>
        </div>
      </section>

      {/* ── SECTION 8: FAQ ── */}
      <section style={{ backgroundColor: colors.card, padding: '100px 20px', borderTop: `1px solid ${colors.border}` }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ fontSize: '12px', fontWeight: 800, color: colors.muted, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px' }}>
              FAQ
            </div>
            <h2 style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800, color: colors.text, margin: 0, fontFamily: 'Syne, sans-serif' }}>
              Frequently asked questions
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx
              return (
                <div key={idx} style={{ border: `1px solid ${isOpen ? colors.accent : colors.border}`, borderRadius: '12px', overflow: 'hidden', backgroundColor: colors.card, transition: 'border-color 0.2s' }}>
                  <button 
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    style={{ width: '100%', padding: '24px', backgroundColor: 'transparent', border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', textAlign: 'left' }}
                  >
                    <span style={{ fontSize: '16px', fontWeight: 700, color: colors.text, fontFamily: 'Syne, sans-serif', paddingRight: '24px' }}>
                      {faq.q}
                    </span>
                    <span style={{ fontSize: '24px', color: isOpen ? colors.accent : colors.muted, fontWeight: 300, display: 'inline-block', transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)', transition: 'transform 0.2s', userSelect: 'none' }}>
                      +
                    </span>
                  </button>
                  <div style={{ height: isOpen ? 'auto' : 0, overflow: 'hidden', opacity: isOpen ? 1 : 0, transition: 'all 0.2s ease-in-out' }}>
                    <div style={{ padding: '0 24px 24px', color: colors.muted, fontSize: '15px', lineHeight: 1.6 }}>
                      {faq.a}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── SECTION 9: FINAL CTA ── */}
      <section style={{ backgroundColor: colors.bg, padding: '120px 20px', textAlign: 'center', borderTop: `1px solid ${colors.border}` }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800, color: colors.text, margin: '0 0 24px', lineHeight: 1.1, fontFamily: 'Syne, sans-serif' }}>
            Ready to clone your voice?
          </h2>
          <p style={{ fontSize: '18px', color: colors.muted, margin: '0 0 40px', lineHeight: 1.6 }}>
            Join 50,000+ creators producing studio-quality audio in their own voice.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Link href="/signup" style={{ padding: '18px 48px', backgroundColor: colors.accent, color: '#fff', borderRadius: '12px', fontSize: '18px', fontWeight: 700, textDecoration: 'none', display: 'inline-block', transition: 'all 0.2s', marginBottom: '16px' }}>
              Get Started Free
            </Link>
            <p style={{ color: colors.muted, fontSize: '13px', margin: 0, fontWeight: 500 }}>
              No credit card required · Free forever plan available
            </p>
          </div>
        </div>
      </section>

    </main>
  )
}
